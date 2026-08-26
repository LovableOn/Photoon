import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField, PasswordField } from '../components/FormField'
import { Button } from '../components/Button'
import { useAuth } from '../lib/auth'

export function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email, password)
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível redefinir a senha.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout
        eyebrow="Tudo pronto"
        title="Senha redefinida!"
        subtitle="Você já pode entrar com sua nova senha. Redirecionando para o login..."
      >
        <Link
          to="/login"
          className="block text-center text-sm font-semibold text-coral-600 hover:text-coral-700"
        >
          Ir para o login agora
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Criar nova senha"
      title="Redefinir senha"
      subtitle="Escolha uma nova senha para acessar sua conta Photoon."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
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
          label="Nova senha"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <PasswordField
          id="confirmPassword"
          label="Confirmar nova senha"
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" loading={loading}>
          Redefinir senha
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link
          to="/login"
          className="font-semibold text-coral-600 hover:text-coral-700"
        >
          Voltar para o login
        </Link>
      </p>
    </AuthLayout>
  )
}
