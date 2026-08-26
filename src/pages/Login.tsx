import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Checkbox, FormField, PasswordField } from '../components/FormField'
import { Button } from '../components/ui'
import { useAuth } from '../lib/auth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepConnected, setKeepConnected] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/app'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setError('E-mail ou senha incorretos. Confira os dados e tente de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Entre na sua conta"
      subtitle="Acesse sua biblioteca e continue de onde parou."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-[13px] text-danger"
          >
            {error}
          </div>
        )}

        <FormField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <PasswordField
          id="password"
          label="Senha"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox
            id="keepConnected"
            label="Manter conectado"
            checked={keepConnected}
            onChange={(event) => setKeepConnected(event.target.checked)}
          />
          <Link
            to="/esqueci-senha"
            className="text-[13px] font-semibold text-primary transition hover:text-primary/80"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </AuthLayout>
  )
}
