import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { useAuth } from '../lib/auth'

const NAV_ITEMS = [
  { to: '/app', label: 'Início', end: true },
  { to: '/app/conta', label: 'Minha conta', end: false },
  { to: '/app/ajuda', label: 'Ajuda', end: false },
]

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-bg">
      <header className="sticky top-0 z-10 h-[72px] border-b border-border bg-surface">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo to="/app" />
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-bg text-primary'
                        : 'text-ink-soft hover:bg-bg hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-sm font-medium text-ink hover:border-ink-faint"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                {user ? initials(user.name) : ''}
              </span>
              {user?.name.split(' ')[0]}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-[14px] border border-border bg-surface py-1 shadow-card"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <NavLink
                  to="/app/conta"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-bg"
                >
                  Minha conta
                </NavLink>
                <NavLink
                  to="/app/ajuda"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-bg"
                >
                  Ajuda
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger-bg"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
