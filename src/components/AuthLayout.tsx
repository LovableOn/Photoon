import type { ReactNode } from 'react'
import { Logo } from './Logo'

const HIGHLIGHTS = [
  'Monte álbuns de fotos em minutos',
  'Modelos prontos para cada ocasião',
  'Compartilhe e peça impressão sem complicação',
]

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16 lg:py-14">
        <Logo />

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-coral-600">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium text-ink">
              {title}
            </h1>
            <p className="mt-2 text-ink-soft">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-plum-600 via-ink to-coral-700" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] [background-size:28px_28px]" />

        <div className="relative flex h-full flex-col justify-between p-14 text-cream">
          <div />
          <div>
            <p className="font-display text-3xl leading-snug font-medium">
              Suas memórias merecem
              <br />
              um álbum tão bonito quanto elas.
            </p>
            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-cream/90">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream/15">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="size-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 10.5 8 14l8-8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-cream/60">
            © {new Date().getFullYear()} Photoon. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
