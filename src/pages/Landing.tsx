import { Link } from 'react-router-dom'
import { Logo, LogoMark } from '../components/Logo'

const FEATURES = [
  {
    title: 'Assistência inteligente',
    description:
      'Selecione as fotos e receba um álbum completo, diagramado automaticamente, em poucos cliques.',
  },
  {
    title: 'Layouts inteligentes',
    description:
      'Prefere montar você mesmo? Use layouts, textos, fundos e elementos modernos com total controle.',
  },
  {
    title: 'Revisão guiada',
    description:
      'Antes de finalizar, a revisão aponta o que falta: fotos com baixa qualidade, páginas vazias e rostos cortados.',
  },
]

export function Landing() {
  return (
    <div className="min-h-svh bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-card"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-primary">
              <LogoMark className="size-4" />
              Área do cliente Photoon
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Monte álbuns de fotos com facilidade
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-soft">
              Selecione as fotos liberadas para você, crie com assistência de
              IA ou monte manualmente com layouts inteligentes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/cadastro"
                className="rounded-xl bg-gradient-brand px-6 py-3 font-semibold text-white shadow-card"
              >
                Criar conta
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-border bg-surface px-6 py-3 font-semibold text-ink"
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[14px] bg-gradient-brand p-2 shadow-card">
              <div className="grid aspect-4/3 grid-cols-3 grid-rows-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-white/20" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-3xl font-bold text-ink">
              Feito para quem nunca diagramou um álbum
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[14px] border border-border p-5"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-white">
                    {feature.title.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-faint">
        © {new Date().getFullYear()} Photoon. Todos os direitos reservados.
      </footer>
    </div>
  )
}
