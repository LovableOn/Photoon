import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './icons'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'

/**
 * Menu lateral.
 *
 * Fica recolhido, mostrando só os ícones, e abre ao passar o mouse — assim o
 * canvas e as grades ganham a largura de volta sem esconder a navegação.
 * O rótulo só aparece expandido; recolhido, quem explica cada item é o
 * `title` e o `aria-label`, que também servem ao leitor de tela.
 */

interface RailItem {
  to: string
  label: string
  icon: ReactNode
  badge?: number
  end?: boolean
  tone?: 'padrao' | 'destaque'
}

export function SideRail() {
  const { logout } = useAuth()
  const { photos, projects } = useStore()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)

  const prontos = projects.filter(
    (project) => project.status === 'pronto' || project.status === 'finalizado',
  ).length

  const emEdicao = projects.find((project) => project.status !== 'finalizado')

  const principais: RailItem[] = [
    { to: '/app', label: 'Início', icon: <Icon.Home className="size-5" />, end: true },
    { to: '/app/albuns', label: 'Meus álbuns', icon: <Icon.Albums className="size-5" /> },
    {
      to: '/app/fotos',
      label: 'Fotos liberadas',
      icon: <Icon.Photos className="size-5" />,
      badge: photos.length,
    },
    {
      to: emEdicao ? `/app/albuns/${emEdicao.id}/editor` : '/app/albuns/novo',
      label: emEdicao ? 'Continuar editando' : 'Montar álbum',
      icon: <Icon.Pencil className="size-5" />,
    },
    {
      to: '/app/albuns/novo',
      label: 'Criar com IA',
      icon: <Icon.Sparkle className="size-5" />,
      tone: 'destaque',
    },
    {
      to: '/app/albuns?status=pronto',
      label: 'Prontos para finalizar',
      icon: <Icon.CheckCircle className="size-5" />,
      badge: prontos || undefined,
    },
  ]

  const secundarios: RailItem[] = [
    { to: '/app/ajuda', label: 'Ajuda', icon: <Icon.Help className="size-5" /> },
    { to: '/app/conta', label: 'Minha conta', icon: <Icon.User className="size-5" /> },
  ]

  return (
    <aside
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      className="fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 lg:block"
    >
      <nav
        aria-label="Menu principal"
        onFocus={() => setAberto(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setAberto(false)
        }}
        className={`flex flex-col gap-1 rounded-[26px] border border-line/70 bg-surface p-2.5 shadow-float transition-[width] duration-300 ease-out motion-reduce:transition-none ${
          aberto ? 'w-[232px]' : 'w-[68px]'
        }`}
      >
        {principais.map((item) => (
          <RailLink key={item.label} item={item} aberto={aberto} />
        ))}

        <span className="mx-2 my-1.5 h-px bg-line" role="presentation" />

        {secundarios.map((item) => (
          <RailLink key={item.label} item={item} aberto={aberto} />
        ))}

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          title="Sair"
          aria-label="Sair"
          className="mt-1 flex h-12 items-center gap-3 rounded-2xl px-2 text-danger transition hover:bg-danger-soft"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl">
            <Icon.Logout className="size-5" />
          </span>
          <span
            className={`truncate text-[13px] font-semibold whitespace-nowrap transition-opacity duration-200 ${
              aberto ? 'opacity-100 delay-75' : 'pointer-events-none opacity-0'
            }`}
          >
            Sair
          </span>
        </button>
      </nav>
    </aside>
  )
}

function RailLink({ item, aberto }: { item: RailItem; aberto: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={item.label}
      aria-label={item.label}
      className={({ isActive }) =>
        `relative flex h-12 items-center gap-3 rounded-2xl px-2 transition ${
          isActive
            ? 'text-ink'
            : item.tone === 'destaque'
              ? 'text-primary hover:bg-primary-soft/60'
              : 'text-ink-faint hover:bg-subtle hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`relative flex size-8 shrink-0 items-center justify-center rounded-xl transition ${
              isActive
                ? 'bg-brand text-white shadow-float'
                : item.tone === 'destaque'
                  ? 'bg-gradient-to-br from-primary/15 to-secondary/15 text-primary'
                  : 'bg-transparent'
            }`}
          >
            {item.icon}
            {/* Recolhido, o número flutua sobre o ícone; expandido, vira etiqueta. */}
            {item.badge !== undefined && !aberto && (
              <span className="absolute -top-1.5 -right-2 min-w-[19px] rounded-full bg-primary px-1 text-center text-[9px] leading-[15px] font-bold text-white">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </span>

          <span
            className={`flex min-w-0 flex-1 items-center justify-between gap-2 transition-opacity duration-200 ${
              aberto ? 'opacity-100 delay-75' : 'pointer-events-none opacity-0'
            }`}
          >
            <span className="truncate text-[13px] font-semibold whitespace-nowrap">
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                {item.badge}
              </span>
            )}
          </span>
        </>
      )}
    </NavLink>
  )
}
