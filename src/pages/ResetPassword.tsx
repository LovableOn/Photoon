import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField, PasswordField } from '../components/FormField'
import { Button, LinkButton } from '../components/ui'
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
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Não foi possível redefinir a senha. Tente de novo.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout
        title="Senha redefinida"
        subtitle="Tudo certo. Você já pode entrar com a nova senha."
      >
        <LinkButton to="/login" size="lg" block>
          Ir para o login
        </LinkButton>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Criar nova senha"
      subtitle="Escolha uma nova senha para acessar sua conta."
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
          label="Nova senha"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <PasswordField
          id="confirmPassword"
          label="Confirmar nova senha"
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        <Button type="submit" size="lg" block loading={loading}>
          Redefinir senha
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
