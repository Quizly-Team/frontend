const Footer = () => {
  return (
    <footer className="w-full bg-bg-footer h-[80px] max-md:h-[128px]">
      <div className="h-full flex items-center justify-center">
        <div className="max-w-[1024px] w-full px-xl max-lg:px-15 flex items-center justify-center gap-3 max-lg:gap-[clamp(6px,1.2vw,12px)] max-md:hidden whitespace-nowrap">
          <a
            href="https://www.notion.so/2480d810a5198028a431f471d3327ce0?source=copy_link"
            className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0"
          >
            이용약관
          </a>

          <a
            href="https://www.notion.so/2480d810a51980b8831edc3dbb13333d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0"
          >
            개인정보처리방침
          </a>

          <p className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0">
            Team. 에스F레소
          </p>

          <a
            href="mailto:quizlystudy@gmail.com"
            className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0"
          >
            문의: quizlystudy@gmail.com
          </a>

          <p className="text-[14px] max-lg:text-[clamp(12px,1.5vw,14px)] text-gray-600 px-s py-xs leading-[1.4] shrink-0">
            © 2025 Quizly. All rights reserved.
          </p>
        </div>

        {/* Mobile Footer */}
        <div className="hidden max-md:flex flex-col items-start justify-center pl-[20px]">
          <div className="flex items-center gap-2">
            <a
              href="https://www.notion.so/2480d810a5198028a431f471d3327ce0?source=copy_link"
              className="text-[14px] text-gray-600 leading-[19.6px] px-s py-xs h-[36px] flex items-center"
            >
              이용약관
            </a>
            <a 
              href="https://www.notion.so/2480d810a51980b8831edc3dbb13333d" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-gray-600 leading-[19.6px] px-s py-xs h-[36px] flex items-center"
            >
              개인정보처리방침
            </a>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-[14px] text-gray-600 leading-[19.6px] px-s py-xs h-[36px] flex items-center">
              Team. 에스F레소
            </p>
            <a
              href="mailto:quizlystudy@gmail.com"
              className="text-[14px] text-gray-600 leading-[19.6px] px-s py-xs h-[36px] flex items-center"
            >
              문의: quizlystudy@gmail.com
            </a>
          </div>

          <p className="text-[14px] text-gray-600 leading-[19.6px] px-s py-xs h-[36px] flex items-center">
            © 2025 Quizly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';

export default Footer;
