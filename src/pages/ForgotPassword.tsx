import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { Button, LinkButton } from '../components/ui'
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
        subtitle={`Se existir uma conta para ${email}, o link de recuperação chega em instantes.`}
      >
        <div className="space-y-3">
          <LinkButton
            to={`/redefinir-senha?email=${encodeURIComponent(email)}`}
            size="lg"
            block
          >
            Já tenho o código
          </LinkButton>
          <Button variant="white" size="lg" block onClick={() => setSent(false)}>
            Usar outro e-mail
          </Button>
          <Link
            to="/login"
            className="block pt-2 text-center text-sm text-ink-soft transition hover:text-ink"
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
      subtitle="Informe seu e-mail e enviaremos um link para criar uma nova."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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

        <Button type="submit" size="lg" block loading={loading}>
          Enviar link de recuperação
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Lembrou a senha?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
