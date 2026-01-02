import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components";
import { authUtils } from "@/lib/auth";
import { useUser } from "@/contexts/UserContext";

type HeaderProps = {
  logoUrl?: string;
  onMockExamClick?: () => void;
};

const Header = ({ logoUrl = "/logo.svg", onMockExamClick }: HeaderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { userInfo, isLoading: isUserInfoLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
  }, []);

  const handleLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    navigate("/analytics");
  }, [navigate]);

  const handleMockExamClick = useCallback(() => {
    if (onMockExamClick) {
      onMockExamClick();
    } else {
      window.location.href = "/";
    }
  }, [onMockExamClick]);

  return (
    <header className="w-full bg-bg-home">
      {/* Desktop/Tablet Header */}
      <div className="h-[90px] max-lg:h-[72px] max-md:hidden">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-xl max-lg:px-15">
          <a href="/" className="flex items-center shrink-0">
            <img
              src={logoUrl}
              alt="Quizly Logo"
              className="h-[32px] w-[120px] max-lg:h-[26px] max-lg:w-[98px]"
            />
          </a>

          <nav className="flex items-center whitespace-nowrap">
            <a
              href="/"
              className="text-gray-900 px-3 py-2 text-base leading-[1.4] font-medium shrink-0 max-lg:text-sm"
            >
              문제 만들기
            </a>
            <button
              onClick={handleMockExamClick}
              className="text-gray-900 px-3 py-2 text-base leading-[1.4] font-medium shrink-0 ml-12 max-lg:ml-2 hover:text-primary transition-colors"
            >
              실전 모의고사
            </button>
            <a
              href="/my-quizzes"
              className="text-gray-900 px-3 py-2 text-base leading-[1.4] font-medium shrink-0 ml-8 max-lg:ml-2"
            >
              문제 모아보기
            </a>
            <a
              href="/wrong-quizzes"
              className="text-gray-900 px-3 py-2 text-base leading-[1.4] font-medium shrink-0 ml-6 max-lg:ml-2"
            >
              틀린문제 풀어보기
            </a>
            {isAuthenticated ? (
              // 유저 정보 로딩 중이 아니고 userInfo가 있을 때만 프로필 표시
              !isUserInfoLoading && userInfo ? (
                <button
                  onClick={handleProfileClick}
                  className="ml-4 max-lg:ml-2 flex items-center gap-2 shrink-0 cursor-pointer"
                  aria-label="프로필 페이지로 이동"
                >
                  {/* 프로필 이미지 - Figma 디자인에 맞춰 녹색 테두리 추가 */}
                  <div className="relative w-[38px] h-[38px] max-lg:w-[32px] max-lg:h-[32px] flex items-center justify-center">
                    {/* 외곽 원: 38x38, stroke #30a10e */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary"></div>
                    {/* 내부 원: 34.5x34.5, fill #efefef */}
                    <div className="w-[34.5px] h-[34.5px] max-lg:w-[28px] max-lg:h-[28px] rounded-full bg-[#efefef] overflow-hidden flex items-center justify-center">
                      {userInfo.profileImageUrl ? (
                        <img
                          src={userInfo.profileImageUrl}
                          alt="프로필"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src="/icon/default.svg"
                          alt="프로필"
                          className="w-[20px] h-[20px] max-lg:w-[16px] max-lg:h-[16px] object-cover"
                        />
                      )}
                    </div>
                  </div>
                  {/* 닉네임 텍스트 - 프로필 이미지가 없어도 닉네임은 항상 표시 */}
                  {userInfo.nickName ? (
                    <span className="text-[14px] text-primary font-normal max-lg:text-xs">
                      {userInfo.nickName}
                    </span>
                  ) : (
                    // 닉네임이 없을 경우 기본값 표시 (필요시)
                    <span className="text-[14px] text-primary font-normal max-lg:text-xs">
                      사용자
                    </span>
                  )}
                </button>
              ) : (
                // 로딩 중일 때는 공간만 유지 (깜빡임 방지)
                <div className="ml-4 max-lg:ml-2 w-[38px] h-[38px] max-lg:w-[32px] max-lg:h-[32px] shrink-0" />
              )
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={handleLoginClick}
                className="ml-4 max-lg:ml-2 w-[70px] max-lg:w-16 whitespace-nowrap text-tint-regular max-lg:text-xs shrink-0"
              >
                로그인
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="hidden max-md:flex items-center justify-between h-[46px] px-5 py-3">
        <a href="/" className="flex items-center">
          <img src={logoUrl} alt="Quizly Logo" className="h-[22px] w-[84px]" />
        </a>

        <button
          type="button"
          className="relative w-[26px] h-[26px]"
          aria-label="메뉴 열기"
        >
          <span className="absolute top-[15.63%] left-[9.38%] right-[9.38%] h-[6.25%] bg-black rounded-[100px]" />
          <span className="absolute top-[46.88%] left-[9.38%] right-[9.38%] h-[6.25%] bg-black rounded-[100px]" />
          <span className="absolute bottom-[15.63%] left-[9.38%] right-[9.38%] h-[6.25%] bg-black rounded-[100px]" />
        </button>
      </div>
    </header>
  );
};

Header.displayName = "Header";

export default Header;
