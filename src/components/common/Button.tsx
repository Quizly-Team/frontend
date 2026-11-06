import type { ReactNode } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

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
    'inline-flex items-center justify-center font-normal transition-colors outline-none'

  const variantStyles = {
    primary:
      'bg-primary-normal text-static-white hover:bg-primary-normal/90 disabled:bg-gray-assistive rounded-[200px]',
    secondary:
      'bg-primary-subtle text-primary-normal hover:bg-primary-subtle/80 disabled:bg-fill-alternative rounded-[200px]',
    outline:
      'bg-background-elevated border border-line-normal text-gray-normal hover:border-gray-disable disabled:border-line-normal disabled:text-gray-disable rounded-[12px]',
  }

  const sizeStyles = {
    small: 'text-2sm-regular px-xs py-[10px]',
    medium: 'text-1rg-regular px-l py-s',
    large: 'text-1rg-regular px-xxl py-m',
  }

  const cursorStyles = disabled ? 'cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${cursorStyles} ${className}`}
    >
      {children}
    </button>
  )
}

Button.displayName = 'Button'

export default Button
