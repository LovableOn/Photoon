import { useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { FormField, PasswordField } from '../components/FormField'
import { Button } from '../components/Button'
import { useAuth } from '../lib/auth'

const TABS = ['Dados pessoais', 'Segurança', 'Privacidade'] as const
type Tab = (typeof TABS)[number]

export function Account() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('Dados pessoais')

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-ink">Minha conta</h1>
      <p className="mt-1 text-ink-soft">Acesso vinculado à empresa Photoon.</p>

      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === item
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-md">
        {tab === 'Dados pessoais' && <PersonalDataForm name={user?.name ?? ''} email={user?.email ?? ''} />}
        {tab === 'Segurança' && <SecurityForm />}
        {tab === 'Privacidade' && <PrivacyTab />}
      </div>
    </AppShell>
  )
}

function PersonalDataForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [saved, setSaved] = useState(false)
  const changed = name !== initialName || email !== initialEmail

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[14px] border border-border bg-surface p-6">
      {saved && (
        <div className="rounded-xl border border-success/20 bg-success-bg px-4 py-2.5 text-sm text-success">
          Dados salvos com sucesso.
        </div>
      )}

      <FormField id="name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
      <FormField id="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <FormField
        id="phone"
        label="Telefone"
        value=""
        disabled
        placeholder="Não informado"
        hint="Para alterar este dado, fale com a empresa."
      />

      <Button type="submit" disabled={!changed}>
        Salvar alterações
      </Button>
    </form>
  )
}

function SecurityForm() {
  const { user, resetPassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength =
    newPassword.length >= 12 ? 'Forte' : newPassword.length >= 8 ? 'Média' : 'Fraca'
  const strengthColor =
    strength === 'Forte' ? 'bg-success' : strength === 'Média' ? 'bg-warning' : 'bg-danger'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess(false)

    if (!currentPassword) {
      setError('Informe sua senha atual.')
      return
    }
    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')
      await resetPassword(user.email, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[14px] border border-border bg-surface p-6">
      {error && (
        <div role="alert" className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-success/20 bg-success-bg px-4 py-2.5 text-sm text-success">
          Senha alterada com sucesso.
        </div>
      )}

      <PasswordField
        id="currentPassword"
        label="Senha atual"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <div>
        <PasswordField
          id="newPassword"
          label="Nova senha"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {newPassword && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full ${strengthColor}`}
                style={{
                  width: strength === 'Forte' ? '100%' : strength === 'Média' ? '60%' : '30%',
                }}
              />
            </div>
            <span className="text-xs text-ink-faint">{strength}</span>
          </div>
        )}
      </div>
      <PasswordField
        id="confirmNewPassword"
        label="Confirmar nova senha"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button type="submit" loading={loading}>
        Alterar senha
      </Button>
    </form>
  )
}

function PrivacyTab() {
  return (
    <div className="space-y-4 rounded-[14px] border border-border bg-surface p-6">
      <div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">
          Política de privacidade
        </a>
      </div>
      <div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">
          Termos aplicáveis
        </a>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm text-ink-soft">
          Você pode solicitar informações sobre seus dados ou a exclusão da
          sua conta a qualquer momento.
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          Projetos em produção ou registros obrigatórios podem seguir regras
          de retenção definidas pela empresa.
        </p>
        <Button variant="secondary" className="mt-4 w-auto px-4">
          Solicitar dados ou exclusão
        </Button>
      </div>
    </div>
  )
}
