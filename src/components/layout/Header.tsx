import { Button } from '@/components';

type HeaderProps = {
  logoUrl?: string;
  onLoginClick?: () => void;
};

const Header = ({ logoUrl = '/logo.svg', onLoginClick }: HeaderProps) => {
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <header className="w-full bg-bg-home">
      {/* Desktop/Tablet Header */}
      <div className="h-[90px] max-lg:h-[72px] max-md:hidden">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-xl max-lg:px-15">
          <div className="flex items-center">
            <img
              src={logoUrl}
              alt="Quizly Logo"
              className="h-[32px] w-[120px]"
            />
          </div>

          <nav className="flex items-center gap-xxl">
            <a href="/create" className="text-body3-medium text-gray-900">
              문제 만들기
            </a>
            <a href="/mock-exam" className="text-body3-medium text-gray-900">
              실전 모의고사
            </a>
            <a href="/my-quizzes" className="text-body3-medium text-gray-900">
              문제 모아보기
            </a>
            <a
              href="/wrong-quizzes"
              className="text-body3-medium text-gray-900"
            >
              틀린문제 풀어보기
            </a>
            <Button
              variant="primary"
              size="medium"
              onClick={handleLoginClick}
            >
              로그인
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="hidden max-md:flex items-center justify-between h-[50px] px-5 py-s">
        <div className="flex items-center">
          <img src={logoUrl} alt="Quizly Logo" className="h-[22px] w-[84px]" />
        </div>

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

Header.displayName = 'Header';

export default Header;
