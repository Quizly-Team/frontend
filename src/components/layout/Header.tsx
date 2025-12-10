import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components";
import { authUtils } from "@/lib/auth";

type HeaderProps = {
  logoUrl?: string;
  onMockExamClick?: () => void;
};

const Header = ({ logoUrl = "/logo.svg", onMockExamClick }: HeaderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
  }, []);

  const handleLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const handleLogoutClick = useCallback(() => {
    authUtils.logout();
    setIsAuthenticated(false);
    window.location.reload();
  }, []);

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
              <Button
                variant="primary"
                size="small"
                onClick={handleLogoutClick}
                className="ml-4 max-lg:ml-2 w-[70px] max-lg:w-16 whitespace-nowrap text-tint-regular max-lg:text-xs shrink-0"
              >
                로그아웃
              </Button>
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
