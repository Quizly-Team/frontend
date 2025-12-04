import { useCallback, useState, useEffect } from "react";
import { Header } from "@/components/layout";
import { oauthLogin } from "@/lib/oauth";
import { authUtils } from "@/lib/auth";

type LoginPageProps = {
  termsUrl?: string;
  privacyUrl?: string;
};

const LoginPage = ({ 
  termsUrl, 
  privacyUrl 
}: LoginPageProps = {}) => {
  const [lastLoginProvider, setLastLoginProvider] = useState<'naver' | 'kakao' | null>(null);

  // 환경변수 또는 props로 링크 설정 가능
  const defaultTermsUrl = termsUrl || import.meta.env.VITE_TERMS_URL || "https://www.notion.so/2480d810a5198028a431f471d3327ce0";
  const defaultPrivacyUrl = privacyUrl || import.meta.env.VITE_PRIVACY_URL || "https://www.notion.so/2480d810a51980b8831edc3dbb13333d";
  
  useEffect(() => {
    // 로그인하지 않은 상태에서만 최근 로그인 정보 표시
    if (!authUtils.isAuthenticated()) {
      const provider = authUtils.getLastLoginProvider();
      setLastLoginProvider(provider);
    }
  }, []);

  const handleNaverLogin = useCallback(() => {
    oauthLogin("naver");
  }, []);

  const handleKakaoLogin = useCallback(() => {
    oauthLogin("kakao");
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Header logoUrl="/logo.svg" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {/* Login Box */}
        <div className="bg-white rounded-[24px] border border-[#dedede] w-full max-w-[500px] px-[75px] py-[72px] flex flex-col items-center">
          {/* Logo */}
          <div className="w-[170px] h-[60px] mb-[20px] flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Quizly Logo"
              className="h-full w-auto"
            />
          </div>

          {/* Title */}
          <h1 className="text-[24px] font-bold text-[#222222] text-center mb-[16px] leading-[33.6px]">
            학습을 더 쉽고 재미있게
          </h1>

          {/* Description */}
          <p className="text-[16px] font-normal text-[#777777] text-center mb-[56px] leading-[22.4px]">
            로그인하고 문제를 더 많이 만들어보세요!
          </p>

          {/* SignIn Buttons */}
          <div className="w-full flex flex-col gap-4 mb-[48px]">
            {/* Naver Button */}
            <div className="relative">
              <button
                onClick={handleNaverLogin}
                className="w-full h-[48px] bg-[#00c73c] hover:bg-[#00b836] transition-colors rounded-[6px] flex items-center justify-center gap-2"
              >
                <img
                  src="/icon/naver.svg"
                  alt="Naver"
                  className="w-6 h-6"
                />
                <span className="text-[16px] font-normal text-white leading-[19.09px]">
                  Naver로 계속하기
                </span>
              </button>
              {/* Recent Login Badge for Naver */}
              {lastLoginProvider === 'naver' && (
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-[180px] bg-[#333333] rounded-[4px] px-3 py-2 z-10">
                  <p className="text-[14px] font-normal text-white text-center leading-[19.6px]">
                    최근에 로그인한 수단입니다.
                  </p>
                  {/* 삼각형 포인터 (왼쪽을 가리킴) */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-[6px] w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#333333]"></div>
                </div>
              )}
            </div>

            {/* Kakao Button */}
            <div className="relative">
              <button
                onClick={handleKakaoLogin}
                className="w-full h-[48px] bg-[#fddc3f] hover:bg-[#fcd52a] transition-colors rounded-[6px] flex items-center justify-center gap-2"
              >
                <img
                  src="/icon/kakao.svg"
                  alt="Kakao"
                  className="w-6 h-6"
                />
                <span className="text-[16px] font-normal text-[#222222] leading-[19.09px]">
                  Kakao로 계속하기
                </span>
              </button>
              {/* Recent Login Badge for Kakao */}
              {lastLoginProvider === 'kakao' && (
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-[180px] bg-[#333333] rounded-[4px] px-3 py-2 z-10">
                  <p className="text-[14px] font-normal text-white text-center leading-[19.6px]">
                    최근에 로그인한 수단입니다.
                  </p>
                  {/* 삼각형 포인터 (왼쪽을 가리킴) */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-[6px] w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#333333]"></div>
                </div>
              )}
            </div>
          </div>

          {/* Terms Notice */}
          <p className="text-[14px] font-normal text-[#777777] text-center leading-[19.6px]">
            로그인을 진행할시{' '}
            <a
              href={defaultTermsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              이용약관
            </a>
            과<br />
            <a
              href={defaultPrivacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              개인정보처리방침
            </a>
            에 동의하게 됩니다.
          </p>

          {/* Recent Login Badge (Optional - can be shown conditionally) */}
          {/* <div className="mt-4 bg-[#333333] rounded-[4px] px-3 py-2">
            <p className="text-[14px] font-normal text-white text-center leading-[19.6px]">
              최근에 로그인한 수단입니다.
            </p>
          </div> */}
        </div>
      </main>
    </div>
  );
};

LoginPage.displayName = "LoginPage";

export default LoginPage;

