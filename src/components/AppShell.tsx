import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogoMark } from './Logo'
import { SideRail } from './SideRail'
import { Avatar, IconButton, LinkIconButton } from './ui'
import { Icon } from './icons'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'

/**
 * Menu do cliente.
 *
 * Cadastrar e editar elementos é trabalho do lojista, não de quem monta o
 * álbum — por isso não há aba de Elementos aqui. O cliente usa os elementos
 * dentro do editor, no painel próprio.
 */
const NAV = [
  { to: '/app', label: 'Início', end: true },
  { to: '/app/albuns', label: 'Álbuns', end: false },
  { to: '/app/fotos', label: 'Fotos', end: false },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { photos } = useStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-5">
            <Link
              to="/app"
              className="flex shrink-0 items-center gap-2.5"
              aria-label="Photoon"
            >
              <LogoMark className="size-9" />
              <span className="hidden font-sans text-[21px] leading-none font-extrabold tracking-[-0.035em] text-ink lg:block">
                Photoon
              </span>
            </Link>

            <nav className="scrollbar-thin flex items-center gap-1 overflow-x-auto rounded-full bg-subtle p-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                      isActive
                        ? 'bg-ink text-white'
                        : 'text-ink-soft hover:bg-white hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-subtle py-1.5 pr-4 pl-2 xl:inline-flex">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                {photos.length}
              </span>
              <span className="text-[13px] font-medium text-ink-soft">
                {photos.length === 1 ? 'foto' : 'fotos'}
              </span>
            </span>

            <IconButton label="Notificações">
              <Icon.Bell className="size-[18px]" />
            </IconButton>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 transition hover:border-ink/20"
              >
                <Avatar name={user?.name ?? ''} src={user?.avatar} size={30} />
                <span className="hidden text-[13px] font-semibold text-ink sm:block">
                  {user?.name.split(' ')[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-lift">
                  <div className="border-b border-line px-4 pt-2 pb-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-ink-faint">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/app/conta"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition hover:bg-subtle"
                  >
                    <Icon.User className="size-4 text-ink-faint" />
                    Minha conta
                  </NavLink>
                  <NavLink
                    to="/app/ajuda"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition hover:bg-subtle"
                  >
                    <Icon.Help className="size-4 text-ink-faint" />
                    Ajuda
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm text-danger transition hover:bg-danger-soft"
                  >
                    <Icon.Logout className="size-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SideRail />

      <main className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:pl-28">
        {children}
      </main>

      <StoreFooter store={user?.store ?? null} />
    </div>
  )
}

/**
 * Rodapé da loja.
 *
 * O cliente está dentro do ambiente do lojista, então quem assina o rodapé é
 * a loja — o contato dela é o que resolve a dúvida dele. A Photoon aparece
 * discreta, como a tecnologia por trás.
 */
function StoreFooter({ store }: { store: string | null }) {
  const nome = store ?? 'Sua loja'

  return (
    <footer className="mt-4 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:pl-28">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-[13px] font-semibold text-ink">{nome}</span>
          <a
            href="mailto:contato@exemplo.com.br"
            className="text-[13px] text-ink-soft transition hover:text-primary"
          >
            contato@exemplo.com.br
          </a>
          <a
            href="tel:+5511988442210"
            className="text-[13px] text-ink-soft transition hover:text-primary"
          >
            (11) 98844-2210
          </a>
          <a href="#" className="text-[13px] text-ink-soft transition hover:text-primary">
            Política de privacidade
          </a>
        </div>

        <p className="text-[12px] text-ink-faint">Tecnologia Photoon</p>
      </div>
    </footer>
  )
}

/** Cabeçalho de página: breadcrumb, título grande e ações à direita. */
export function PageHeader({
  breadcrumb,
  title,
  actions,
  back,
}: {
  breadcrumb?: string[]
  title: string
  actions?: ReactNode
  back?: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-2 pb-8">
      <div className="flex min-w-0 items-start gap-3">
        {back && (
          <LinkIconButton to={back} label="Voltar" className="mt-1.5 shadow-float">
            <Icon.ArrowLeft className="size-[18px]" />
          </LinkIconButton>
        )}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="mb-1.5 flex items-center gap-1.5 text-[12px] text-ink-faint">
              {breadcrumb.map((crumb, index) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb}
                </span>
              ))}
            </nav>
          )}
          <h1 className="truncate text-[32px] leading-tight font-bold tracking-tight text-ink sm:text-[38px]">
            {title}
          </h1>
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
