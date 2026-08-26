import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, PageHeader } from '../components/AppShell'
import { Badge, Button, Card, Chip, LinkButton } from '../components/ui'
import { FormField } from '../components/FormField'
import { Icon } from '../components/icons'
import { useStore } from '../lib/store'

const PRODUCTS = [
  {
    id: 'Álbum encadernado',
    description: 'Capa rígida e acabamento premium.',
    from: 'a partir de R$ 289',
  },
  {
    id: 'Fotolivro',
    description: 'Leve, moderno e com ótimo custo.',
    from: 'a partir de R$ 149',
  },
  {
    id: 'Revista',
    description: 'Grampeada, ideal para eventos curtos.',
    from: 'a partir de R$ 89',
  },
  {
    id: 'Estojo com álbum',
    description: 'Álbum protegido em estojo combinando.',
    from: 'a partir de R$ 389',
  },
]

const FORMATS = ['20×20 quadrado', '30×20 horizontal', '20×30 vertical', '40×30 horizontal']
const PAGE_OPTIONS = [20, 30, 40, 60]

const STEPS = ['Produto', 'Fotos', 'Finalizar']

export function NewAlbum() {
  const navigate = useNavigate()
  const location = useLocation()
  const { photos, thumbUrls, createProject } = useStore()

  const preselected = (location.state as { photoIds?: string[] } | null)?.photoIds ?? []

  const [step, setStep] = useState(0)
  const [product, setProduct] = useState(PRODUCTS[0].id)
  const [format, setFormat] = useState(FORMATS[0])
  const [pages, setPages] = useState(PAGE_OPTIONS[0])
  const [selected, setSelected] = useState<Set<string>>(new Set(preselected))
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [creating, setCreating] = useState(false)

  const suggestedMin = Math.round(pages * 1.5)
  const suggestedMax = pages * 3

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreate() {
    if (!name.trim()) {
      setNameError('Dê um nome para o seu álbum.')
      return
    }
    setCreating(true)
    try {
      const project = await createProject({
        name: name.trim(),
        product,
        format,
        pages,
        photoIds: [...selected],
      })
      navigate(`/app/albuns/${project.id}`, { replace: true })
    } finally {
      setCreating(false)
    }
  }

  return (
    <AppShell>
      <PageHeader breadcrumb={['Álbuns', 'Novo']} title="Criar álbum" back="/app/albuns" />

      {/* stepper */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => index < step && setStep(index)}
            disabled={index > step}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
              index === step
                ? 'border-ink bg-ink text-white'
                : index < step
                  ? 'border-line bg-surface text-ink hover:border-ink/20'
                  : 'border-line bg-surface text-ink-faint'
            }`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[11px] ${
                index === step
                  ? 'bg-white/20'
                  : index < step
                    ? 'bg-success-soft text-success'
                    : 'bg-subtle'
              }`}
            >
              {index < step ? <Icon.Check className="size-3" /> : index + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {step === 0 && (
            <div className="space-y-5">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">Escolha o produto</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PRODUCTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProduct(item.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        product === item.id
                          ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/20'
                          : 'border-line bg-surface hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{item.id}</p>
                        {product === item.id && (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <Icon.Check className="size-3" />
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-ink-soft">{item.description}</p>
                      <p className="mt-2 text-[11px] font-medium text-ink-faint">
                        {item.from}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">Formato</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {FORMATS.map((item) => (
                    <Chip key={item} active={format === item} onClick={() => setFormat(item)}>
                      {item}
                    </Chip>
                  ))}
                </div>

                <h2 className="mt-6 text-base font-semibold text-ink">
                  Quantidade de páginas
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PAGE_OPTIONS.map((item) => (
                    <Chip key={item} active={pages === item} onClick={() => setPages(item)}>
                      {item} páginas
                    </Chip>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {step === 1 && (
            <Card className="p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ink">Escolha as fotos</h2>
                  <p className="mt-1 text-[13px] text-ink-soft">
                    Para {pages} páginas, sugerimos entre {suggestedMin} e {suggestedMax}{' '}
                    fotos.
                  </p>
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="white"
                      onClick={() => setSelected(new Set(photos.map((photo) => photo.id)))}
                    >
                      Selecionar todas
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                      Limpar
                    </Button>
                  </div>
                )}
              </div>

              {photos.length === 0 ? (
                <div className="mt-6 flex flex-col items-center rounded-2xl bg-subtle px-6 py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon.Photos className="size-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    Sua biblioteca está vazia
                  </p>
                  <p className="mt-1 max-w-xs text-[13px] text-ink-soft">
                    Envie fotos antes de montar o álbum. Você também pode criar o
                    álbum agora e adicionar as fotos depois.
                  </p>
                  <LinkButton to="/app/fotos" size="sm" className="mt-4">
                    <Icon.Upload className="size-4" />
                    Enviar fotos
                  </LinkButton>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                  {photos.map((photo) => {
                    const isSelected = selected.has(photo.id)
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => toggle(photo.id)}
                        aria-pressed={isSelected}
                        className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/25'
                            : 'border-transparent hover:border-primary/40'
                        }`}
                      >
                        <img
                          src={thumbUrls[photo.id]}
                          alt={photo.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        {isSelected && (
                          <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-md bg-primary text-white">
                            <Icon.Check className="size-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-ink">Nome do álbum</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                Você pode mudar depois, a qualquer momento.
              </p>

              <div className="mt-5 max-w-md">
                <FormField
                  id="albumName"
                  label="Como você quer chamar este álbum?"
                  placeholder="Ex.: Formatura da Julia"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setNameError('')
                  }}
                  error={nameError}
                />
              </div>

              <div className="mt-6 rounded-2xl bg-subtle p-5">
                <p className="text-[13px] font-semibold text-ink">Resumo</p>
                <dl className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
                  <SummaryRow label="Produto" value={product} />
                  <SummaryRow label="Formato" value={format} />
                  <SummaryRow label="Páginas" value={`${pages}`} />
                  <SummaryRow label="Fotos" value={`${selected.size}`} />
                </dl>
              </div>
            </Card>
          )}

          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="white"
              onClick={() => (step === 0 ? navigate('/app/albuns') : setStep(step - 1))}
            >
              {step === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>
                Continuar
                {step === 1 && selected.size > 0 && (
                  <span className="numeric">com {selected.size}</span>
                )}
              </Button>
            ) : (
              <Button onClick={handleCreate} loading={creating}>
                Criar álbum
              </Button>
            )}
          </div>
        </div>

        {/* resumo fixo */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-6">
            <p className="text-[13px] font-semibold text-ink">Seu álbum</p>

            <div className="mt-4 aspect-4/3 overflow-hidden rounded-2xl bg-inset">
              {selected.size > 0 ? (
                <div className="grid size-full grid-cols-2 gap-0.5">
                  {[...selected].slice(0, 4).map((id) => (
                    <img
                      key={id}
                      src={thumbUrls[id]}
                      alt=""
                      className="size-full object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex size-full items-center justify-center text-ink-faint">
                  <Icon.Albums className="size-8" />
                </div>
              )}
            </div>

            <dl className="mt-5 space-y-3 text-[13px]">
              <SummaryRow label="Produto" value={product} />
              <SummaryRow label="Formato" value={format} />
              <SummaryRow label="Páginas" value={`${pages}`} />
              <SummaryRow label="Fotos" value={`${selected.size}`} />
            </dl>

            {selected.size > 0 && (
              <div className="mt-5">
                <Badge
                  tone={
                    selected.size >= suggestedMin && selected.size <= suggestedMax
                      ? 'success'
                      : 'warning'
                  }
                >
                  {selected.size < suggestedMin
                    ? 'Poucas fotos para o tamanho'
                    : selected.size > suggestedMax
                      ? 'Muitas fotos para o tamanho'
                      : 'Quantidade ideal'}
                </Badge>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </AppShell>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  )
}
