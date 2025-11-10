import { forwardRef } from 'react';
import type { ChangeEvent } from 'react';

type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
};

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
    },
    ref
  ) => {
    const inputStyles = error
      ? 'w-full h-12 px-4 py-3 border rounded-[4px] text-body3-regular border-red-500 text-gray-900 placeholder:text-gray-500 outline-none transition-colors'
      : disabled
        ? 'w-full h-12 px-4 py-3 border rounded-[4px] text-body3-regular border-gray-300 bg-gray-100 text-gray-500 placeholder:text-gray-500 outline-none transition-colors'
        : 'w-full h-12 px-4 py-3 border rounded-[4px] text-body3-regular border-gray-300 text-gray-900 focus:border-blue-500 placeholder:text-gray-500 outline-none transition-colors';

    return (
      <div className={`flex flex-col gap-xs w-full ${className}`}>
        {label && (
          <label className="text-body3-regular text-gray-600">{label}</label>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputStyles}
        />

        {error && (
          <p className="text-tint-regular text-red-500 mt-xs">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
