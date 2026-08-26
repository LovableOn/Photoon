import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField, PasswordField } from '../components/FormField'
import { Button } from '../components/Button'
import { useAuth } from '../lib/auth'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!name.trim()) errors.name = 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Informe um e-mail válido.'
    if (password.length < 8)
      errors.password = 'A senha deve ter pelo menos 8 caracteres.'
    if (confirmPassword !== password)
      errors.confirmPassword = 'As senhas não coincidem.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    try {
      await register(name.trim(), email, password)
      navigate('/app', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Não foi possível criar sua conta.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Comece agora"
      title="Crie sua conta"
      subtitle="Leva menos de um minuto para começar a montar seus álbuns."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField
          id="name"
          label="Nome completo"
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />

        <FormField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <PasswordField
          id="password"
          label="Senha"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirmar senha"
          autoComplete="new-password"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        <Button type="submit" loading={loading}>
          Criar conta
        </Button>

        <p className="text-center text-xs text-ink-soft">
          Ao continuar, você concorda com os Termos de Uso e a Política de
          Privacidade da Photoon.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="font-semibold text-coral-600 hover:text-coral-700"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
