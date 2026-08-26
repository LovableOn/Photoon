import { Link } from 'react-router-dom'
import { Logo, LogoMark } from '../components/Logo'

const FEATURES = [
  {
    title: 'Modelos prontos',
    description:
      'Escolha entre dezenas de modelos para casamento, viagem, bebê e muito mais.',
  },
  {
    title: 'Edição simples',
    description:
      'Arraste suas fotos, ajuste o layout e pronto — sem curva de aprendizado.',
  },
  {
    title: 'Impressão de qualidade',
    description:
      'Receba seu álbum impresso em casa com papel e acabamento premium.',
  },
]

export function Landing() {
  return (
    <div className="min-h-svh bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink hover:bg-black/5"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="rounded-xl bg-coral-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-coral-700"
          >
            Criar conta grátis
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-coral-50 px-3 py-1 text-sm font-medium text-coral-700">
              <LogoMark className="size-4" />
              Novo na Photoon
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
              Transforme suas fotos em álbuns inesquecíveis
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-soft">
              Crie, personalize e compartilhe álbuns de fotos lindos em
              minutos. Sem experiência em design, sem complicação.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/cadastro"
                className="rounded-xl bg-coral-600 px-6 py-3 font-semibold text-white shadow-soft hover:bg-coral-700"
              >
                Começar agora
              </Link>
              <Link
                to="/login"
                className="rounded-xl px-6 py-3 font-semibold text-ink hover:bg-black/5"
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/3 rounded-3xl bg-gradient-to-br from-plum-500 via-coral-500 to-coral-400 p-2 shadow-soft">
              <div className="grid h-full grid-cols-3 grid-rows-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/25 backdrop-blur-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/5 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center font-display text-3xl font-medium text-ink">
              Tudo que você precisa para o álbum perfeito
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-coral-50 text-coral-600 font-semibold">
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

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-soft">
        © {new Date().getFullYear()} Photoon. Todos os direitos reservados.
      </footer>
    </div>
  )
}
