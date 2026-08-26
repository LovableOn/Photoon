import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell, PageHeader } from '../components/AppShell'
import { Button, Card } from '../components/ui'
import { Icon } from '../components/icons'

const SHORTCUTS = [
  {
    title: 'Enviar minhas fotos',
    description: 'Suba as imagens que vão compor seus álbuns.',
    to: '/app/fotos',
    icon: <Icon.Upload className="size-5" />,
  },
  {
    title: 'Criar um álbum',
    description: 'Escolha produto, formato e as fotos.',
    to: '/app/albuns/novo',
    icon: <Icon.Albums className="size-5" />,
  },
  {
    title: 'Explorar elementos',
    description: 'Formas, molduras, ícones e etiquetas.',
    to: '/app/elementos',
    icon: <Icon.Elements className="size-5" />,
  },
]

const FAQ = [
  {
    question: 'Onde ficam guardadas as minhas fotos?',
    answer:
      'Nesta versão, as fotos ficam no armazenamento do próprio navegador (IndexedDB). Elas não são enviadas para nenhum servidor e continuam disponíveis quando você voltar neste mesmo dispositivo.',
  },
  {
    question: 'Quantas fotos devo escolher para cada álbum?',
    answer:
      'A recomendação é de 1,5 a 3 fotos por página. Para um álbum de 20 páginas, entre 30 e 60 fotos costuma dar um bom ritmo visual — a tela de criação mostra essa faixa automaticamente.',
  },
  {
    question: 'Posso trocar a capa do álbum?',
    answer:
      'Sim. Abra o álbum, passe o mouse sobre qualquer foto e clique em "Capa". A imagem escolhida passa a representar o álbum em todas as listagens.',
  },
  {
    question: 'O que acontece quando eu finalizo um álbum?',
    answer:
      'O álbum fica travado para edição e passa a aparecer como Finalizado. As fotos continuam na sua biblioteca e podem ser usadas em outros álbuns.',
  },
  {
    question: 'Posso usar meus próprios elementos?',
    answer:
      'Pode. Em Elementos, use "Novo elemento" para enviar arquivos SVG, PNG ou WebP. Eles ficam guardados junto com a biblioteca da Photoon.',
  },
]

export function Help() {
  const [search, setSearch] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const results = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return FAQ
    return FAQ.filter(
      (item) =>
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term),
    )
  }, [search])

  return (
    <AppShell>
      <PageHeader breadcrumb={['Ajuda']} title="Como podemos ajudar?" />

      <div className="mb-8 max-w-xl">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-faint">
            <Icon.Search className="size-5" />
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque por uma dúvida"
            className="h-13 w-full rounded-full border border-line bg-surface py-3.5 pr-5 pl-12 text-sm text-ink shadow-float transition placeholder:text-ink-faint focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="h-full p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                {item.icon}
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">
          Perguntas frequentes
        </h2>

        {results.length === 0 ? (
          <Card>
            <div className="px-6 py-14 text-center">
              <p className="text-base font-semibold text-ink">Nada encontrado</p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Tente outras palavras ou fale com a gente.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="divide-y divide-line overflow-hidden p-0">
            {results.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[15px] font-medium text-ink">
                      {item.question}
                    </span>
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-soft transition ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="size-4">
                        <path
                          d="M5 7.5 10 12.5 15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">
                      {item.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </Card>
        )}
      </section>

      <Card className="mt-8 overflow-hidden border-0 bg-brand p-0">
        <div className="relative p-8 text-center">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="relative">
            <h2 className="text-xl font-bold text-white">Ainda com dúvida?</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-white/80">
              Nossa equipe responde em até um dia útil.
            </p>
            <Button variant="white" className="mt-5">
              Falar com o suporte
            </Button>
          </div>
        </div>
      </Card>
    </AppShell>
  )
}
