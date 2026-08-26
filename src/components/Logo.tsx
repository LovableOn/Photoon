import { Link } from 'react-router-dom'

export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="url(#photoon-gradient)" />
      <circle cx="20" cy="20" r="8" fill="white" fillOpacity="0.95" />
      <circle cx="20" cy="20" r="3.5" fill="var(--color-primary)" />
      <defs>
        <linearGradient
          id="photoon-gradient"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * Marca. O texto usa Plus Jakarta Sans — a mesma família do produto —
 * em peso 800 com entreletra fechada, que é o que dá cara de logotipo e não
 * de título comum.
 */
export function Logo({
  to = '/',
  className,
}: {
  to?: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 ${className ?? ''}`}
    >
      <LogoMark />
      <span className="font-sans text-[21px] leading-none font-extrabold tracking-[-0.035em] text-ink">
        Photoon
      </span>
    </Link>
  )
}
