import { useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { FormField } from '../components/FormField'
import { Button } from '../components/Button'
import { useAuth } from '../lib/auth'

export function Account() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-medium text-ink">Minha conta</h1>
      <p className="mt-2 text-ink-soft">
        Atualize suas informações pessoais.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-md space-y-4 rounded-2xl border border-black/10 bg-white p-6"
      >
        {saved && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
            Dados salvos com sucesso.
          </div>
        )}

        <FormField
          id="name"
          label="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          id="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit">Salvar alterações</Button>
      </form>
    </AppShell>
  )
}
