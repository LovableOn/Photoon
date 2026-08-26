import type { ReactNode } from 'react'
import { Logo } from './Logo'

export function AuthLayout({
  children,
  title,
  subtitle,
  supportCard = true,
}: {
  children: ReactNode
  title: string
  subtitle: string
  supportCard?: boolean
}) {
  return (
    <div className="flex min-h-svh flex-col items-center bg-bg px-6 py-10">
      <Logo />

      <div className="flex w-full flex-1 flex-col items-center justify-center py-8">
        <div className="w-full max-w-[440px]">
          <div className="rounded-[14px] border border-border bg-surface p-8 shadow-card">
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>

          {supportCard && (
            <div className="mt-4 rounded-[14px] border border-border bg-surface px-5 py-3.5 text-center text-sm text-ink-soft shadow-card">
              Problemas para acessar?{' '}
              <a href="#" className="font-semibold text-primary hover:underline">
                Fale com a empresa
              </a>
            </div>
          )}
        </div>
      </div>

      <footer className="flex flex-col items-center gap-1 pt-4 text-center text-xs text-ink-faint">
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-ink-soft">
            Política de privacidade
          </a>
          <a href="#" className="hover:text-ink-soft">
            Contato
          </a>
        </div>
        <p>Tecnologia Photoon</p>
      </footer>
    </div>
  )
}
