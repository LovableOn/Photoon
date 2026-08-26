import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField, PasswordField } from '../components/FormField'
import { Button } from '../components/ui'
import { useAuth } from '../lib/auth'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password ? 1 : 0

  function validate() {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Informe um e-mail válido.'
    if (password.length < 8) next.password = 'Use pelo menos 8 caracteres.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    try {
      await register(name.trim(), email, password)
      navigate('/app', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar sua conta agora. Tente de novo em instantes.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Leva menos de um minuto para começar a montar seus álbuns."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-[13px] text-danger"
          >
            {formError}
          </div>
        )}

        <FormField
          id="name"
          label="Nome completo"
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />

        <FormField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />

        <div>
          <PasswordField
            id="password"
            label="Senha"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          {password && !errors.password && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={`h-1 flex-1 rounded-full transition ${
                      level <= strength
                        ? strength === 3
                          ? 'bg-success'
                          : strength === 2
                            ? 'bg-warning'
                            : 'bg-danger'
                        : 'bg-inset'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-ink-faint">
                {strength === 3 ? 'Forte' : strength === 2 ? 'Média' : 'Fraca'}
              </span>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" block loading={loading}>
          Criar conta
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-ink-faint">
          Ao continuar, você concorda com os Termos de Uso e a Política de
          Privacidade da Photoon.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
