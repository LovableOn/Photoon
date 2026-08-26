import { AppShell } from '../components/AppShell'
import { useAuth } from '../lib/auth'

export function Home() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0]

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-ink">Olá, {firstName}</h1>
      <p className="mt-1 text-ink-soft">
        Estes são os projetos liberados para você pela Photoon.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border bg-surface px-6 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-bg text-primary">
          <svg viewBox="0 0 24 24" fill="none" className="size-7">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="9" cy="10.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M4 17l5-4.5 3 2.5 3.5-3.5L20 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink">
          Nenhum projeto foi liberado ainda
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Quando a empresa disponibilizar suas fotos e álbuns, eles aparecerão
          aqui.
        </p>
        <a
          href="#"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink hover:bg-bg"
        >
          Falar com a empresa
        </a>
      </div>
    </AppShell>
  )
}
