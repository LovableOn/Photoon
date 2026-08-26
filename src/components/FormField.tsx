import { useState, type InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-ink placeholder:text-ink-soft/50 transition focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-black/10 focus:border-coral-400 focus:ring-coral-100'
        }`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function PasswordField({
  label,
  error,
  id,
  ...props
}: FormFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-ink placeholder:text-ink-soft/50 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-black/10 focus:border-coral-400 focus:ring-coral-100'
          }`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-soft hover:text-ink"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? (
            <svg viewBox="0 0 20 20" fill="none" className="size-5">
              <path
                d="M2.5 10.5S5 5 10 5s7.5 5.5 7.5 5.5-2.5 5.5-7.5 5.5S2.5 10.5 2.5 10.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
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
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
