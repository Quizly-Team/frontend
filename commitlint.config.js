export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능 추가
        'fix', // 오류 수정
        'bug', // 기능상의 오류
        'docs', // 문서 관련
        'style', // 스타일/포맷 (기능 변경 x)
        'refactor', // 리팩터링 (기능 변경 x)
        'chore', // 잡다한 수정
        'build', // 빌드/패키지 매니저
        'test', // 테스트 코드
        'comment', // 주석 추가/변경
      ],
    ],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [0], // 한국어 설명 허용
    'header-max-length': [2, 'always', 72],
  },
}
