---
name: quizly-frontend-conventions
description: >
  Quizly 프론트엔드(React 19 + Vite + TS, TanStack Query, React Context, Tailwind 4 중심 + 일부 MUI 7,
  React Router 7, REST `apiClient`)의 구현 모범사례. 새 페이지·컴포넌트·API 연동·훅·라우트를
  추가하거나, 기존 코드를 수정·리팩토링·디자인 구현할 때 반드시 이 스킬을 참조해 프로젝트
  컨벤션을 따른 코드를 작성하라. 특히 API 응답 shape ↔ 훅 제네릭 ↔ 타입 정의 경계면,
  TanStack Query 사용, React Router 네비게이션, MUI/Tailwind 혼용, `@/` import 규칙을 다룬다.
  하네스 워크플로우(quizly-dev-workflow)의 builder/planner/reviewer가 구현·계획·검증 단계에서
  best practice를 따르기 위해 이 스킬을 적극적으로 호출해야 한다. "컴포넌트 만들어줘",
  "API 연동", "훅 추가", "페이지 추가", "프론트 구현", "리팩토링" 등 프론트엔드 코드를
  쓰거나 고치는 모든 작업에 적용된다.
---

# Quizly 프론트엔드 컨벤션

이 스킬은 Quizly 코드베이스에 **이미 자리잡은 패턴**을 코드로 옮기는 가이드다. 목표는 일관성이다 — 새 코드가 주변 코드와 똑같이 읽히면 리뷰·유지보수 비용이 내려가고, 경계면 버그(컴파일은 되지만 런타임에 깨지는)가 사라진다. 규칙을 외우게 하려는 게 아니라 **왜 그렇게 하는지**를 이해시켜 엣지 케이스에서도 옳게 판단하게 하는 게 핵심이다.

적용 순서: 먼저 **수정할 파일 주변의 기존 코드를 읽고** 그 지역 관습을 따른다. 이 문서와 주변 코드가 충돌하면 주변 코드가 이긴다(이 문서가 낡았을 수 있다). 깊은 예시가 필요하면 `references/`를 읽는다.

## 1. 절대 원칙 (경계면 타입 안전성)

가장 중요한 규칙 하나: **`apiClient.get<T>()`의 제네릭 `T`는 백엔드가 실제로 반환하는 shape과 정확히 일치해야 한다.**

```ts
// 백엔드가 { content: Quiz[], totalPages: number } 를 반환하는데
const data = await apiClient.get<Quiz[]>('/quizzes'); // ❌ 컴파일은 통과, 런타임에 data.map 폭발
const data = await apiClient.get<QuizPageResponse>('/quizzes'); // ✅ 실제 shape과 일치
```

TypeScript 제네릭은 런타임 응답을 검사하지 않는다 — 잘못된 `<T>`도 `npm run build`를 통과한다. 그래서 이건 `tsc`가 못 잡는 가장 흔한 버그다. **응답 타입을 쓸 때는 추측하지 말고, 백엔드 응답 또는 기존 `src/api/*.ts`의 동일 도메인 타입을 근거로 확정하라.** 래핑된 응답(`{ data: ... }`, `{ content: [...] }`)은 호출측에서 정확히 한 번 언래핑한다.

`any`, 비-null 단언 `!`(컴파일러 침묵용), `// @ts-ignore`로 타입을 우회하지 마라 — 이것들은 경계면 버그를 숨긴다. 좁히기(narrowing)로 해결한다.

## 2. API 레이어 (`src/api/*.ts`)

- 모든 인증 요청은 **`apiClient`**(`src/api/apiClient.ts`)의 `get/post/put/patch/delete<T>()`를 통한다. 이게 `Authorization` 헤더 주입과 401 토큰 재발급/재시도를 처리한다. 새 코드에서 인증 `fetch`를 손으로 짜지 마라 — 재발급 로직이 빠진다.
- 도메인별 모듈(`account`, `admin`, `auth`, `dashboard`, `faq`, `quiz`)에 **타입드 요청 함수**를 추가하고, **응답 타입을 같은 파일에 co-locate**한다(또는 `src/types/`). 페이지가 `fetch`를 직접 호출하지 않게 한다.
- 파일 업로드는 `FormData`를 body로 넘긴다 — `apiClient`가 `Content-Type`을 자동 처리한다(직접 `multipart` 헤더를 설정하지 마라).

