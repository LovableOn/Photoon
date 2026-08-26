import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField, PasswordField } from '../components/FormField'
import { Button } from '../components/Button'
import { useAuth } from '../lib/auth'

export function ResetPassword() {
  const { resetPassword } = useAuth()
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível redefinir a senha agora. Tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout
        title="Senha redefinida"
        subtitle="Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha."
      >
        <Link to="/login">
          <Button>Voltar para entrar</Button>
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Criar nova senha"
      subtitle="Escolha uma nova senha para acessar sua conta."
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
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
