const Footer = () => {
  return (
    <footer className="w-full bg-bg-footer">
      <div className="py-10 flex items-center justify-center">
        <div className="max-w-[1024px] w-full px-xl max-lg:px-15 flex items-center justify-center gap-3 max-md:hidden">
          <a
            href="https://www.notion.so/2480d810a5198028a431f471d3327ce0?source=copy_link"
            className="text-footer text-gray-600 px-s py-xs"
          >
            이용약관
          </a>

          <a
            href="/privacy"
            className="text-footer text-gray-600 px-s py-xs"
          >
            개인정보처리방침
          </a>

          <p className="text-footer text-gray-600 px-s py-xs">
            Team. 에스F레소
          </p>

          <a
            href="mailto:liz021229@gmail.com"
            className="text-footer text-gray-600 px-s py-xs"
          >
            문의: liz021229@gmail.com
          </a>

          <p className="text-footer text-gray-600 px-s py-xs">
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
