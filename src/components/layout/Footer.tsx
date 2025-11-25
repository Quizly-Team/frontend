const Footer = () => {
  return (
    <footer className="w-full bg-bg-footer h-[80px]">
      <div className="h-full flex items-center justify-center">
        <div className="max-w-[1024px] w-full px-xl max-lg:px-15 flex items-center justify-center gap-3 max-lg:gap-[clamp(6px,1.2vw,12px)] max-md:hidden whitespace-nowrap">
          <a
            href="https://www.notion.so/2480d810a5198028a431f471d3327ce0?source=copy_link"
            className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0"
          >
            이용약관
          </a>

          <a
            href="/privacy"
            className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0"
          >
            개인정보처리방침
          </a>

          <p className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0">
            Team. 에스F레소
          </p>

          <a
            href="mailto:liz021229@gmail.com"
            className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0"
          >
            문의: liz021229@gmail.com
          </a>

          <p className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0">
            © 2025 Quizly. All rights reserved.
          </p>
        </div>

        {/* Mobile Footer */}
        <div className="hidden max-md:flex flex-col items-center justify-center gap-xs px-margin-mobile">
          <div className="flex items-center gap-2">
            <a
              href="https://www.notion.so/2480d810a5198028a431f471d3327ce0?source=copy_link"
              className="text-tint-regular text-gray-600"
            >
              이용약관
            </a>
            <span className="text-tint-regular text-gray-600">|</span>
            <a href="/privacy" className="text-tint-regular text-gray-600">
              개인정보처리방침
            </a>
          </div>

          <p className="text-tint-regular text-gray-600 text-center">
            Team. 에스F레소
          </p>

          <a
            href="mailto:liz021229@gmail.com"
            className="text-tint-regular text-gray-600 text-center"
          >
            문의: liz021229@gmail.com
          </a>

          <p className="text-tint-regular text-gray-600 text-center">
            © 2025 Quizly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';

export default Footer;
