import type { ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
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
    'inline-flex items-center justify-center font-normal transition-colors outline-none';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-gray-500 rounded-[200px]',
    secondary:
      'bg-secondary text-primary hover:bg-secondary/80 disabled:bg-gray-200 rounded-[200px]',
    outline:
      'bg-white border border-gray-300 text-gray-900 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400 rounded-[12px]',
  };

  const sizeStyles = {
    small: 'px-xs py-[10px] text-tint-regular',
    medium: 'px-l py-s text-body3-regular',
    large: 'px-xxl py-m text-body3-regular',
  };

  const cursorStyles = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${cursorStyles} ${className}`}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;
