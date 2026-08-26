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
      <circle cx="20" cy="20" r="8" fill="var(--color-cream)" />
      <circle cx="20" cy="20" r="3.5" fill="var(--color-coral-600)" />
      <defs>
        <linearGradient
          id="photoon-gradient"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-coral-500)" />
          <stop offset="1" stopColor="var(--color-plum-500)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

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
      <span className="font-display text-xl font-medium tracking-tight text-ink">
        Photoon
      </span>
    </Link>
  )
}
