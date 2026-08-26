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
        eyebrow="Verifique seu e-mail"
        title="Enviamos um link de recuperação"
        subtitle={`Se existir uma conta para ${email}, você receberá instruções para redefinir sua senha em instantes.`}
      >
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="border border-black/10"
            onClick={() => setSent(false)}
          >
            Usar outro e-mail
          </Button>
          <Link
            to={`/redefinir-senha?email=${encodeURIComponent(email)}`}
            className="block text-center text-sm font-semibold text-coral-600 hover:text-coral-700"
          >
            Já tenho um código, redefinir senha
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Recuperar acesso"
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
