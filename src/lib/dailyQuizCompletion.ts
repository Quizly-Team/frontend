const DAILY_QUIZ_COMPLETED_DATE_KEY = 'dailyQuizCompletedDate'

// 로컬 기준 YYYY-MM-DD. toISOString()은 UTC라 KST 오전에 하루 어긋난다.
const getLocalDateKey = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

export const isDailyQuizCompletedToday = (): boolean => {
  try {
    return (
      localStorage.getItem(DAILY_QUIZ_COMPLETED_DATE_KEY) === getLocalDateKey()
    )
  } catch {
    // 저장소 차단 환경(시크릿 모드 등)에서는 '미완료'로 fail-open
    return false
  }
}

export const markDailyQuizCompleted = (): void => {
  try {
    localStorage.setItem(DAILY_QUIZ_COMPLETED_DATE_KEY, getLocalDateKey())
  } catch {
    // 저장 실패는 무시한다 — 체크 표시가 안 될 뿐, 풀이 흐름은 영향받지 않는다
  }
}
