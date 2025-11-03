type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const Button = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-[6px] font-normal transition-colors outline-none';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-gray-300',
    secondary:
      'bg-secondary text-primary hover:bg-secondary/80 disabled:bg-gray-200',
    outline:
      'bg-white border border-gray-300 text-gray-900 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400',
  };

  const sizeStyles = {
    small: 'px-xs py-[10px] text-tint-regular h-[38px]',
    medium: 'px-4 py-3 text-body3-regular h-[44px]',
    large: 'px-l py-[14px] text-body3-regular h-[48px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
