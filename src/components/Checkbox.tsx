import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="size-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/25"
        {...props}
      />
      {label}
    </label>
  )
}
