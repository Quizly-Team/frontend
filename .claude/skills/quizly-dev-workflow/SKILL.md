---
name: quizly-dev-workflow
description: >
  Quizly 개발 작업을 도메인분석 → 리서치 → 계획 → (승인) → 구현 → 검증(diff리뷰 + 통합QA)
  하이브리드 파이프라인으로 조율하는 오케스트레이터. 계획은 순차 서브에이전트(domain-analyst,
  researcher, planner), 구현은 레이어 전문가 에이전트 팀(data-engineer, page-integrator,
  ui-engineer)이 실시간 협업, 검증은 독립 서브에이전트(reviewer, integration-qa)로 운영한다.
  네 가지 작업 유형 — 기능 개발, 통합 정합성 QA, 버그 수정/리팩토링,
  디자인 구현(Figma→코드) — 을 모두 이 워크플로우로 처리한다.
  트리거 — "이 이슈 작업해줘", "#NNN 구현해줘", "기능 만들어줘", "버그 고쳐줘",
  "리팩토링 해줘", "이 페이지 디자인 구현", "통합 QA 돌려줘", "API랑 훅 정합성 봐줘",
  "도메인 분석/리서치/계획/구현/리뷰/QA 해줘", 그리고 후속 — "다시 실행", "재실행",
  "업데이트", "수정", "보완", "리뷰 지적사항 반영", "QA 지적 반영", "계획만 다시",
  "검증만 다시", "이전 결과 기반으로". 단순 질문은 직접 답하고, 실제 코드 변경 또는
  통합 검증을 동반하는 개발 작업일 때 이 워크플로우를 사용한다.
---

# Quizly 개발 워크플로우 오케스트레이터

한 개발 작업(이슈 `#NNN`)을 6개 독립 서브에이전트의 **파이프라인 + 생성-검증 루프**로 처리한다. 핵심 가치는 **컨텍스트 격리**: 각 역할은 별도 서브에이전트로 자기 컨텍스트 윈도우를 가지며, 산출물 파일로만 핸드오프한다. 특히 **Reviewer와 integration-qa는 Builder의 추론을 절대 받지 않고** diff와 plan만 본다 — 이것이 "구현과 검증의 독립 운영"을 보장한다.

대상 스택: React 19 + Vite + TypeScript, TanStack Query 5, Zustand, MUI 7 + Tailwind 4, React Router 7, REST API(`apiClient`). **자동화된 테스트 러너는 없다** — 검증 게이트는 `npm run build`(tsc -b 타입체크 + vite build) + `npm run lint` + 수동 클릭스루 + 통합 QA의 경계면 교차검증으로 구성된다.

## 실행 모드: 하이브리드 (계획=파이프라인 · 구현=에이전트 팀 · 검증=독립 서브에이전트)

quizly의 기능은 레이어를 수직 관통하고(api→types→hook→page→component), 지배적 버그는 그 레이어 경계면 불일치다. 그래서 **구현 단계만 에이전트 팀**으로 운영해 레이어 전문가들이 실시간 통신(SendMessage)으로 응답 shape을 공유하며 경계면 버그를 발생 지점에서 차단한다. 반면 **계획은 순차 파이프라인**, **검증은 독립 서브에이전트**(맥락 격리로 검증 독립성 확보)로 둔다. 모든 Agent/팀원은 `model: "opus"`.

| 단계            | 모드        | 에이전트                                         | 산출물/전달                    |
| --------------- | ----------- | ------------------------------------------------ | ------------------------------ |
| 1. 도메인분석   | 서브(read)  | `domain-analyst`                                 | `docs/ai/domain/#NNN.md`       |
| 2. 리서치       | 서브(read)  | `researcher`                                     | `docs/ai/research/#NNN.md`     |
| 3. 계획         | 서브        | `planner`                                        | `docs/ai/plan/#NNN.md`         |
| — 승인 게이트 — | (사람)      | —                                                | plan `approved: true`          |
| 4. 구현         | **팀**      | `data-engineer` · `page-integrator` · `ui-engineer` | 소스 변경 + SendMessage 조율 |
| 5a. diff 검증   | 서브(read)  | `reviewer`                                        | `docs/ai/review/#NNN.md`       |
| 5b. 통합 QA     | 서브        | `integration-qa`                                  | `docs/ai/qa/#NNN.md`           |

**솔로 폴백:** 단일 레이어만 건드리는 사소한 변경(예: 카피 한 줄, 토큰 하나)은 팀 오버헤드가 과하다 — `builder` 서브에이전트 하나로 처리해도 된다.

