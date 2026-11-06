import { forwardRef } from 'react'
import type { ChangeEvent } from 'react'

type InputProps = {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'number'
  className?: string
  labelClassName?: string
  inputClassName?: string
  maxLength?: number
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder = 'Help Text',
      value,
      onChange,
      error,
      disabled = false,
      type = 'text',
      className = '',
      labelClassName = '',
      inputClassName = '',
      maxLength,
    },
    ref,
  ) => {
    const inputStyles = error
      ? 'w-full h-12 px-4 py-3 border rounded-[4px] text-body3-regular border-status-negative-normal text-gray-normal placeholder:text-gray-assistive outline-none transition-colors'
      : disabled
        ? 'w-full h-12 px-4 py-3 border rounded-[4px] text-body3-regular border-line-normal bg-fill-alternative text-gray-assistive placeholder:text-gray-assistive outline-none transition-colors'
        : 'w-full h-12 px-4 py-3 border rounded-[4px] text-body3-regular border-line-normal text-gray-normal focus:border-status-informative-normal placeholder:text-gray-assistive outline-none transition-colors'

    return (
      <div className={`flex flex-col gap-xs w-full ${className}`}>
        {label && (
          <label
            className={`text-body3-regular text-gray-alternative ${labelClassName}`}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`${inputStyles} ${inputClassName}`}
        />

        {error && (
          <p className="text-tint-regular text-status-negative-normal mt-xs">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
