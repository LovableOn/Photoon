import {
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'

/* ------------------------------------------------------------------ Botões */

type ButtonVariant = 'primary' | 'dark' | 'white' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  block?: boolean
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-float hover:brightness-108 active:brightness-95',
  dark: 'bg-ink text-white hover:bg-ink/90',
  white: 'bg-surface text-ink border border-line hover:bg-subtle',
  ghost: 'bg-transparent text-ink-soft hover:bg-subtle hover:text-ink',
  danger: 'bg-danger-soft text-danger border border-danger/20 hover:bg-danger/10',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  block?: boolean,
  className = '',
) {
  return `inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${
    BUTTON_VARIANTS[variant]
  } ${BUTTON_SIZES[size]} ${block ? 'w-full' : ''} ${className}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  block,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, block, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

/**
 * Link com aparência de botão.
 *
 * Um `<button>` dentro de um `<a>` é HTML inválido, então navegações usam este
 * componente em vez de embrulhar `Button` num `Link`.
 */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  children,
  ...props
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize; block?: boolean }) {
  return (
    <Link className={buttonClasses(variant, size, block, className)} {...props}>
      {children}
    </Link>
  )
}

/** Link com aparência de botão de ícone circular. */
export function LinkIconButton({
  label,
  className = '',
  children,
  ...props
}: LinkProps & { label: string }) {
  return (
    <Link
      title={label}
      aria-label={label}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition hover:border-ink/20 hover:text-ink ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  size?: 'sm' | 'md'
  tone?: 'default' | 'danger'
}

export function IconButton({
  label,
  active,
  size = 'md',
  tone = 'default',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const dimension = size === 'sm' ? 'size-8' : 'size-10'
  const tones = active
    ? 'bg-ink text-white border-ink'
    : tone === 'danger'
      ? 'bg-surface text-danger border-line hover:bg-danger-soft'
      : 'bg-surface text-ink-soft border-line hover:text-ink hover:border-ink/20'

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex ${dimension} shrink-0 items-center justify-center rounded-full border transition ${tones} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z" />
    </svg>
  )
}

/* ------------------------------------------------------------ Superfícies */

export function Card({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[24px] border border-line/70 bg-surface shadow-float ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-5">
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-ink-faint">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------- Chips */

export function Chip({
  active,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-line bg-surface text-ink-soft hover:border-ink/20 hover:text-ink'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-subtle text-ink-soft',
  brand: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

export function Badge({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------- Avatares */

export function Avatar({
  name,
  src,
  size = 36,
  className = '',
}: {
  name: string
  /** Retrato do cliente. Sem ele, caímos nas iniciais. */
  src?: string | null
  size?: number
  className?: string
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`inline-block shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  )
}

/* -------------------------------------------------------------- Progresso */

export function ProgressBar({
  value,
  tone = 'brand',
  className = '',
}: {
  value: number
  tone?: 'brand' | 'success' | 'warning'
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const fills = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
  }

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-inset ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${fills[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------ Estado vazio */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-subtle text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-5xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[88vh] w-full ${widths[size]} flex-col overflow-hidden rounded-[24px] bg-surface shadow-lift`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
            )}
          </div>
          <IconButton label="Fechar" size="sm" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="none" className="size-4">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>

        {children && (
          <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        )}

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-subtle/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- Toast */

export function Toast({
  message,
  tone = 'success',
}: {
  message: string
  tone?: 'success' | 'danger'
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lift ${
          tone === 'success' ? 'bg-ink' : 'bg-danger'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