## Phase 0: 컨텍스트 확인 (시작 시 항상)

1. 이슈 번호 `#NNN`을 파악한다. 없으면 사용자에게 묻고 멈춘다.
2. 작업 유형을 파악한다 (네 유형 모두 같은 파이프라인, 진입 강조점만 다름):
   - **기능 개발** — domain-analyst부터 전체 파이프라인.
   - **버그 수정/리팩토링** — domain은 가볍게, researcher가 원인·영향 추적에 집중.
   - **디자인 구현(Figma→코드)** — researcher가 Figma MCP(`get_design_context`/`get_screenshot`/`get_metadata`)로 디자인 컨텍스트를 함께 수집, planner가 컴포넌트/토큰 매핑을 명시, 빌드 팀(주로 ui-engineer가 `frontend-design` 참조) 구현 후 reviewer + integration-qa 검증.
   - **통합 정합성 QA만** — 코드 변경 없이 `integration-qa`만 단독 호출(전체 또는 지정 모듈 감사). plan/review 단계 생략 가능.
3. 기존 아티팩트 존재를 확인한다 (`docs/ai/{domain,research,plan,review,qa}/#NNN.md`):
   - **초기 실행**: 아티팩트 없음 → Phase 1부터.
   - **부분 재실행**: 사용자가 "계획만 다시"·"검증만 다시"·"리뷰/QA 지적 반영" 등 특정 단계 지목 → 해당 에이전트만 재호출.
   - **이어가기**: 일부 아티팩트만 존재 → 다음 빈 단계부터.
4. 사용자에게 어느 모드로 갈지 한 줄로 확인하고 진행한다.

## 파이프라인 진행 규칙

순차 의존이다. 앞 단계 산출물이 없으면 다음 단계를 시작하지 않는다.

1. **domain-analyst** 호출 → `docs/ai/domain/#NNN.md`. 사용자에게 검토 기회를 주고 다음으로.
2. **researcher** 호출 (domain 브리프를 입력으로) → `docs/ai/research/#NNN.md`.
3. **planner** 호출 → `docs/ai/plan/#NNN.md`. 사용자가 인라인 노트를 남기면 `planner`를 "address all notes"로 재호출하는 주석 사이클을 돈다.
4. **승인 게이트 (사람 전용)**: plan의 section 1·2를 사용자에게 보여주고 명시적 `yes`를 받는다. `yes`일 때만 plan frontmatter를 `status: approved` / `approved: true` / `approved_by` / `approved_at`로 갱신한다. 승인 없이는 빌드 팀(또는 builder)을 호출하지 않는다.
5. **구현 팀** 구성 → 승인된 plan을 레이어별로 분담해 구현 (아래 "빌드 팀 운영" 참조). plan 스텝마다 `npm run build` / `npm run lint` 검증.
6. **reviewer** + **integration-qa** 호출 → diff/plan 기반 검증. 5b는 모듈 완성마다 점진적으로(incremental QA) 돌리는 것을 권장한다.

## 빌드 팀 운영 (구현 단계 = 에이전트 팀)

오케스트레이터가 리더가 되어 팀을 구성하고 plan을 레이어별 작업으로 분배한다. 팀원은 SendMessage로 자체 조율한다.

```
[오케스트레이터/리더]
  ├── TeamCreate(team: "quizly-build", members: [data-engineer, page-integrator, ui-engineer])
  ├── TaskCreate(plan §3·§4를 레이어별 작업으로 — 의존관계 명시)
  │     · data-engineer: api/types/hooks  (대개 먼저 — shape의 출처)
  │     · page-integrator: pages/router/state
  │     · ui-engineer: components/styling
  ├── 팀원 자체 조율 (SendMessage):
  │     · data-engineer가 훅 contract(시그니처+응답 shape)를 정의 즉시 브로드캐스트  ← 경계면 버그 차단 핵심
  │     · page-integrator는 shape를 추측 말고 data-engineer에 요청
  │     · ui-engineer ↔ page-integrator가 prop 계약 합의 (가능하면 동일 도메인 타입 재사용)
  ├── 각 팀원이 자기 레이어에서 `npm run build`/`lint` 통과 확인
  └── 팀 정리(TeamDelete) 후 검증 단계로
```

작업 분배 원칙: **data-engineer를 먼저** 진행시키거나 최소한 shape를 먼저 확정하게 한다 — 응답 타입이 페이지·컴포넌트 작업의 입력이기 때문. 단, 파일 기반이 아니라 SendMessage 실시간 조율이므로 page/ui가 data를 기다리며 막힐 필요는 없다(계약을 먼저 합의하고 병렬 진행).

