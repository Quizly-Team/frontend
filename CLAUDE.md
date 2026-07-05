# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quizly** — a quiz & mock-exam learning app. Users upload study material (incl. PDF) to generate quizzes, solve them, review wrong answers, take mock exams, and track progress on a dashboard. Includes an admin surface (FAQ, QnA, manual batch). React 19 + Vite + TypeScript SPA.

## Development Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b (typecheck) + vite build  ← primary verification gate
npm run lint      # ESLint
npm run preview   # preview the production build
```

There is **no unit-test runner** configured. Verification = `npm run build` (typecheck + build) + `npm run lint` + manual click-through in `npm run dev` + integration-coherence QA.

## Architecture

### 도메인 맵 (기능 영역)

| 도메인         | 라우트                                   | 페이지                                | API 모듈                                            | 훅                   |
| -------------- | ---------------------------------------- | ------------------------------------- | --------------------------------------------------- | -------------------- |
| 문제 생성      | `/`                                      | `HomePage`                            | `api/quiz` (`createQuiz`)                           | `useCreateQuiz`      |
| 문제 풀이·이력 | `/my-quizzes`, `/my-quizzes/:date`       | `QuizListPage`, `QuizDetailPage`      | `api/quiz` (`getQuizGroups`, `submitAnswerMember`)  | inline               |
| 오답           | `/wrong-quizzes`, `/wrong-quizzes/solve` | `WrongQuizPage`, `WrongQuizSolvePage` | `api/quiz` (`getWrongQuizzes`, `submitAnswerRetry`) | inline               |
| 모의고사       | `/mock-exam`                             | `MockExamPage`                        | `api/quiz` (`createMockExam*`)                      | `useMockExam`        |
| 대시보드/통계  | `/analytics`                             | `AnalyticsPage`                       | `api/dashboard`, `api/account`                      | `useDashboard`       |
| 인증(OAuth2)   | `/login`, `/login/oauth2/code/:provider` | `LoginPage`, `AuthCallback`           | `api/auth`, `lib/auth`·`lib/oauth`                  | —                    |
| 온보딩         | `/onboarding`                            | `OnboardingPage`                      | `api/account` (`saveOnboarding`, tempAccessToken)   | —                    |
| 계정           | (전용 라우트 없음)                       | —                                     | `api/account` (`getUserInfo` 등)                    | `UserContext`가 소비 |
| 관리자         | `/admin`                                 | `AdminPage`                           | `api/admin`, `api/faq`                              | inline               |

### 레이어

- **`src/api/`** — REST API 레이어. **정식 클라이언트는 `apiClient.ts`** (class `ApiClient`: 타입드 `get/post/put/patch/delete<T>()` + `Authorization` 주입 + 401 토큰 재발급/재시도). ⚠️ **현실**: 다수 feature 모듈(`quiz`·`dashboard`·`admin`·`faq`)은 `account.ts`의 `authenticatedFetch`를 통해 호출하며, 401 재발급 로직이 `apiClient.ts`·`account.ts`·`quiz.ts` **3곳에 중복**돼 있다(알려진 기술부채 — 향후 `apiClient`로 통일 권장). 모듈: `account`, `admin`, `auth`, `dashboard`, `faq`, `quiz`. 응답 타입은 각 모듈에 co-locate.
- **`src/hooks/`** — TanStack Query data hooks (`useCreateQuiz`, `useMockExam`, `useDashboard`) wrapping API functions; some pages also use inline `useQuery`/`useMutation`. Stable `queryKey`s; invalidate on mutation.
- **`src/app/`** — `router.tsx` (flat `createBrowserRouter` table) + `pages/*.tsx` (Home, QuizList, QuizDetail, WrongQuiz, WrongQuizSolve, MockExam, Analytics, Onboarding, Admin, Login, AuthCallback). ⚠️ `QuizSolvePage.tsx`는 존재하나 현재 `router.tsx`에 미등록(고아 파일).
- **`src/components/`** — `common`, `dashboard`, `domain`, `layout`, `modal`, re-exported via `index.ts`.
- **`src/types/`** — `common.ts`, `components.ts`, `quiz.ts` (plus co-located api response types).
- **`src/contexts/`** — React contexts; **`src/lib/`** — `auth`, `oauth`, `pdfUtils`, `queryClient`.
- **`src/mocks/`** — mock data.
- **Known dead code/deps (정리 대상)** — `src/api/client.ts` (importer 0, `apiClient.ts`와 중복), 미사용 npm deps: `chart.js`·`react-chartjs-2`·`zustand`·`@mui/x-date-pickers`·`jspdf-autotable`. ※ `@emotion/*`은 MUI peer dependency라 유지. 물리 제거는 별도 정리 패스에서 `npm run build` 검증과 함께.

### Key conventions

- **Imports** use the `@/` alias → `src/`.
- **Server state** = TanStack Query. **Client/UI state** = React Context (`contexts/UserContext`). `zustand`는 설치돼 있으나 **미사용 → 제거 결정** (전역 클라이언트 상태가 늘어 정말 필요해지면 그때 재도입). 서버 데이터를 context/스토어에 복사해두지 말 것(동기화 버그의 근원).
- **API access** goes through `apiClient` / the `src/api/*.ts` functions — don't hand-roll authed `fetch`. An `apiClient.get<T>()` generic must match the **real** response shape (a wrong `<T>` compiles but breaks at runtime — the classic boundary bug).
- **Routing** via React Router (`useNavigate`/`<Link>`), not `window.location` (except the existing auth redirect). New page = new `pages/*.tsx` + a `router.tsx` entry.
- **Styling** = **Tailwind 4 우세** (대부분의 컴포넌트). MUI 7(`@mui/material` + `@emotion`)은 일부 모달(`common/Modal.tsx`, `common/QuizCreateModal.tsx`)에만 국한. 새 컴포넌트는 **주변 관습(대개 Tailwind)** 을 따르고, 세 번째 스타일 시스템을 들이지 말 것.
- **Charts** = **`recharts`만 사용** (대시보드 차트 3개). `chart.js`/`react-chartjs-2`는 미사용. **PDF** = `pdfjs-dist`(`lib/pdfUtils.ts`, 텍스트 추출) + `jspdf`·`html2canvas`(`MockExamPage`, 내보내기).

### Commit convention

Conventional commits referencing the issue, Korean description: `<type>(#NNN): <설명>` (e.g. `feat(#105): 구글 애드센스 header 적용`). Types: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`. Do not commit/push automatically — that is the human's job.

## 하네스: Quizly 개발 워크플로우

**목표:** 한 개발 작업을 도메인분석 → 리서치 → 계획 → (승인) → 구현 → 검증(diff 리뷰 + 통합 QA) 파이프라인으로 분리하고, 구현(builder)과 검증(reviewer·integration-qa)을 컨텍스트 격리 상태로 독립 운영한다. 기능 개발·통합 정합성 QA·버그 수정/리팩토링·디자인 구현(Figma→코드) 네 작업 유형을 모두 처리한다.

**트리거:** 코드 변경 또는 통합 검증을 동반하는 개발 작업(이슈 `#NNN` 구현/수정/리뷰/QA 등) 요청 시 `quizly-dev-workflow` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**역할(하이브리드):** 계획=`domain-analyst` → `researcher` → `planner`(순차 서브에이전트) →〔사람 승인〕→ 구현=**에이전트 팀** `data-engineer`·`page-integrator`·`ui-engineer`(TeamCreate, 레이어별 실시간 협업) ⇄ 검증=`reviewer` + `integration-qa`(독립 서브에이전트). 사소한 단일 레이어 변경은 `builder` 솔로 폴백. 산출물은 `docs/ai/{domain,research,plan,review,qa}/#NNN.md`. 세션 로깅은 `.claude/hooks/log-session.sh` → `logs/ai/*.jsonl`.

**스킬 인지:** 파이프라인은 best-practice 스킬을 능동 참조한다 — researcher가 적용 스킬 열거(§9) → planner가 파일별 명시(§3) → builder가 구현 전 정독 → reviewer가 준수 검증. 기본 참조 스킬은 `quizly-frontend-conventions`(프로젝트 컨벤션), UI는 `frontend-design`. 새 best-practice 스킬은 researcher 열거 목록에 추가하면 파이프라인 전체에 전파된다.

**변경 이력:**

| 날짜       | 변경 내용                                                                                                                                                                          | 대상                                                                                | 사유                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-30 | 초기 구성 (6역할 파이프라인: domain-analyst·researcher·planner·builder·reviewer·integration-qa + 로깅 훅)                                                                          | 전체                                                                                | harness 신규 구축 (cinelab 패턴 기반, quizly 스택 적응)                                                                                 |
| 2026-06-30 | skill-aware 배선 + `quizly-frontend-conventions` 스킬 신규                                                                                                                         | researcher·planner·builder·reviewer·orchestrator·skills/quizly-frontend-conventions | 워크플로우가 구현 시 best-practice 스킬을 참조하지 않던 문제 해결 (skill-creator 방법론으로 제작)                                       |
| 2026-06-30 | 구현 단계를 에이전트 팀으로 전환 (하이브리드) — 레이어 전문가 3인 신규                                                                                                             | agents/{data-engineer,page-integrator,ui-engineer}·orchestrator                     | 도메인 분석 결과 quizly의 지배적 버그가 레이어 경계면 불일치 → 실시간 SendMessage 협업으로 발생 지점 차단. builder는 솔로 폴백으로 잔존 |
| 2026-07-02 | 도메인 재검증 후 문서·설정 현행화 (drift 7건 수정: Zustand 미사용·Tailwind 우세·recharts 단독·apiClient 중복 현실·QuizSolve 고아·죽은 deps·도메인 맵 추가) + 하네스 설정 버그 수정 | CLAUDE.md·skills/quizly-frontend-conventions·settings.local.json                    | 문서-코드 불일치로 하네스 에이전트가 틀린 전제로 판단하는 문제. zustand 제거 결정(필요 시 재도입). 소스 코드 무변경                     |
