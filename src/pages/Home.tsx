import { AppShell } from '../components/AppShell'
import { useAuth } from '../lib/auth'

export function Home() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0]

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-medium text-ink">
        Olá, {firstName} 👋
      </h1>
      <p className="mt-2 text-ink-soft">
        Bem-vindo à Photoon. Sua área de álbuns está sendo preparada.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white/60 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
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
        <h2 className="mt-4 font-display text-xl font-medium text-ink">
          Seus álbuns aparecerão aqui em breve
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Estamos finalizando a criação e edição de álbuns. Por enquanto,
          aproveite para completar os dados da sua conta.
        </p>
      </div>
    </AppShell>
  )
}
