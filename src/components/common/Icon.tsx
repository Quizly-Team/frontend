type IconProps = {
  name:
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
  size?: number;
  className?: string;
  onClick?: () => void;
};

const Icon = ({ name, size = 28, className = '', onClick }: IconProps) => {
  const iconMap: Record<string, JSX.Element> = {
    search: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="14"
          cy="14"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M20.5 20.5L27 27"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
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
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 20V24H8L20 12L16 8L4 20Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 8L20 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    book: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="2"
          width="20"
          height="22"
          rx="2"
          fill="#2eb05b"
          stroke="#2eb05b"
          strokeWidth="2"
        />
        <rect x="10" y="8" width="8" height="8" fill="white" rx="1" />
      </svg>
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
        <circle cx="14" cy="14" r="13" fill="#30a10e" />
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
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 10V26C8 27.1046 8.89543 28 10 28H22C23.1046 28 24 27.1046 24 26V10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 10H28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 4H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 16V22M20 16V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    upload: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 22V7M16 7L10 13M16 7L22 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 26H26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
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
          fill="#dcb89d"
          stroke="#dcb89d"
        />
        <path
          d="M8 9H18M8 13H18M8 17H18M8 21H18"
          stroke="#4a4848"
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
          fill="#f4b940"
          stroke="#f4b940"
        />
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="2"
          fill="#ffe9bd"
          stroke="#ffe9bd"
        />
        <circle cx="10" cy="12" r="2" fill="#ff243e" />
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
        <circle cx="20" cy="20" r="19" fill="#30a10e" opacity="0.1" />
        <circle cx="20" cy="20" r="19" stroke="#30a10e" strokeWidth="2" />
        <path
          d="M12 20L18 26L28 14"
          stroke="#30a10e"
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
        <circle cx="20" cy="20" r="19" fill="#ff243e" opacity="0.1" />
        <circle cx="20" cy="20" r="19" stroke="#ff243e" strokeWidth="2" />
        <path
          d="M26 14L14 26M14 14L26 26"
          stroke="#ff243e"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`inline-flex items-center justify-center ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {iconMap[name]}
    </div>
  );
};

export default Icon;
