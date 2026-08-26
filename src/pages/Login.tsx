import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField, PasswordField } from '../components/FormField'
import { Checkbox } from '../components/Checkbox'
import { Button } from '../components/Button'
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
      setError('E-mail ou senha incorretos. Confira os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Acesse seus projetos"
      subtitle="Entre com os dados fornecidos pela sua empresa."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-2.5 text-sm text-danger"
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
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordField
          id="password"
          label="Senha"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox
            id="keepConnected"
            label="Manter conectado neste dispositivo"
            checked={keepConnected}
            onChange={(e) => setKeepConnected(e.target.checked)}
          />
          <Link
            to="/esqueci-senha"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Ainda não tem uma conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}
