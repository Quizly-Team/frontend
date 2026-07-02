# 라우팅 상세

SKILL.md §4의 구체적 패턴. 새 페이지·라우트를 추가하거나 네비게이션을 다룰 때 읽는다.

## 라우트 등록 (`src/app/router.tsx`)

평면 `createBrowserRouter` 테이블이다. 새 페이지는 두 곳을 동시에 건드린다:

```tsx
// 1) src/app/pages/SettingsPage.tsx 추가
// 2) router.tsx 에 항목 추가
import SettingsPage from '@/app/pages/SettingsPage';

export const router = createBrowserRouter([
  // ...기존 라우트
  { path: '/settings', element: <SettingsPage /> },
]);
```

현재 라우트 맵 (네비게이션 타겟이 이와 일치해야 함):

| path | page |
| ---- | ---- |
| `/` | HomePage |
| `/my-quizzes` | QuizListPage |
| `/my-quizzes/:date` | QuizDetailPage |
| `/wrong-quizzes` | WrongQuizPage |
| `/wrong-quizzes/solve` | WrongQuizSolvePage |
| `/mock-exam` | MockExamPage |
| `/login` | LoginPage |
| `/login/oauth2/code/:provider` | AuthCallback |
| `/analytics` | AnalyticsPage |
| `/onboarding` | OnboardingPage |
| `/admin` | AdminPage |

> 라우트를 추가/변경하면 이 표도 갱신하는 게 좋다(integration-qa가 참조).

## 네비게이션

```tsx
import { useNavigate, Link } from 'react-router-dom';

const navigate = useNavigate();
navigate('/my-quizzes');               // 프로그램적 이동
navigate(`/my-quizzes/${date}`);       // 동적 세그먼트는 실제 값으로 채움
<Link to="/analytics">분석</Link>      // 선언적 링크
```

규칙:
- `window.location.href`로 SPA 내부 이동을 하지 마라 — 전체 리로드가 일어나 상태가 날아간다. 예외는 `apiClient`/`lib/auth`의 기존 인증 리다이렉트(토큰 만료 시 `/`로).
- 동적 세그먼트(`:date`, `:provider`)는 반드시 실제 값으로 채운다. 빈 값/`undefined`가 들어가면 `/my-quizzes/undefined`가 된다.
- 라우트 파라미터는 `useParams()`로 읽는다.

## 가드 / 인증 분기

비로그인 사용자 처리는 기존 패턴을 따른다 — `src/components`의 `UnauthorizedPage`/`MemberOnlyPage`, `src/lib/auth`의 토큰 확인. 새 가드 로직을 즉흥적으로 만들지 말고 기존 컴포넌트/유틸을 재사용하라.
