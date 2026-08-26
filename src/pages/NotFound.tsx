import { Logo } from '../components/Logo'
import { LinkButton } from '../components/ui'

export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <Logo />
      <div>
        <p className="numeric text-[64px] leading-none font-bold text-brand">404</p>
        <h1 className="mt-3 text-xl font-bold text-ink">Página não encontrada</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          O endereço que você abriu não existe ou foi movido.
        </p>
      </div>
      <LinkButton to="/app">Voltar para o início</LinkButton>
    </div>
  )
}