팀 크기는 3인 고정(레이어 수와 일치). 사소한 단일 레이어 변경은 팀을 만들지 않고 해당 전문가 1인 또는 `builder` 솔로로 처리한다.

## 생성-검증 루프 (빌드 팀 ↔ reviewer / integration-qa)

reviewer의 `verdict`와 integration-qa의 `verdict`를 함께 본다:

- 둘 다 `approve`/`pass` → 루프 종료. 사람에게 commit/PR을 넘긴다 (오케스트레이터는 절대 push/commit하지 않는다).
- reviewer `request-changes`/`block` 또는 integration-qa `fail` → **해당 레이어의 팀원을 재호출**(데이터 finding이면 data-engineer, 라우팅/페이지면 page-integrator, 컴포넌트/스타일이면 ui-engineer; 빌드 팀이 이미 해체됐으면 그 팀원만 서브에이전트로 재호출)하되 "review/QA의 Critical 항목만 처리"로 지시한다. 처리되면 해당 검증자를 **다시 호출**해 새 diff를 재검증한다. 둘 다 통과할 때까지 반복.
- 팀원이 "이건 plan 범위 밖"이라고 판단한 finding은 코드로 처리하지 않고 `planner` 주석 사이클로 되돌린다.

**reviewer vs integration-qa 역할 분담**: reviewer는 diff↔plan 준수·코드품질·빌드건전성을 본다. integration-qa는 런타임 경계면 정합성(API 응답 shape ↔ 훅 제네릭 ↔ 타입 ↔ 컴포넌트 사용, 라우트 경로 ↔ 네비게이션 타겟, 쿼리 무효화 일치)을 양쪽 동시 읽기로 본다. 둘은 중복이 아니라 상보적이다 — `tsc`가 통과시키는 경계면 버그는 integration-qa만 잡는다.

## 스킬 인지(skill-aware) 원칙 — 모범사례 참조 배선

하네스가 "동작하는 코드"를 넘어 "모범사례를 따르는 코드"를 내려면, 각 단계가 프로젝트 best-practice 스킬을 능동적으로 참조해야 한다. 이 배선이 빠지면 빌드 팀원이 매번 컨벤션을 즉흥적으로 재발명해 코드가 표류한다. 파이프라인에 다음이 박혀 있다:

- **researcher** — 이 작업에 적용할 스킬을 열거(`quizly-frontend-conventions` 기본, UI면 `frontend-design`)하고 research 리포트 §9에 기록.
- **planner** — plan §3에서 파일/스텝마다 "따라야 할 스킬 + 섹션/reference"를 명시.
- **빌드 팀원**(data-engineer·page-integrator·ui-engineer) — 구현 **전에** 자기 레이어에 해당하는 스킬 파일(`.claude/skills/quizly-frontend-conventions/SKILL.md` + 해당 `references/*.md`; UI는 `frontend-design`)을 Read로 정독하고 그 규칙대로 작성. (팀원은 Skill 툴 대신 파일을 직접 읽는다.)
- **reviewer** — diff가 plan이 지정한 스킬의 모범사례를 준수했는지 검증 항목에 포함.

이 패턴은 특정 스킬에 묶이지 않는다 — 새 best-practice 스킬을 추가하면 researcher의 열거 목록에만 넣으면 자동으로 파이프라인 전체에 전파된다. 다른 하네스(예: cinelab)에도 동일하게 이식 가능한 공통 패턴이다.

## 운영 모드 A: 단일 세션 (기본)

오케스트레이터가 한 세션 안에서 각 단계를 서브에이전트로 순차 호출한다. 각 서브에이전트는 독립 컨텍스트라 격리는 확보되고, 사람은 단계 사이에 검토만 하면 된다. 일상 작업 대부분은 이 모드.

## 운영 모드 B: worktree 독립 운영 (구현·검증 완전 분리)

"구현과 검증을 다른 프로세스로 완전히 떼고 싶다" / 중대한 변경 / 여러 작업 병렬일 때:

```bash
git worktree add ../quizly-build  feat/#NNN
git worktree add ../quizly-review feat/#NNN
```

- `../quizly-build`에서 Claude를 띄워 **빌드 팀(또는 단일 전문가)**만 돌린다 (구현).
- `../quizly-review`에서 별도 Claude를 띄워 **reviewer / integration-qa만** 돌린다 (검증). 두 프로세스는 OS 레벨로 분리되어 맥락이 절대 공유되지 않는다.
- 핸드오프는 공유 git 브랜치 + `docs/ai/` 아티팩트로. 검증자는 build worktree의 커밋/diff를 `git diff`로 읽는다.
- 작업 종료 후 `git worktree remove ../quizly-build ../quizly-review`로 정리.

