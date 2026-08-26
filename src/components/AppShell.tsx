import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { useAuth } from '../lib/auth'

const NAV_ITEMS = [
  { to: '/app', label: 'Início', end: true },
  { to: '/app/conta', label: 'Minha conta', end: false },
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
    <div className="min-h-svh bg-cream-100">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-cream-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
                        ? 'bg-ink text-white'
                        : 'text-ink-soft hover:bg-black/5 hover:text-ink'
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
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-3 text-sm font-medium text-ink hover:border-black/20"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-coral-100 text-xs font-semibold text-coral-700">
                {user ? initials(user.name) : ''}
              </span>
              {user?.name.split(' ')[0]}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-soft"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <NavLink
                  to="/app/conta"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-black/5"
                >
                  Minha conta
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
