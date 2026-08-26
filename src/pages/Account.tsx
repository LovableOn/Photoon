import { useState, type FormEvent } from 'react'
import { AppShell, PageHeader } from '../components/AppShell'
import { Avatar, Button, Card, Toast } from '../components/ui'
import { FormField, PasswordField } from '../components/FormField'
import { Icon } from '../components/icons'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { formatBytes } from '../lib/images'

const TABS = ['Dados pessoais', 'Segurança', 'Privacidade'] as const
type Tab = (typeof TABS)[number]

export function Account() {
  const { user } = useAuth()
  const { photos, projects, elements } = useStore()
  const [tab, setTab] = useState<Tab>('Dados pessoais')
  const [toast, setToast] = useState<string | null>(null)

  function notify(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const usage = photos.reduce((sum, photo) => sum + photo.size, 0)

  return (
    <AppShell>
      <PageHeader breadcrumb={['Conta']} title="Minha conta" />

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit p-6">
          <div className="flex items-center gap-3.5">
            <Avatar name={user?.name ?? ''} size={52} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-[13px] text-ink-faint">{user?.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-2.5">
            <Stat label="Fotos" value={photos.length} />
            <Stat label="Álbuns" value={projects.length} />
            <Stat label="Elementos" value={elements.length} />
            <Stat label="Espaço" value={formatBytes(usage)} />
          </dl>

          <nav className="mt-6 space-y-1">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition ${
                  tab === item
                    ? 'bg-ink text-white'
                    : 'text-ink-soft hover:bg-subtle hover:text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </Card>

        <div>
          {tab === 'Dados pessoais' && (
            <PersonalData
              name={user?.name ?? ''}
              email={user?.email ?? ''}
              onSaved={() => notify('Dados salvos com sucesso')}
            />
          )}
          {tab === 'Segurança' && <Security onSaved={() => notify('Senha alterada')} />}
          {tab === 'Privacidade' && <Privacy />}
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </AppShell>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-subtle px-3.5 py-3">
      <dt className="text-[11px] font-medium text-ink-faint">{label}</dt>
      <dd className="numeric mt-0.5 text-lg font-bold text-ink">{value}</dd>
    </div>
  )
}

function PersonalData({
  name: initialName,
  email: initialEmail,
  onSaved,
}: {
  name: string
  email: string
  onSaved: () => void
}) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState('')

  const changed = name !== initialName || email !== initialEmail

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSaved()
  }

  return (
    <Card className="p-7">
      <h2 className="text-base font-semibold text-ink">Dados pessoais</h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Essas informações aparecem nos seus álbuns e pedidos.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-5">
        <FormField
          id="name"
          label="Nome completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <FormField
          id="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          id="phone"
          label="Telefone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="(00) 00000-0000"
          hint="Usamos apenas para avisar sobre a produção do seu álbum."
        />

        <Button type="submit" disabled={!changed}>
          Salvar alterações
        </Button>
      </form>
    </Card>
  )
}

function Security({ onSaved }: { onSaved: () => void }) {
  const { user, resetPassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = newPassword.length >= 12 ? 3 : newPassword.length >= 8 ? 2 : newPassword ? 1 : 0

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!currentPassword) return setError('Informe sua senha atual.')
    if (newPassword.length < 8) return setError('A nova senha deve ter pelo menos 8 caracteres.')
    if (newPassword !== confirmPassword) return setError('As senhas não coincidem.')

    setLoading(true)
    try {
      if (!user) throw new Error('Sessão expirada. Entre novamente.')
      await resetPassword(user.email, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onSaved()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível alterar a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-7">
      <h2 className="text-base font-semibold text-ink">Segurança</h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Escolha uma senha forte e exclusiva para sua conta.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-[13px] text-danger"
          >
            {error}
          </div>
        )}

        <PasswordField
          id="currentPassword"
          label="Senha atual"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />

        <div>
          <PasswordField
            id="newPassword"
            label="Nova senha"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          {newPassword && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
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

        <PasswordField
          id="confirmNewPassword"
          label="Confirmar nova senha"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <Button type="submit" loading={loading}>
          Alterar senha
        </Button>
      </form>
    </Card>
  )
}

function Privacy() {
  return (
    <Card className="p-7">
      <h2 className="text-base font-semibold text-ink">Privacidade</h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Suas fotos ficam guardadas apenas neste dispositivo, no armazenamento do
        navegador.
      </p>

      <div className="mt-6 space-y-3">
        <a
          href="#"
          className="flex items-center justify-between rounded-2xl border border-line bg-subtle px-5 py-4 transition hover:border-primary/40"
        >
          <span className="text-[13px] font-medium text-ink">Política de privacidade</span>
          <Icon.ArrowUpRight className="size-4 text-ink-faint" />
        </a>
        <a
          href="#"
          className="flex items-center justify-between rounded-2xl border border-line bg-subtle px-5 py-4 transition hover:border-primary/40"
        >
          <span className="text-[13px] font-medium text-ink">Termos de uso</span>
          <Icon.ArrowUpRight className="size-4 text-ink-faint" />
        </a>
      </div>

      <div className="mt-6 rounded-2xl border border-line p-5">
        <p className="text-[13px] font-semibold text-ink">Exclusão de conta</p>
        <p className="mt-1 text-[13px] text-ink-soft">
          Você pode solicitar a exclusão da conta e de todos os dados associados a
          qualquer momento.
        </p>
        <Button variant="danger" size="sm" className="mt-4">
          Solicitar exclusão
        </Button>
      </div>
    </Card>
  )
}
