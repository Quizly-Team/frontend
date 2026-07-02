#!/usr/bin/env bash
#
# Quizly AI session logger.
#
# Reads the Claude Code hook JSON payload from stdin and appends one JSONL
# line per event to logs/ai/<YYYY-MM-DD>_<session-id>.jsonl.
#
# Invoked from .claude/settings.json on SessionStart, UserPromptSubmit,
# PreToolUse, PostToolUse, Stop, and SubagentStop. The first argument is the
# event label. Exit code is always 0 — logging must never block Claude.

set -u

EVENT_LABEL="${1:-unknown}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_DIR="$PROJECT_DIR/logs/ai"

mkdir -p "$LOG_DIR" 2>/dev/null || exit 0

PAYLOAD="$(cat 2>/dev/null || true)"

SESSION_ID="$(printf '%s' "$PAYLOAD" | /usr/bin/env jq -r '.session_id // empty' 2>/dev/null)"
if [ -z "$SESSION_ID" ]; then
  SESSION_ID="${CLAUDE_SESSION_ID:-nosession}"
fi

DATE_UTC="$(date -u +%Y-%m-%d)"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LOG_FILE="$LOG_DIR/${DATE_UTC}_${SESSION_ID}.jsonl"

# Compose one canonical JSONL line. Fall back gracefully if jq is missing.
if command -v jq >/dev/null 2>&1; then
  printf '%s' "$PAYLOAD" | jq -c \
    --arg ts "$TS_UTC" \
    --arg event "$EVENT_LABEL" \
    '{
      ts: $ts,
      event: $event,
      session_id: (.session_id // null),
      cwd: (.cwd // null),
      hook_event_name: (.hook_event_name // null),
      tool_name: (.tool_name // null),
      tool_input: (.tool_input // null),
      tool_response: (.tool_response // null),
      prompt: (.prompt // null),
      stop_reason: (.stop_reason // null)
    }' >> "$LOG_FILE" 2>/dev/null
else
  printf '{"ts":"%s","event":"%s","raw":%s}\n' \
    "$TS_UTC" "$EVENT_LABEL" \
    "$(printf '%s' "$PAYLOAD" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '""')" \
    >> "$LOG_FILE" 2>/dev/null
fi

exit 0
