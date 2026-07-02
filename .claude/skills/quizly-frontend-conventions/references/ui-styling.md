# UI · 스타일링 · 컴포넌트 상세

SKILL.md §5의 구체적 기준. 컴포넌트를 만들거나 스타일을 입힐 때 읽는다.

## MUI 7 vs Tailwind 4 — 언제 무엇을

둘 다 쓰이며 공존한다. 선택 기준:
- **수정**: 손대는 컴포넌트가 이미 쓰는 방식을 그대로 따른다. MUI `sx`로 짠 컴포넌트에 Tailwind 클래스를 섞지 마라(우선순위·일관성 깨짐).
- **신규**: 주변 형제 컴포넌트의 다수 방식을 따른다. 복잡한 인터랙티브 컴포넌트(다이얼로그, 데이트피커, 셀렉트)는 MUI(`@mui/material`, `@mui/x-date-pickers`)가 유리하고, 레이아웃·간격·간단한 스타일은 Tailwind가 가볍다.
- **금지**: 세 번째 스타일 시스템(CSS module, styled-components 신규 도입 등)을 들이지 마라. 색상·간격을 하드코딩하기보다 Tailwind 토큰/테마 값을 쓴다.

## 컴포넌트 분류 (`src/components/<bucket>/`)

| bucket | 용도 | 예 |
| ------ | ---- | --- |
| `common` | 도메인 무관 재사용 UI | Button, Card, Input, Modal, Icon, ProgressBar, Tooltip |
| `domain` | 퀴즈/시험 도메인 특화 | MockExamQuestion |
| `dashboard` | 분석/통계 차트 | daily-heatmap, topic-chart, learning-stats |
| `layout` | 페이지 골격 | Header, Footer |
| `modal` | 모달 다이얼로그 | FaqCreateModal, MockExamSettingModal |

새 컴포넌트를 만들 때 어느 bucket에 속하는지 먼저 정한다. 도메인 특화면 `domain`, 어디서나 쓰이면 `common`.

## 배럴 export (`src/components/index.ts`)

재사용 컴포넌트는 배럴에 등록해 `import { X } from '@/components'`로 쓰게 한다.

```ts
// named export 컴포넌트
export { Button, Card, Modal } from './common';
// default export 컴포넌트
export { default as QuizCard } from './common/QuizCard';
```

페이지 코드가 깊은 경로(`@/components/common/QuizCard`)로 직접 import하기보다 배럴을 거치게 해 import를 안정적으로 유지한다(파일 이동 시 배럴만 고치면 됨).

## 차트 · PDF

- 차트: 대시보드 컴포넌트들이 `recharts`/`chart.js`(+`react-chartjs-2`)를 쓴다. 기존 대시보드 차트의 데이터 변환·옵션 패턴을 따른다.
- PDF: 생성은 `src/lib/pdfUtils.ts` + `jspdf`/`jspdf-autotable`/`html2canvas`, 읽기는 `pdfjs-dist`. 새 PDF 로직은 `pdfUtils`에 모은다.
