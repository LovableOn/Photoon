import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  icon?: ReactNode
}

function fieldClass(error?: string, hasIcon?: boolean, hasAction?: boolean) {
  return `h-12 w-full rounded-2xl border bg-subtle text-sm text-ink transition placeholder:text-ink-faint focus:bg-surface focus:outline-none focus:ring-4 ${
    hasIcon ? 'pl-11' : 'pl-4'
  } ${hasAction ? 'pr-12' : 'pr-4'} ${
    error
      ? 'border-danger/40 focus:border-danger focus:ring-danger/10'
      : 'border-line focus:border-primary focus:ring-primary/10'
  }`
}

export function FormField({ label, error, hint, icon, id, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-faint">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={fieldClass(error, Boolean(icon))}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function PasswordField({ label, error, hint, icon, id, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-faint">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={fieldClass(error, Boolean(icon), true)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-faint transition hover:text-ink"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          title={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? (
            <svg viewBox="0 0 20 20" fill="none" className="size-5">
              <path d="M2.5 10.5S5 5 10 5s7.5 5.5 7.5 5.5-2.5 5.5-7.5 5.5S2.5 10.5 2.5 10.5Z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="10.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" className="size-5">
              <path
                d="M3 3l14 14M8.4 8.6a2.25 2.25 0 0 0 3 3M6.2 6.3C4 7.6 2.5 10 2.5 10s2.5 5.5 7.5 5.5c1.3 0 2.4-.35 3.35-.9M9.3 5.05c.23-.02.46-.05.7-.05 5 0 7.5 5.5 7.5 5.5s-.6 1.3-1.75 2.6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Checkbox({
  label,
  id,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-soft ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="size-4 rounded-md border-line text-primary focus:ring-2 focus:ring-primary/25"
        {...props}
      />
      {label}
    </label>
  )
}
