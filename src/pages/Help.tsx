import { useState } from 'react'
import { AppShell } from '../components/AppShell'

const SHORTCUTS = [
  'Começar meu álbum',
  'Escolher fotos',
  'Criar com IA',
  'Editar páginas',
  'Corrigir avisos',
  'Finalizar projetos',
]

const FAQ = [
  {
    question: 'Como envio minhas fotos?',
    answer:
      'Você não precisa enviar fotos. A empresa que contratou a Photoon já disponibiliza a galeria liberada para você dentro da sua conta.',
  },
  {
    question: 'Posso criar mais de um álbum?',
    answer:
      'Depende da liberação da empresa. Quando permitido, a opção de criar um novo álbum aparece na sua central de projetos.',
  },
  {
    question: 'O que acontece depois que eu finalizar?',
    answer:
      'Após a finalização, o projeto segue para produção conforme o processo definido pela empresa responsável.',
  },
]

export function Help() {
  const [search, setSearch] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-ink">Ajuda</h1>
      <p className="mt-1 text-ink-soft">Como podemos ajudar?</p>

      <div className="mt-6 max-w-xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar dúvidas..."
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-[14px] border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-ink hover:border-primary/40 hover:bg-bg"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Perguntas frequentes</h2>
        <div className="mt-3 divide-y divide-border rounded-[14px] border border-border bg-surface">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-ink"
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`size-4 shrink-0 text-ink-faint transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm text-ink-soft">{item.answer}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 rounded-[14px] border border-border bg-surface p-6 text-center">
        <h2 className="text-lg font-semibold text-ink">Falar com a empresa</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Não encontrou o que precisava? Entre em contato diretamente.
        </p>
        <a
          href="#"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-brand px-5 text-sm font-semibold text-white shadow-card"
        >
          Enviar mensagem
        </a>
      </div>
    </AppShell>
  )
}
