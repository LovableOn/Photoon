import { Fragment, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, PageHeader } from '../components/AppShell'
import { Badge, Button, Card, LinkButton } from '../components/ui'
import { FormField } from '../components/FormField'
import { Icon } from '../components/icons'
import { useStore } from '../lib/store'

const PRODUCTS = [
  {
    id: 'Álbum encadernado',
    description: 'Capa rígida e acabamento premium.',
    from: 'a partir de R$ 289',
    icon: Icon.Albums,
  },
  {
    id: 'Fotolivro',
    description: 'Leve, moderno e com ótimo custo.',
    from: 'a partir de R$ 149',
    icon: Icon.Layers,
  },
  {
    id: 'Revista',
    description: 'Grampeada, ideal para eventos curtos.',
    from: 'a partir de R$ 89',
    icon: Icon.Photos,
  },
  {
    id: 'Estojo com álbum',
    description: 'Álbum protegido em estojo combinando.',
    from: 'a partir de R$ 389',
    icon: Icon.Grid,
  },
]

interface FormatOption {
  label: string
  width: number
  height: number
}

const FORMATS: FormatOption[] = [
  { label: '20×20 quadrado', width: 20, height: 20 },
  { label: '30×20 horizontal', width: 30, height: 20 },
  { label: '20×30 vertical', width: 20, height: 30 },
  { label: '40×30 horizontal', width: 40, height: 30 },
]

const PAGE_OPTIONS = [20, 30, 40, 60]

const STEPS = ['Produto', 'Fotos', 'Finalizar']

export function NewAlbum() {
  const navigate = useNavigate()
  const location = useLocation()
  const { photos, thumbUrls, createProject } = useStore()

  const preselected = (location.state as { photoIds?: string[] } | null)?.photoIds ?? []

  const [step, setStep] = useState(0)
  const [product, setProduct] = useState(PRODUCTS[0].id)
  const [format, setFormat] = useState(FORMATS[0].label)
  const [pages, setPages] = useState(PAGE_OPTIONS[0])
  const [selected, setSelected] = useState<Set<string>>(new Set(preselected))
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [creating, setCreating] = useState(false)

  const suggestedMin = Math.round(pages * 1.5)
  const suggestedMax = pages * 3
  const activeFormat = FORMATS.find((item) => item.label === format) ?? FORMATS[0]
  const activeProduct = PRODUCTS.find((item) => item.id === product) ?? PRODUCTS[0]
  const coverId = [...selected][0]

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

      {/* stepper: uma trilha só, com o traço preenchendo o que já foi
          percorrido — em vez de pílulas soltas sem relação visual entre si. */}
      <div className="mb-8 flex items-start">
        {STEPS.map((label, index) => (
          <Fragment key={label}>
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              disabled={index > step}
              className="flex shrink-0 flex-col items-center gap-2 disabled:cursor-default"
            >
              <span
                className={`flex size-9 items-center justify-center rounded-full text-[13px] font-bold transition ${
                  index === step
                    ? 'bg-brand text-white shadow-float'
                    : index < step
                      ? 'bg-success text-white'
                      : 'bg-subtle text-ink-faint'
                }`}
              >
                {index < step ? <Icon.Check className="size-4" /> : index + 1}
              </span>
              <span
                className={`text-[12px] font-semibold ${
                  index <= step ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span className="mt-[18px] mx-3 h-0.5 min-w-6 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className={`block h-full rounded-full bg-success transition-[width] duration-300 ${
                    index < step ? 'w-full' : 'w-0'
                  }`}
                />
              </span>
            )}
          </Fragment>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {step === 0 && (
            <div className="space-y-5">
              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">Escolha o produto</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PRODUCTS.map((item) => {
                    const ItemIcon = item.icon
                    const active = product === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProduct(item.id)}
                        className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                          active
                            ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/20'
                            : 'border-line bg-surface hover:border-primary/40'
                        }`}
                      >
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                            active ? 'bg-primary text-white' : 'bg-subtle text-ink-faint'
                          }`}
                        >
                          <ItemIcon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-ink">{item.id}</span>
                            {active && (
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                                <Icon.Check className="size-3" />
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-[13px] text-ink-soft">
                            {item.description}
                          </span>
                          <span className="mt-2 block text-[11px] font-medium text-ink-faint">
                            {item.from}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold text-ink">Formato</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {FORMATS.map((item) => {
                    const active = format === item.label
                    const ratio = item.width / item.height
                    const boxW = ratio >= 1 ? 34 : 34 * ratio
                    const boxH = ratio >= 1 ? 34 / ratio : 34
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setFormat(item.label)}
                        className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 transition ${
                          active
                            ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/20'
                            : 'border-line bg-surface hover:border-primary/40'
                        }`}
                      >
                        <span className="flex h-9 items-center justify-center">
                          <span
                            className={`rounded-[3px] border-2 ${
                              active ? 'border-primary bg-primary/15' : 'border-ink-faint/60'
                            }`}
                            style={{ width: boxW, height: boxH }}
                          />
                        </span>
                        <span className="text-center text-[12px] font-semibold text-ink">
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <h2 className="mt-6 text-base font-semibold text-ink">
                  Quantidade de páginas
                </h2>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {PAGE_OPTIONS.map((item) => {
                    const active = pages === item
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPages(item)}
                        className={`rounded-2xl border py-3.5 text-center transition ${
                          active
                            ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/20'
                            : 'border-line bg-surface hover:border-primary/40'
                        }`}
                      >
                        <span className="numeric block text-lg font-bold text-ink">
                          {item}
                        </span>
                        <span className="block text-[11px] text-ink-faint">páginas</span>
                      </button>
                    )
                  })}
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
                <dl className="mt-3 grid gap-3 text-[13px] sm:grid-cols-2">
                  <SummaryRow icon={<activeProduct.icon className="size-4" />} label="Produto" value={product} />
                  <SummaryRow icon={<Icon.Grid className="size-4" />} label="Formato" value={format} />
                  <SummaryRow icon={<Icon.Layers className="size-4" />} label="Páginas" value={`${pages}`} />
                  <SummaryRow icon={<Icon.Photos className="size-4" />} label="Fotos" value={`${selected.size}`} />
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
          <Card className="sticky top-24 overflow-hidden p-0">
            <div
              className="relative overflow-hidden bg-ink"
              style={{ aspectRatio: `${activeFormat.width} / ${activeFormat.height}` }}
            >
              {coverId ? (
                <img
                  src={thumbUrls[coverId]}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-brand" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              {/* lombada simulando um álbum físico */}
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent" />
              <Badge className="absolute top-3 left-3 bg-white/90 text-ink" tone="neutral">
                {activeFormat.label}
              </Badge>
            </div>

            <div className="p-6">
              <p className="text-[13px] font-semibold text-ink">Seu álbum</p>

              <dl className="mt-4 space-y-3 text-[13px]">
                <SummaryRow icon={<activeProduct.icon className="size-4" />} label="Produto" value={product} />
                <SummaryRow icon={<Icon.Layers className="size-4" />} label="Páginas" value={`${pages}`} />
                <SummaryRow icon={<Icon.Photos className="size-4" />} label="Fotos" value={`${selected.size}`} />
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
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  )
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-ink-faint">
        {icon && <span className="text-ink-faint">{icon}</span>}
        {label}
      </dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  )
}
