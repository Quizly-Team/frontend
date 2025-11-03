const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 py-xxl">
      <div className="container">
        <div className="flex items-center justify-center gap-m max-md:flex-col max-md:gap-s">
          <a
            href="/terms"
            className="text-tint-regular text-gray-600 px-s py-xs"
          >
            이용약관
          </a>

          <a
            href="/privacy"
            className="text-tint-regular text-gray-600 px-s py-xs"
          >
            개인정보처리방침
          </a>

          <p className="text-tint-regular text-gray-600 px-s py-xs">
            Team. 에스F레소
          </p>

          <a
            href="mailto:liz021229@gmail.com"
            className="text-tint-regular text-gray-600 px-s py-xs"
          >
            문의: liz021229@gmail.com
          </a>

          <p className="text-tint-regular text-gray-600 px-s py-xs">
            © 2025 Quizly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
