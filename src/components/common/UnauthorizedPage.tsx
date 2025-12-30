import { Header } from '@/components';
import { useNavigate } from 'react-router-dom';

type UnauthorizedPageProps = {
  variant?: 'full' | 'simple';
};

const UnauthorizedPage = ({
  variant = 'full',
}: UnauthorizedPageProps) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };
  if (variant === 'simple') {
    return (
      <div className="min-h-screen bg-bg-home flex flex-col">
        <Header logoUrl="/logo.svg" />

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className="text-header1-bold text-gray-900 text-center mb-4 max-md:text-header3-bold">
            로그인이 필요합니다
          </h1>
          <p className="text-body1-regular text-gray-600 text-center mb-10 max-md:text-body3-regular">
            문제를 확인하려면 로그인해주세요.
          </p>
          <button
            onClick={handleLoginClick}
            className="bg-primary text-white text-body3-regular px-l py-4 rounded-[6px] hover:bg-primary/90 transition-colors"
          >
            로그인하기
          </button>
        </main>
      </div>
    );
  }

  // Full variant with characters
  return (
    <div className="min-h-screen bg-bg-home flex flex-col">
      <Header logoUrl="/logo.svg" />

      {/* Main Content - Web/Tablet */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-md:hidden">
        {/* Character Images */}
        <div className="flex gap-[15px] mb-10">
          <img
            src="/characters/character1.png"
            alt="캐릭터 1"
            className="w-[72px] h-[72px]"
          />
          <img
            src="/characters/character2.png"
            alt="캐릭터 2"
            className="w-[79px] h-[72px]"
          />
          <img
            src="/characters/character3.png"
            alt="캐릭터 3"
            className="w-[72px] h-[72px]"
          />
          <img
            src="/characters/character4.png"
            alt="캐릭터 4"
            className="w-[72px] h-[72px]"
          />
        </div>

        {/* Title */}
        <h1 className="text-header1-bold text-gray-900 text-center mb-4">
          문제를 확인하려면 회원가입 또는 로그인이 필요해요
        </h1>

        {/* Description */}
        <p className="text-body1-regular text-gray-600 text-center mb-10">
          퀴즐리 계정이 없다면 지금 바로 회원가입을 해보세요.
        </p>

        {/* Sign Up Button */}
        <button
          onClick={handleLoginClick}
          className="bg-primary text-white text-body3-regular px-l py-4 rounded-[6px] hover:bg-primary/90 transition-colors"
        >
          지금 가입하기
        </button>
      </main>

      {/* Main Content - Mobile */}
      <main className="hidden max-md:flex flex-1 flex-col items-center justify-center px-5">
        {/* Character Images */}
        <div className="flex gap-[7px] mb-6">
          <img
            src="/characters/character1.png"
            alt="캐릭터 1"
            className="w-[60px] h-[60px]"
          />
          <img
            src="/characters/character2.png"
            alt="캐릭터 2"
            className="w-[66px] h-[60px]"
          />
          <img
            src="/characters/character3.png"
            alt="캐릭터 3"
            className="w-[60px] h-[60px]"
          />
          <img
            src="/characters/character4.png"
            alt="캐릭터 4"
            className="w-[60px] h-[60px]"
          />
        </div>

        {/* Title */}
        <h1 className="text-header3-bold text-gray-900 text-center mb-3">
          문제를 확인하려면 회원가입
          <br />
          또는 로그인이 필요해요
        </h1>

        {/* Description */}
        <p className="text-body3-regular text-gray-600 text-center mb-8">
          퀴즐리 계정이 없다면 지금 바로 회원가입을 해보세요.
        </p>

        {/* Sign Up Button */}
        <button
          onClick={handleLoginClick}
          className="bg-primary text-white text-body3-regular px-l py-[14px] rounded-[6px] hover:bg-primary/90 transition-colors"
        >
          지금 가입하기
        </button>
      </main>

    </div>
  );
};

UnauthorizedPage.displayName = 'UnauthorizedPage';

export default UnauthorizedPage;
