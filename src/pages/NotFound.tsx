import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <Logo />
      <h1 className="font-display text-3xl font-medium text-ink">
        Página não encontrada
      </h1>
      <p className="text-ink-soft">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="rounded-xl bg-coral-600 px-5 py-2.5 font-semibold text-white shadow-soft hover:bg-coral-700"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
