# API 레이어 + 데이터 페칭 상세

SKILL.md §1–§3의 구체적 예시와 체크리스트. 새 API 연동·훅을 쓸 때 읽는다.

## 1. API 함수 작성 (`src/api/<domain>.ts`)

요청 함수와 응답 타입을 같은 모듈에 둔다. 페이지/컴포넌트는 이 함수만 호출한다.

```ts
// src/api/dashboard.ts
import { apiClient } from './apiClient';

export type DashboardResponse = {
  totalSolved: number;
  accuracy: number;
  // ... 백엔드가 실제로 주는 필드를 정확히
};

export const getDashboardStats = (): Promise<DashboardResponse> =>
  apiClient.get<DashboardResponse>('/dashboard/stats');
```

핵심:
- 제네릭 `<DashboardResponse>`는 백엔드 응답과 **정확히 일치**. 추측 금지 — 기존 동일 도메인 타입이나 백엔드 스펙을 근거로.
- 인증이 필요 없는 공개 엔드포인트는 `apiClient.get<T>(endpoint, { requiresAuth: false })`.
- 파일 업로드: `FormData`를 그대로 body로. `apiClient`가 `Content-Type`/boundary를 자동 처리하므로 직접 헤더를 설정하면 오히려 깨진다.

## 2. 조회 훅 (`useQuery`)

```ts
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, type DashboardResponse } from '@/api/dashboard';

export const useDashboardStats = () =>
  useQuery<DashboardResponse>({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5분 — 자주 변하지 않는 통계
  });
```

- `queryKey`: `[도메인, 세부, ...파라미터]` 형태의 안정적 배열. 파라미터가 있으면 키에 포함(`['quizzes', date]`)해야 캐시가 올바로 분리된다.
- `staleTime`: 데이터 변동성에 맞춰 기존 관습을 따른다.

## 3. 변경 훅 (`useMutation`) — 실제 프로젝트 시그니처

```ts
// src/hooks/useCreateQuiz.ts (실제 패턴)
import { useMutation } from '@tanstack/react-query';
import { createQuiz } from '@/api/quiz';
import type { QuizResponse } from '@/types/quiz';

type CreateQuizParams = { content: string | File; type: QuizType; isLoggedIn: boolean };

export const useCreateQuiz = () =>
  useMutation<QuizResponse, Error, CreateQuizParams>({
    mutationFn: ({ content, type, isLoggedIn }) => createQuiz(content, type, isLoggedIn),
  });
```

`useMutation<TResponse, Error, TParams>` 3-제네릭을 명시한다(프로젝트 관습).

## 4. 무효화 (invalidation) — 어긋나면 UI가 stale

변경 후 목록/통계가 갱신돼야 하면:

```ts
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
return useMutation({
  mutationFn: deleteQuiz,
  onSuccess: () => {
    // 이 키는 해당 데이터를 읽는 useQuery의 queryKey와 똑같아야 한다
    queryClient.invalidateQueries({ queryKey: ['quizzes'] });
  },
});
```

**무효화 키 ↔ 조회 키 일치**가 핵심. `useQuery`가 `['quizzes', date]`로 읽는데 `['quiz']`를 무효화하면 아무 일도 안 일어난다. 변경이 영향 주는 모든 조회 키를 추적해 무효화하라.

## 5. 경계면 교차검증 체크리스트

새 엔드포인트를 붙일 때 **양쪽을 동시에 열고** 확인:

- [ ] API 함수의 반환 타입 = 백엔드 실제 응답 shape (래핑 `{ content: [] }` vs 배열, `camelCase` vs `snake_case`, nullable)
- [ ] 훅의 제네릭(`useQuery<T>`/API 함수 `<T>`) = 그 응답 타입
- [ ] 컴포넌트가 접근하는 필드가 타입에 실제 존재 (`data.content.map` vs `data.map`)
- [ ] 래핑 응답은 호출측에서 정확히 한 번 언래핑
- [ ] mutation의 무효화 `queryKey` = 영향받는 `useQuery`의 `queryKey`
- [ ] 즉시 응답(202 등)과 최종 결과의 shape 차이를 프론트가 구분
