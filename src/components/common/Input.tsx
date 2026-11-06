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
      ? 'text-1rg-regular w-full h-12 px-4 py-3 border rounded-xs border-status-negative-normal text-gray-normal placeholder:text-gray-assistive outline-none transition-colors'
      : disabled
        ? 'text-1rg-regular w-full h-12 px-4 py-3 border rounded-xs border-line-normal bg-fill-alternative text-gray-assistive placeholder:text-gray-assistive outline-none transition-colors'
        : 'text-1rg-regular w-full h-12 px-4 py-3 border rounded-xs border-line-normal text-gray-normal focus:border-status-informative-normal placeholder:text-gray-assistive outline-none transition-colors'

    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <label
            className={`text-1rg-regular text-gray-alternative ${labelClassName}`}
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
          <p className="text-2sm-regular text-status-negative-normal mt-1">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
