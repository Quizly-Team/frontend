import type { ReactElement } from "react";

type IconName =
  | "search"
  | "light"
  | "write"
  | "book"
  | "close"
  | "calendar"
  | "delete"
  | "upload"
  | "note"
  | "checkbox"
  | "memo"
  | "menu"
  | "arrow"
  | "correct"
  | "error"
  | "correct_black"
  | "error_black"
  | "correct_red"
  | "correct_blue"
  | "error_red"
  | "error_blue"
  | "check"
  | "check_black"
  | "check_blue"
  | "check_red"
  | "check_green";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  onClick?: () => void;
};

const Icon = ({ name, size = 28, className = "", onClick }: IconProps) => {
  const getIconMap = (): Record<IconName, ReactElement> => ({
    search: (
      <img
        src="/icon/search.svg"
        alt="search"
        width={size}
        height={size}
        className={className}
      />
    ),
    light: (
      <img
        src="/icon/light.svg"
        alt="light"
        width={size}
        height={size}
        className={className}
      />
    ),
    write: (
      <img
        src="/icon/write.svg"
        alt="write"
        width={size}
        height={size}
        className={className}
      />
    ),
    book: (
      <img
        src="/icon/book.svg"
        alt="book"
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
      <img
        src="/icon/calender.svg"
        alt="book"
        width={size}
        height={size}
        className={className}
      />
    ),
    /* [제거됨]
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
    */
    delete: (
      <img
        src="/icon/delete.svg"
        alt="delete"
        width={size}
        height={size}
        className={className}
      />
    ),
    upload: (
      <img
        src="/icon/upload.svg"
        alt="upload"
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
      <img
        src="/icon/correct.svg"
        alt="correct"
        width={size}
        height={size}
        className={className}
      />
    ),
    correct_black: (
      <img
        src="/icon/correct_black.svg"
        alt="correct_black"
        width={size}
        height={size}
        className={className}
      />
    ),
    error: (
      <img
        src="/icon/error.svg"
        alt="error"
        width={size}
        height={size}
        className={className}
      />
    ),
    error_black: (
      <img
        src="/icon/error_black.svg"
        alt="error_black"
        width={size}
        height={size}
        className={className}
      />
    ),
    correct_red: (
      <img
        src="/icon/correct_red.svg"
        alt="correct_red"
        width={size}
        height={size}
        className={className}
      />
    ),
    correct_blue: (
      <img
        src="/icon/correct_blue.svg"
        alt="correct_blue"
        width={size}
        height={size}
        className={className}
      />
    ),
    error_red: (
      <img
        src="/icon/error_red.svg"
        alt="error_red"
        width={size}
        height={size}
        className={className}
      />
    ),
    error_blue: (
      <img
        src="/icon/error_blue.svg"
        alt="error_blue"
        width={size}
        height={size}
        className={className}
      />
    ),
    check: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 14L12 18L20 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    check_black: (
      <img
        src="/icon/check_black.svg"
        alt="check_black"
        width={size}
        height={size}
        className={className}
      />
    ),
    check_blue: (
      <img
        src="/icon/check_blue.svg"
        alt="check_blue"
        width={size}
        height={size}
        className={className}
      />
    ),
    check_red: (
      <img
        src="/icon/check_red.svg"
        alt="check_red"
        width={size}
        height={size}
        className={className}
      />
    ),
    check_green: (
      <img
        src="/icon/check_green.svg"
        alt="check_green"
        width={size}
        height={size}
        className={className}
      />
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
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {iconMap[name]}
    </div>
  );
};

Icon.displayName = "Icon";

export default Icon;
