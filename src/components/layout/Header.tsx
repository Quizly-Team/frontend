type HeaderProps = {
  logoUrl?: string;
};

const Header = ({ logoUrl = '/logo.svg' }: HeaderProps) => {
  return (
    <header className="w-full bg-white">
      {/* Desktop/Tablet Header */}
      <div className="container flex items-center justify-between h-[80px] max-md:hidden">
        <div className="flex items-center">
          <img src={logoUrl} alt="Quizly Logo" className="h-[22px] w-[84px]" />
        </div>

        <nav className="flex items-center gap-xl">
          <a href="/create" className="text-body3-medium text-gray-900">
            문제 만들기
          </a>
          <a href="/my-quizzes" className="text-body3-medium text-gray-900">
            내 문제
          </a>
          <a href="/login" className="text-body3-medium text-gray-900">
            로그인
          </a>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="hidden max-md:flex items-center justify-between h-[46px] px-margin-mobile py-s">
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

export default Header;
