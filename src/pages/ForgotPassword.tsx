import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { Button } from '../components/Button'
import { useAuth } from '../lib/auth'

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        subtitle="Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha em instantes."
      >
        <div className="space-y-3">
          <Button variant="secondary" onClick={() => setSent(false)}>
            Usar outro e-mail
          </Button>
          <Link
            to={`/redefinir-senha?email=${encodeURIComponent(email)}`}
            className="block text-center text-sm font-semibold text-primary hover:underline"
          >
            Já tenho um código, redefinir senha
          </Link>
          <Link
            to="/login"
            className="block text-center text-sm text-ink-soft hover:text-ink"
          >
            Voltar para entrar
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Informe seu e-mail e enviaremos um link para você criar uma nova senha."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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

        <Button type="submit" loading={loading}>
          Enviar link de recuperação
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Lembrou sua senha?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