domain/research/plan은 모드 A로 끝낸 뒤, build↔(review+QA)만 모드 B로 굴리는 하이브리드가 실전에서 가장 흔하다.

## 데이터 전달 프로토콜

- **파일 기반**(계획·검증 단계): `docs/ai/{domain,research,plan,review,qa}/#NNN.md`. 모든 단계가 감사 추적된다.
- **메시지 기반**(빌드 팀 내부): `SendMessage`로 팀원 간 실시간 contract 공유(응답 shape, prop 계약, 라우트 경로). 경계면 정합성의 1차 방어선.
- **태스크 기반**(빌드 팀 조율): `TaskCreate`/`TaskUpdate`로 레이어별 작업·의존관계·진행상황 추적.
- **반환값**(보조): 각 서브에이전트는 산출물 경로 한 줄만 메인에 반환한다.
- 중간 아티팩트는 지우지 않는다 (사후 검증·회귀 추적용).
- 세션 로깅은 `.claude/hooks/log-session.sh`가 `logs/ai/<날짜>_<세션ID>.jsonl`에 자동 기록한다(역할별 도구 호출 추적용). `logs/`는 gitignore 대상.

## 에러 핸들링

- 서브에이전트 실패 → 1회 재호출. 재실패 시 그 단계를 멈추고 사용자에게 보고(누락 명시). 다음 단계로 무단 진행 금지.
- 앞 단계 산출물 누락 → 다음 단계를 시작하지 않고, 누락된 단계를 먼저 돌리라고 안내.
- 빌드 팀원의 `npm run build`/`lint` 실패 → 즉시 멈추고 보고. plan 밖 임기응변 수정 금지.
- 팀원 간 contract 누락(page가 shape 없이 진행) → page-integrator가 data-engineer에 SendMessage로 요청하게 하고, 추측 구현을 금지한다.
- 상충하는 정보 → 삭제하지 말고 출처를 병기해 사용자 판단에 맡긴다.

## 테스트 시나리오

**정상 흐름(기능 개발)**: `#120 모의고사 결과 PDF 내보내기` → domain-analyst가 "모의고사 채점 후 결과 PDF 저장" 룰·수용기준 정리 → researcher가 `src/api/quiz.ts`의 모의고사 응답·`src/lib/pdfUtils.ts`·`MockExamPage` 영향 확인 → planner가 단계별 plan 작성 → 사용자 승인 → 빌드 팀 구현(data-engineer가 모의고사 응답타입·훅 정의 후 contract 브로드캐스트 → page-integrator가 MockExamPage 배선 → ui-engineer가 PDF 내보내기 버튼/컴포넌트) + `npm run build`/`lint` → reviewer `approve` + integration-qa가 응답 shape↔훅 제네릭 `pass`. PR은 사람이 연다.

**에러 흐름**: planner 호출했는데 `docs/ai/research/#120.md` 없음 → 오케스트레이터가 researcher 먼저 돌리라고 안내하고 멈춤. / integration-qa가 `fail`(API가 `{ content: [...] }` 반환인데 훅이 `MockExamResponse[]` 기대) → data-engineer 재호출로 훅 제네릭·언래핑 수정 + 정정된 contract 재브로드캐스트 → integration-qa 재검증 → `pass`.

**통합 QA 단독 흐름**: "대시보드 API랑 훅 정합성 봐줘" → integration-qa만 호출, `src/api/dashboard.ts` ↔ `src/hooks/useDashboard.ts` ↔ `AnalyticsPage` 경계면 교차검증 → `docs/ai/qa/#NNN.md` 리포트. 코드 변경 없음.

## 하드 룰

- 승인 게이트는 건너뛸 수 없다 — 빌드 팀원·builder는 `approved: true` 없이는 작동 안 한다.
- 세션당 활성 팀은 하나다 — 빌드 팀 사용 후 `TeamDelete`로 정리하고 검증 단계로 넘어간다.
- 오케스트레이터·서브에이전트는 절대 `git push` / `gh pr create` / `git commit`을 하지 않는다. 그건 사람의 몫.
- 단계 산출물은 한 이슈당 하나. 재실행은 명시적 요청 시에만 덮어쓴다.
- 커맨드(`.claude/commands/`)를 만들지 않는다. 트리거는 이 스킬의 description으로 한다.
