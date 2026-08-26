import type { ReactNode } from 'react'
import { Logo } from './Logo'

const STATS = [
  { value: '12k+', label: 'álbuns criados' },
  { value: '4.9', label: 'avaliação média' },
  { value: '2 min', label: 'para começar' },
]

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode
  title: string
  subtitle: string
  footer?: ReactNode
}) {
  return (
    <div className="min-h-svh bg-surface lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* ------------------------------------------------------ formulário */}
      <div className="flex min-h-svh flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:px-14">
        <Logo />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} Photoon</span>
          {footer ?? (
            <div className="flex items-center gap-4">
              <a href="#" className="transition hover:text-ink-soft">
                Privacidade
              </a>
              <a href="#" className="transition hover:text-ink-soft">
                Suporte
              </a>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------- painel visual */}
      <div className="relative hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[32px] bg-brand">
          {/* textura pontilhada discreta */}
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:26px_26px]" />
          <div className="absolute -top-32 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
            <AlbumPreview />

            <div>
              <h2 className="max-w-md text-[32px] leading-[1.2] font-bold tracking-tight text-white">
                Suas fotos, organizadas em álbuns que valem a pena guardar.
              </h2>
              <p className="mt-3 max-w-sm text-[15px] text-white/75">
                Cadastre sua biblioteca, escolha os elementos e deixe a Photoon
                montar as páginas para você.
              </p>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/20 pt-6">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="numeric text-2xl font-bold text-white">
                      {stat.value}
                    </dt>
                    <dd className="mt-0.5 text-xs text-white/70">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Composição decorativa que sugere uma lâmina de álbum sendo montada. */
function AlbumPreview() {
  return (
    <div className="relative mx-auto mt-6 w-full max-w-sm">
      <div className="rotate-[-4deg] rounded-3xl bg-white/12 p-3 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 aspect-4/3 rounded-2xl bg-white/25" />
          <div className="aspect-square rounded-2xl bg-white/18" />
          <div className="aspect-square rounded-2xl bg-white/18" />
          <div className="col-span-2 aspect-4/3 rounded-2xl bg-white/25" />
        </div>
      </div>

      <div className="absolute -right-4 -bottom-6 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-lift">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
            <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Álbum pronto</p>
          <p className="text-[11px] text-ink-faint">20 lâminas geradas</p>
        </div>
      </div>
    </div>
  )
}
