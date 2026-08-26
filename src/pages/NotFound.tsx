import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <Logo />
      <h1 className="text-2xl font-bold text-ink">Página não encontrada</h1>
      <p className="text-ink-soft">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="rounded-xl bg-gradient-brand px-5 py-2.5 font-semibold text-white shadow-card"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