## 3. 서버 상태 = TanStack Query (`src/hooks/use*.ts`)

서버에서 온 데이터는 **TanStack Query**가 소유한다. Zustand/context에 서버 데이터를 복사해 두지 마라(동기화 버그의 근원).

- **조회**는 `useQuery`, **변경**은 `useMutation`. 훅은 `src/hooks/use*.ts`에 두거나 페이지에 inline. API 함수를 감싼다.
- 프로젝트 관습을 따른 **명시적 제네릭**을 단다: `useQuery<TResponse>({...})`, `useMutation<TResponse, Error, TParams>({...})`.
- `queryKey`는 안정적인 배열로(`['dashboard', 'stats']`처럼 도메인+세부). `staleTime`은 기존 훅 관습을 따른다(예: 5분 = `1000 * 60 * 5`).
- 변경 성공 후 관련 조회를 다시 불러와야 하면 `queryClient.invalidateQueries({ queryKey: [...] })`로 **해당 조회와 똑같은 queryKey를 무효화**한다 — 무효화 키가 어긋나면 성공해도 UI가 옛 데이터를 보여준다.

> 구체적 예시(제네릭 시그니처, 무효화, optimistic update)는 `references/api-and-data.md`.

## 4. 라우팅 (`src/app/router.tsx`)

- 라우트는 `createBrowserRouter`의 **평면 테이블**이다. 새 페이지 = `src/app/pages/<Name>Page.tsx` 추가 + `router.tsx`에 라우트 항목 추가.
- 네비게이션은 **React Router**(`useNavigate()`, `<Link to=...>`)로 한다. `window.location`을 쓰지 마라 — 기존 인증 리다이렉트(`apiClient`/`lib/auth` 내부)만 예외다.
- 링크/`navigate` 타겟은 **실제 존재하는 라우트 경로**와 정확히 일치해야 한다(동적 세그먼트 `:date`, `:provider` 포함). 예: 라우트가 `/my-quizzes/:date`인데 `/quizzes/...`로 이동하면 조용히 404.

## 5. UI: MUI 7 + Tailwind 4 + 컴포넌트

- 스타일링은 **MUI 7**(`@mui/material` + `@emotion`)과 **Tailwind 4**가 공존한다. **주변 컴포넌트가 쓰는 방식을 그대로 따른다** — 한 파일에 둘을 뒤섞거나 세 번째 스타일 시스템(예: CSS module)을 새로 들이지 마라.
- 재사용 컴포넌트는 `src/components/{common,domain,dashboard,layout,modal}`에 두고 **`src/components/index.ts` 배럴에 export**한다. 페이지는 `import { Button, Modal } from '@/components'`로 가져온다.
- 차트는 대시보드 관습을 따른다(`recharts`/`chart.js`), PDF는 `src/lib/pdfUtils.ts`와 `pdfjs-dist`/`jspdf`.

> 컴포넌트 분류 기준, MUI 테마 vs Tailwind 선택, 배럴 export 규칙은 `references/ui-styling.md`.

## 6. 공통 규칙

- **import는 `@/` alias**(→ `src/`). 상대경로 `../../`를 새로 만들지 마라.
- 디버그 잔재 금지: `console.log`, 주석처리된 코드 블록, 미사용 import. 기존 파일의 주석 밀도를 넘는 불필요한 주석·JSDoc를 달지 마라.
- 클라이언트/UI 상태(모달 열림, 폼 입력 등)는 Zustand 또는 `src/contexts/`. 서버 상태(§3)와 섞지 마라.
- 커밋 메시지: `<type>(#NNN): <한국어 설명>` (예: `feat(#105): 구글 애드센스 header 적용`).

## 검증

작성한 코드는 `npm run build`(tsc -b 타입체크 + vite build)와 `npm run lint`를 통과해야 한다. 단, **빌드 통과 ≠ 정상 동작** — §1의 경계면은 빌드가 못 잡으니, API 응답 shape과 훅 제네릭·타입·컴포넌트 사용을 양쪽 동시에 읽어 교차 확인하라.

## 참조 파일

- `references/api-and-data.md` — apiClient 사용, TanStack Query 제네릭·무효화·optimistic update 예시, 경계면 교차검증 체크리스트
- `references/routing.md` — 라우터 등록·동적 세그먼트·가드 패턴
- `references/ui-styling.md` — MUI/Tailwind 선택 기준, 컴포넌트 분류·배럴 export
