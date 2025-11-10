import { Modal as MuiModal } from "@mui/material";
import { useCallback } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const handleSignup = useCallback(() => {
    // TODO: 소셜 로그인 회원가입 구현
    console.log("회원가입 클릭");
  }, []);

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="relative outline-none">
        {/* Modal Container */}
        <div className="bg-white rounded-[24px] border border-gray-200 w-[500px] relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-[24px] right-[24px] w-[28px] h-[28px] flex items-center justify-center hover:bg-gray-100 rounded-[4px] transition-colors"
            aria-label="닫기"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="#222222"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="pt-[72px] pb-[48px] px-[75px] flex flex-col items-center">
            {/* Title */}
            <h2 className="text-header3-bold text-gray-900 text-center mb-[16px] whitespace-pre-wrap">
              {"요약한 내용을 문제로!\n복습까지 챙겨주는 나만의 AI"}
            </h2>

            {/* Description */}
            <p className="text-body2-regular text-gray-600 text-center mb-[56px] whitespace-pre-wrap">
              {"로그인하고 나만의 문제를\n더 많이 만들어보세요!"}
            </p>

            {/* SignIn Button */}
            <button
              onClick={handleSignup}
              className="w-[350px] bg-secondary text-primary text-body3-regular px-[16px] py-[12px] rounded-[6px] hover:bg-secondary/80 transition-colors mb-4"
            >
              네이버로 시작하기
            </button>
            <button
              onClick={handleSignup}
              className="w-[350px] bg-secondary text-primary text-body3-regular px-[16px] py-[12px] rounded-[6px] hover:bg-secondary/80 transition-colors"
            >
              카카오로 시작하기
            </button>
          </div>
        </div>
      </div>
    </MuiModal>
  );
};

LoginModal.displayName = "LoginModal";

export default LoginModal;
