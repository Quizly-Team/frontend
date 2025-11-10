import type { ReactElement } from 'react';

type IconName =
  | 'search'
  | 'light'
  | 'write'
  | 'book'
  | 'close'
  | 'calendar'
  | 'check'
  | 'delete'
  | 'upload'
  | 'note'
  | 'checkbox'
  | 'memo'
  | 'menu'
  | 'arrow'
  | 'correct'
  | 'error';

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  onClick?: () => void;
};

const Icon = ({ name, size = 28, className = '', onClick }: IconProps) => {
  const getIconMap = (): Record<IconName, ReactElement> => ({
    search: (
      <img
        src="./public/icon/search.svg"
        alt="search"
        width={size}
        height={size}
        className={className}
      />
    ),
    light: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 2V4M14 24V26M26 14H24M4 14H2M22.36 5.64L20.95 7.05M7.05 20.95L5.64 22.36M22.36 22.36L20.95 20.95M7.05 7.05L5.64 5.64"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    write: (
      <img
        src="./public/icon/write.svg"
        alt="search"
        width={size}
        height={size}
        className={className}
      />
    ),
    book: (
      <img
        src="./public/icon/book.svg"
        alt="search"
        width={size}
        height={size}
        className={className}
      />
    ),
    close: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 7L7 21M7 7L21 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    calendar: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3.5"
          y="6.5"
          width="21"
          height="18"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M3.5 10.5H24.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 3.5V8.5M20 3.5V8.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    check: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="14" cy="14" r="13" className="fill-primary" />
        <path
          d="M8 14L12 18L20 10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    delete: (
      <img
        src="./public/icon/delete.svg"
        alt="search"
        width={size}
        height={size}
        className={className}
      />
    ),
    upload: (
      <img
        src="./public/icon/upload.svg"
        alt="search"
        width={size}
        height={size}
        className={className}
      />
    ),
    note: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="3"
          width="18"
          height="22"
          rx="2"
          className="fill-[#dcb89d] stroke-[#dcb89d]"
        />
        <path
          d="M8 9H18M8 13H18M8 17H18M8 21H18"
          className="stroke-[#4a4848]"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    checkbox: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="22"
          height="22"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 14L12 18L20 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    memo: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="6"
          y="5"
          width="16"
          height="18"
          rx="2"
          className="fill-[#f4b940] stroke-[#f4b940]"
        />
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="2"
          className="fill-[#ffe9bd] stroke-[#ffe9bd]"
        />
        <circle cx="10" cy="12" r="2" className="fill-error" />
      </svg>
    ),
    menu: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="5" width="26" height="2" rx="1" fill="currentColor" />
        <rect x="3" y="15" width="26" height="2" rx="1" fill="currentColor" />
        <rect x="3" y="25" width="26" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
    arrow: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 8L14 14L10 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    correct: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="19" className="fill-primary opacity-10" />
        <circle cx="20" cy="20" r="19" className="stroke-primary" strokeWidth="2" />
        <path
          d="M12 20L18 26L28 14"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    error: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="19" className="fill-error opacity-10" />
        <circle cx="20" cy="20" r="19" className="stroke-error" strokeWidth="2" />
        <path
          d="M26 14L14 26M14 14L26 26"
          className="stroke-error"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  });

  const iconMap = getIconMap();

  const containerStyles = onClick
    ? `inline-flex items-center justify-center cursor-pointer ${className}`
    : `inline-flex items-center justify-center ${className}`;

  return (
    <div
      className={containerStyles}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {iconMap[name]}
    </div>
  );
};

Icon.displayName = 'Icon';

export default Icon;
