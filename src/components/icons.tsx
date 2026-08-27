interface IconProps {
  className?: string
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const Icon = {
  Home: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" />
    </svg>
  ),
  Albums: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="13" height="15" rx="2.5" />
      <path d="M18.5 7.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5" />
    </svg>
  ),
  Photos: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 16 4.5-4 3 2.5L15 11l5 4.5" />
    </svg>
  ),
  Elements: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <circle cx="7.5" cy="7.5" r="3.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <path d="M7.5 13 11 20H4Z" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="3.25" />
    </svg>
  ),
  Help: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.4a2.4 2.4 0 0 1 4.6.9c0 1.6-2.3 2-2.3 3.4" />
      <path d="M12 17h.01" strokeWidth="2" />
    </svg>
  ),
  User: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5a7 7 0 0 1 14 0" />
    </svg>
  ),
  Search: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  ),
  Plus: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Upload: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M12 16V4m0 0L8 8m4-4 4 4" />
      <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </svg>
  ),
  Heart: ({ className = 'size-5', filled }: IconProps & { filled?: boolean }) => (
    <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 19.5S4.5 14.8 4.5 9.8A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7.5 1.8c0 5-7.5 9.7-7.5 9.7Z" />
    </svg>
  ),
  Trash: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7l.8 12A1.5 1.5 0 0 0 8.8 20h6.4a1.5 1.5 0 0 0 1.5-1l.8-12" />
    </svg>
  ),
  Check: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className} strokeWidth={2.2}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  ),
  Close: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  ArrowLeft: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </svg>
  ),
  ArrowUpRight: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M7 17 17 7m0 0H8m9 0v9" />
    </svg>
  ),
  Sliders: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M9 5v6m0 4v4M15 5v4m0 4v6" />
      <circle cx="9" cy="13" r="2" />
      <circle cx="15" cy="11" r="2" />
    </svg>
  ),
  Sparkle: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M12 4c1.2 5.4 2.6 6.8 8 8-5.4 1.2-6.8 2.6-8 8-1.2-5.4-2.6-6.8-8-8 5.4-1.2 6.8-2.6 8-8Z" />
    </svg>
  ),
  Logout: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M14 8V6a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 14 18v-2" />
      <path d="M10 12h10m0 0-3-3m3 3-3 3" />
    </svg>
  ),
  Pencil: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  ),
  Share: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <circle cx="17.5" cy="6" r="2.6" />
      <circle cx="6.5" cy="12" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="m8.9 10.8 6.4-3.5M8.9 13.2l6.4 3.5" />
    </svg>
  ),
  Grid: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  ),
  Bell: ({ className = 'size-5' }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  ),
}
