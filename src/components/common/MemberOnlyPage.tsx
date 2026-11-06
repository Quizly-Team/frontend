import { Header } from '@/components'

type MemberOnlyPageProps = {
  variant?: 'full' | 'simple'
}

const MemberOnlyPage = ({ variant = 'full' }: MemberOnlyPageProps) => {
  if (variant === 'simple') {
    return (
      <div className="min-h-screen bg-background-alternative flex flex-col">
        <Header logoUrl="/logo.svg" />

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className="text-1xl-bold max-md:text-2lg-bold text-gray-normal text-center mb-4">
            이 페이지는 비회원 전용입니다
          </h1>
          <p className="text-2md-regular max-md:text-1rg-regular text-gray-alternative text-center mb-10">
            회원은 이 페이지에 접근할 수 없습니다.
            <br />
            로그아웃 후 이용해주세요.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="text-1rg-regular bg-primary-normal text-static-white px-l py-4 rounded-[6px] hover:bg-primary-normal/90 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </main>
      </div>
    )
  }

  // Full variant with characters
  return (
    <div className="min-h-screen bg-background-alternative flex flex-col">
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
        <h1 className="text-1xl-bold text-gray-normal text-center mb-4">
          이 페이지는 비회원 전용입니다
        </h1>

        {/* Description */}
        <p className="text-2md-regular text-gray-alternative text-center mb-10">
          회원은 이 페이지에 접근할 수 없습니다.
          <br />
          로그아웃 후 이용해주세요.
        </p>

        {/* Home Button */}
        <button
          onClick={() => (window.location.href = '/')}
          className="text-1rg-regular bg-primary-normal text-static-white px-l py-4 rounded-[6px] hover:bg-primary-normal/90 transition-colors"
        >
          홈으로 돌아가기
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
        <h1 className="text-2lg-bold text-gray-normal text-center mb-3">
          이 페이지는 비회원 전용입니다
        </h1>

        {/* Description */}
        <p className="text-1rg-regular text-gray-alternative text-center mb-8">
          회원은 이 페이지에 접근할 수 없습니다.
          <br />
          로그아웃 후 이용해주세요.
        </p>

        {/* Home Button */}
        <button
          onClick={() => (window.location.href = '/')}
          className="text-1rg-regular bg-primary-normal text-static-white px-l py-[14px] rounded-[6px] hover:bg-primary-normal/90 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </main>
    </div>
  )
}

MemberOnlyPage.displayName = 'MemberOnlyPage'

export default MemberOnlyPage
