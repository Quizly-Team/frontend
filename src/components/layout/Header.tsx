import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { logout, getTodaySummary } from '@/api/account'
import { Button } from '@/components'
import { useUser } from '@/contexts/UserContext'
import { authUtils } from '@/lib/auth'

type HeaderProps = {
  logoUrl?: string
  onMockExamClick?: () => void
  isMockExamModalOpen?: boolean
}

const Header = ({
  logoUrl = '/logo.svg',
  onMockExamClick,
  isMockExamModalOpen = false,
}: HeaderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { userInfo, isLoading: isUserInfoLoading } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  // 오늘의 학습 요약 조회 (로그인 상태일 때만)
  const { data: todaySummaryData } = useQuery({
    queryKey: ['account', 'today-summary'],
    queryFn: getTodaySummary,
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1분
    refetchOnWindowFocus: true, // 문제 풀고 돌아왔을 때 자동 갱신
  })

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated())

    // 인증 상태 변경 감지
    const handleAuthStateChange = () => {
      setIsAuthenticated(authUtils.isAuthenticated())
    }

    window.addEventListener('authStateChanged', handleAuthStateChange)
    window.addEventListener('storage', handleAuthStateChange)

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange)
      window.removeEventListener('storage', handleAuthStateChange)
    }
  }, [])

  const handleLoginClick = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handleProfileClick = useCallback(() => {
    navigate('/analytics')
  }, [navigate])

  const handleMockExamClick = useCallback(() => {
    if (onMockExamClick) {
      onMockExamClick()
    } else {
      window.location.href = '/'
    }
  }, [onMockExamClick])

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      setIsMobileMenuOpen(false)
      navigate('/', { replace: true })
      window.location.reload()
    } catch {
      // API 호출 실패해도 클라이언트 측 토큰은 제거하고 로그아웃 처리
      authUtils.removeAllTokens()
      setIsMobileMenuOpen(false)
      navigate('/', { replace: true })
      window.location.reload()
    }
  }, [navigate])

  const handleMobileNavClick = useCallback(
    (href: string) => {
      setIsMobileMenuOpen(false)
      navigate(href)
    },
    [navigate],
  )

  return (
    <header className="w-full bg-background-alternative">
      {/* Desktop/Tablet Header */}
      <div className="h-[90px] max-lg:h-[72px] max-md:hidden">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-5 max-lg:px-10">
          <a href="/" className="flex items-center shrink-0">
            <img
              src={logoUrl}
              alt="Quizly Logo"
              className="h-[32px] w-[120px] max-lg:h-[24px] max-lg:w-[90px]"
            />
          </a>

          <nav className="flex items-center whitespace-nowrap">
            <a
              href="/"
              className={`text-1rg-medium max-lg:text-3sm-medium px-3 py-2 shrink-0 hover:text-primary-normal transition-colors ${
                location.pathname === '/' && !isMockExamModalOpen
                  ? 'text-primary-normal'
                  : 'text-gray-normal'
              }`}
            >
              문제 만들기
            </a>
            <button
              onClick={handleMockExamClick}
              className={`text-1rg-medium max-lg:text-3sm-medium px-3 py-2 shrink-0 ml-10 max-lg:ml-6 hover:text-primary-normal transition-colors ${
                location.pathname === '/mock-exam' || isMockExamModalOpen
                  ? 'text-primary-normal'
                  : 'text-gray-normal'
              }`}
            >
              실전 모의고사
            </button>
            <a
              href="/my-quizzes"
              className={`text-1rg-medium max-lg:text-3sm-medium px-3 py-2 shrink-0 ml-10 max-lg:ml-6 hover:text-primary-normal transition-colors ${
                location.pathname === '/my-quizzes'
                  ? 'text-primary-normal'
                  : 'text-gray-normal'
              }`}
            >
              문제 모아보기
            </a>
            <a
              href="/wrong-quizzes"
              className={`text-1rg-medium max-lg:text-3sm-medium px-3 py-2 shrink-0 ml-10 max-lg:ml-6 hover:text-primary-normal transition-colors ${
                location.pathname === '/wrong-quizzes'
                  ? 'text-primary-normal'
                  : 'text-gray-normal'
              }`}
            >
              틀린문제 풀어보기
            </a>
            {isAuthenticated ? (
              // 유저 정보 로딩 중이 아니고 userInfo가 있을 때만 프로필 표시
              !isUserInfoLoading && userInfo ? (
                <button
                  onClick={handleProfileClick}
                  className="ml-10 max-lg:ml-6 flex items-center gap-1 shrink-0 cursor-pointer"
                  aria-label="프로필 페이지로 이동"
                >
                  {/* 프로필 이미지 - Figma 디자인에 맞춰 녹색 테두리 추가 */}
                  <div className="relative w-[38px] h-[38px] max-lg:w-[32px] max-lg:h-[32px] flex items-center justify-center">
                    {/* 외곽 원: 38x38, stroke #30a10e */}
                    <div className="absolute inset-0 rounded-full border-2 max-lg:border-[1.5px] border-primary-normal"></div>
                    {/* 내부 원: 34.5x34.5, fill #efefef */}
                    <div className="w-[34.5px] h-[34.5px] max-lg:w-[29px] max-lg:h-[29px] rounded-full bg-fill-alternative overflow-hidden flex items-center justify-center">
                      <img
                        src={userInfo.profileImageUrl || '/icon/default.svg'}
                        alt="프로필"
                        className={`w-full h-full rounded-full ${userInfo.profileImageUrl && !userInfo.profileImageUrl.includes('/icon/default.svg') ? 'object-cover' : 'object-contain'}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (
                            target.src !==
                            `${window.location.origin}/icon/default.svg`
                          ) {
                            target.src = '/icon/default.svg'
                            target.className = target.className.replace(
                              'object-cover',
                              'object-contain',
                            )
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* 닉네임 텍스트 - 프로필 이미지가 없어도 닉네임은 항상 표시 */}
                  {userInfo.nickName ? (
                    <span className="text-2sm-regular max-lg:text-1sm-regular text-primary-normal">
                      {userInfo.nickName}
                    </span>
                  ) : (
                    // 닉네임이 없을 경우 기본값 표시 (필요시)
                    <span className="text-2sm-regular max-lg:text-1sm-regular text-primary-normal">
                      사용자
                    </span>
                  )}
                </button>
              ) : (
                // 로딩 중일 때는 공간만 유지 (깜빡임 방지)
                <div className="ml-10 max-lg:ml-6 w-[38px] h-[38px] max-lg:w-[32px] max-lg:h-[32px] shrink-0" />
              )
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={handleLoginClick}
                className="text-2sm-regular max-lg:text-2xs-regular ml-10 max-lg:ml-6 w-[70px] max-lg:w-16 whitespace-nowrap shrink-0"
              >
                로그인
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="hidden max-md:block relative">
        <div className="flex items-center justify-between h-[46px] px-5 py-3">
          <a href="/" className="flex items-center">
            <img
              src={logoUrl}
              alt="Quizly Logo"
              className="h-[22px] w-[84px]"
            />
          </a>

          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="relative w-[26px] h-[26px] z-[30]"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            <span className="absolute top-[15.63%] left-[9.38%] right-[9.38%] h-[6.25%] bg-static-black rounded-full" />
            <span className="absolute top-[46.88%] left-[9.38%] right-[9.38%] h-[6.25%] bg-static-black rounded-full" />
            <span className="absolute bottom-[15.63%] left-[9.38%] right-[9.38%] h-[6.25%] bg-static-black rounded-full" />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* 전체 화면 오버레이 */}
            <div
              className="fixed inset-0 bg-static-black/50 z-[40]"
              onClick={handleMobileMenuClose}
            />
            {/* 사이드 메뉴 - 헤더 위에 표시 */}
            <div className="fixed top-0 right-0 bottom-0 w-[calc(100vw-35px)] max-w-[300px] bg-background-elevated z-[60] shadow-lg overflow-y-auto">
              <div className="flex flex-col h-full">
                {/* Menu Content */}
                <div className="flex-1 flex flex-col">
                  {/* User Section */}
                  <div className="px-5 pt-10 pb-4">
                    {isAuthenticated ? (
                      // 로그인 상태: 닉네임, 로그아웃 버튼, 프로필 이미지
                      !isUserInfoLoading && userInfo ? (
                        <>
                          {/* 닉네임과 프로필 */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-2md-medium text-gray-normal mb-2">
                                {userInfo.nickName || '사용자'}
                              </h3>
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-1"
                              >
                                <span className="text-2sm-regular text-gray-alternative">
                                  로그아웃
                                </span>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 28 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-gray-alternative"
                                >
                                  <path
                                    d="M18 8L22 14L18 20"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                            {/* 프로필 이미지 */}
                            <button
                              onClick={handleProfileClick}
                              className="relative w-[60px] h-[60px] flex items-center justify-center shrink-0 cursor-pointer"
                              aria-label="대시보드로 이동"
                            >
                              {/* 외곽 원: 60x60, stroke primary (1.5px) */}
                              <div className="absolute inset-0 rounded-full border-[1.5px] border-primary-normal"></div>
                              {/* 내부 원: 57x57 (60 - 3px border), fill #efefef */}
                              <div className="w-[57px] h-[57px] rounded-full bg-fill-alternative overflow-hidden">
                                <img
                                  src={
                                    userInfo.profileImageUrl ||
                                    '/icon/default.svg'
                                  }
                                  alt="프로필"
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    if (
                                      target.src !==
                                      `${window.location.origin}/icon/default.svg`
                                    ) {
                                      target.src = '/icon/default.svg'
                                    }
                                  }}
                                />
                              </div>
                            </button>
                          </div>

                          {/* 배너 - 로그아웃 버튼 아래 */}
                          <div className="bg-primary-subtle rounded-xs px-3 py-3 mb-3">
                            <p className="text-2sm-regular text-primary-normal whitespace-nowrap">
                              오늘{' '}
                              {todaySummaryData?.todaySummary.solvedCount ?? 0}
                              개의 문제 풀이를 진행했어요!
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="px-5 py-3">
                          <div className="w-[60px] h-[60px] rounded-full bg-fill-alternative animate-pulse" />
                        </div>
                      )
                    ) : (
                      // 비로그인 상태: 로그인 해주세요, 로그인 버튼, 녹색 원
                      <>
                        {/* 로그인 해주세요와 로그인 버튼 */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-2md-medium text-gray-normal mb-2">
                              로그인 해주세요
                            </h3>
                            <button
                              onClick={() => handleMobileNavClick('/login')}
                              className="flex items-center gap-1"
                            >
                              <span className="text-2sm-regular text-gray-alternative">
                                로그인
                              </span>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 28 28"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-alternative"
                              >
                                <path
                                  d="M18 8L22 14L18 20"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                          {/* 녹색 원 - quizly.svg 적용 */}
                          <div className="w-[60px] h-[60px] rounded-full bg-primary-normal shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src="/icon/quizly.svg"
                              alt="Quizly"
                              className="w-[60px] h-[60px] object-contain"
                            />
                          </div>
                        </div>

                        {/* 배너 - 로그인 버튼 아래, 구분선 위 */}
                        <div className="bg-primary-subtle rounded-xs px-3 py-3 mb-3">
                          <p className="text-2sm-regular text-primary-normal whitespace-nowrap">
                            회원가입하면 다양한 문제 제작이 가능해요!
                          </p>
                        </div>
                      </>
                    )}

                    {/* 구분선 */}
                    <div className="h-[1px] bg-line-normal -mx-5" />
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col px-5 pt-4">
                    <button
                      onClick={() => handleMobileNavClick('/')}
                      className="text-1md-medium text-left py-3 text-gray-normal hover:bg-background-alternative"
                    >
                      문제 만들기
                    </button>
                    <button
                      onClick={() => {
                        handleMobileMenuClose()
                        handleMockExamClick()
                      }}
                      className="text-1md-medium text-left py-3 text-gray-normal hover:bg-background-alternative"
                    >
                      실전 모의고사
                    </button>
                    <button
                      onClick={() => handleMobileNavClick('/my-quizzes')}
                      className="text-1md-medium text-left py-3 text-gray-normal hover:bg-background-alternative"
                    >
                      문제 모아보기
                    </button>
                    <button
                      onClick={() => handleMobileNavClick('/wrong-quizzes')}
                      className="text-1md-medium text-left py-3 text-gray-normal hover:bg-background-alternative"
                    >
                      틀린문제 풀어보기
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

Header.displayName = 'Header'

export default Header
