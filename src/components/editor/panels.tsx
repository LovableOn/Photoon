import { useMemo, useState } from 'react'
import { Badge, Button, Chip } from '../ui'
import { Icon } from '../icons'
import { LAYOUTS, layoutsFor, type Layout } from '../../lib/layouts'
import { makeText, type Spread, type TextBox } from '../../lib/editorTypes'
import { BUILTIN_ELEMENTS, ELEMENT_CATEGORIES } from '../../lib/builtinElements'
import type { CustomElement, Photo } from '../../lib/store'

/* ------------------------------------------------------------ moldura base */

export function Panel({
  title,
  meta,
  subtitle,
  children,
  footer,
}: {
  title: string
  meta?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {meta && <Badge tone="neutral">{meta}</Badge>}
        </div>
        {subtitle && <p className="mt-0.5 text-[11px] text-ink-faint">{subtitle}</p>}
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>

      {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- Fotos */

type PhotoFilter = 'todas' | 'nao-usadas' | 'usadas' | 'favoritas' | 'verticais' | 'horizontais'

const PHOTO_FILTERS: { id: PhotoFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao-usadas', label: 'Não usadas' },
  { id: 'usadas', label: 'Usadas' },
  { id: 'favoritas', label: 'Favoritas' },
  { id: 'verticais', label: 'Verticais' },
  { id: 'horizontais', label: 'Horizontais' },
]

export function PhotosPanel({
  photos,
  thumbUrls,
  usage,
  onPlacePhoto,
  onCreateSpreadWith,
  onFillEmpty,
}: {
  photos: Photo[]
  thumbUrls: Record<string, string>
  /** Quantas vezes cada foto aparece no álbum inteiro. */
  usage: Map<string, number>
  onPlacePhoto: (photoId: string) => void
  onCreateSpreadWith: (photoIds: string[]) => void
  onFillEmpty: () => void
}) {
  const [filter, setFilter] = useState<PhotoFilter>('todas')
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const used = [...usage.values()].filter(Boolean).length

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return photos.filter((photo) => {
      if (term && !photo.name.toLowerCase().includes(term)) return false
      const count = usage.get(photo.id) ?? 0
      switch (filter) {
        case 'nao-usadas':
          return count === 0
        case 'usadas':
          return count > 0
        case 'favoritas':
          return photo.favorite
        case 'verticais':
          return photo.orientation === 'vertical'
        case 'horizontais':
          return photo.orientation === 'horizontal' || photo.orientation === 'panoramica'
        default:
          return true
      }
    })
  }, [photos, filter, search, usage])

  function togglePick(id: string) {
    setPicked((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Panel
      title="Fotos"
      meta={`${used} de ${photos.length} usadas`}
      subtitle="Sua biblioteca"
      footer={
        picked.size > 0 ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              block
              onClick={() => {
                onCreateSpreadWith([...picked])
                setPicked(new Set())
              }}
            >
              <Icon.Plus className="size-4" />
              Criar lâmina com {picked.size}
            </Button>
            <Button size="sm" variant="white" onClick={() => setPicked(new Set())}>
              Limpar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="white" block onClick={onFillEmpty}>
            <Icon.Sparkle className="size-4" />
            Preencher quadros vazios
          </Button>
        )
      }
    >
      <div className="relative mb-3">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint">
          <Icon.Search className="size-4" />
        </span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar foto"
          className="h-10 w-full rounded-xl border border-line bg-subtle pr-3 pl-9 text-[13px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-white focus:outline-none"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {PHOTO_FILTERS.map((item) => (
          <Chip
            key={item.id}
            active={filter === item.id}
            onClick={() => setFilter(item.id)}
            className="h-7 px-2.5 text-[11px]"
          >
            {item.label}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-ink-faint">
          Nenhuma foto neste filtro.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {visible.map((photo) => {
            const count = usage.get(photo.id) ?? 0
            const isPicked = picked.has(photo.id)
            return (
              <div
                key={photo.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/photo-id', photo.id)
                  event.dataTransfer.effectAllowed = 'copy'
                }}
                onClick={() => onPlacePhoto(photo.id)}
                onDoubleClick={() => togglePick(photo.id)}
                title={`${photo.name} — clique para colocar no quadro selecionado, duplo clique para juntar numa lâmina nova`}
                className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border-2 transition active:cursor-grabbing ${
                  isPicked ? 'border-primary' : 'border-transparent hover:border-primary/40'
                }`}
              >
                <img
                  src={thumbUrls[photo.id]}
                  alt={photo.name}
                  loading="lazy"
                  draggable={false}
                  className="size-full object-cover"
                />

                {count > 0 && (
                  <span className="absolute right-1 bottom-1 rounded-full bg-ink/75 px-1.5 text-[9px] font-semibold text-white">
                    {count}×
                  </span>
                )}
                {photo.favorite && (
                  <span className="absolute top-1 right-1 text-white drop-shadow">
                    <Icon.Heart className="size-3" filled />
                  </span>
                )}
                {isPicked && (
                  <span className="absolute top-1 left-1 flex size-4 items-center justify-center rounded bg-primary text-white">
                    <Icon.Check className="size-2.5" />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

/* --------------------------------------------------------------- Layouts */

export function LayoutsPanel({
  spread,
  onApply,
  onSuggest,
}: {
  spread: Spread
  onApply: (layout: Layout) => void
  onSuggest: () => void
}) {
  const filled = spread.frames.filter((frame) => frame.photoId).length
  const [count, setCount] = useState<number | 'todos'>('todos')

  const visible = count === 'todos' ? LAYOUTS : layoutsFor(count)

  return (
    <Panel title="Layouts" subtitle={`${spread.frames.length} quadros nesta lâmina`}>
      <Button size="sm" block className="mb-3" onClick={onSuggest}>
        <Icon.Sparkle className="size-4" />
        Sugerir para esta lâmina
      </Button>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Chip active={count === 'todos'} onClick={() => setCount('todos')} className="h-7 px-2.5 text-[11px]">
          Todos
        </Chip>
        {[1, 2, 3, 4, 5, 6].map((value) => (
          <Chip
            key={value}
            active={count === value}
            onClick={() => setCount(value)}
            className="h-7 px-2.5 text-[11px]"
          >
            {value} foto{value > 1 ? 's' : ''}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {visible.map((layout) => {
          const fits = layout.count >= filled
          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => onApply(layout)}
              className="group rounded-xl border border-line bg-white p-2 text-left transition hover:border-primary"
            >
              <div className="relative aspect-2/1 overflow-hidden rounded-md bg-subtle">
                <span className="absolute inset-y-0 left-1/2 w-px bg-ink/10" />
                {layout.cells.map((cell, index) => (
                  <span
                    key={index}
                    className="absolute rounded-[2px] bg-primary/35 transition group-hover:bg-primary/55"
                    style={{
                      left: `${cell.x + 0.8}%`,
                      top: `${cell.y + 1.6}%`,
                      width: `${cell.w - 1.6}%`,
                      height: `${cell.h - 3.2}%`,
                    }}
                  />
                ))}
              </div>
              <p className="mt-1.5 truncate text-[11px] font-medium text-ink">{layout.name}</p>
              <p className="text-[10px] text-ink-faint">
                {layout.count} foto{layout.count > 1 ? 's' : ''}
                {!fits && ' · sobra foto'}
              </p>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}

/* ----------------------------------------------------------------- Texto */

const TEXT_PRESETS: { name: string; description: string; make: () => TextBox }[] = [
  {
    name: 'Título',
    description: '48 pt, peso forte',
    make: () => makeText({ size: 9, weight: 700, text: 'Título' }),
  },
  {
    name: 'Subtítulo',
    description: 'Médio, discreto',
    make: () => makeText({ size: 5.5, weight: 500, text: 'Subtítulo', color: '#46536a' }),
  },
  {
    name: 'Legenda',
    description: 'Pequena, em caixa alta',
    make: () =>
      makeText({
        size: 3,
        weight: 600,
        text: 'Legenda da foto',
        uppercase: true,
        letterSpacing: 0.12,
        color: '#46536a',
      }),
  },
  {
    name: 'Data',
    description: 'Para marcar o momento',
    make: () =>
      makeText({
        size: 3.5,
        weight: 500,
        text: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        uppercase: true,
        letterSpacing: 0.2,
        color: '#8593a8',
      }),
  },
]

export function TextPanel({ onInsert }: { onInsert: (text: TextBox) => void }) {
  return (
    <Panel title="Texto" subtitle="Clique para inserir no centro da lâmina">
      <div className="space-y-2">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onInsert(preset.make())}
            className="w-full rounded-xl border border-line bg-white p-3.5 text-left transition hover:border-primary"
          >
            <p className="text-sm font-semibold text-ink">{preset.name}</p>
            <p className="mt-0.5 text-[11px] text-ink-faint">{preset.description}</p>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-subtle p-3 text-[11px] leading-relaxed text-ink-soft">
        Depois de inserir, dê um duplo clique no texto na lâmina para editar o
        conteúdo. As demais opções ficam no inspetor, à direita.
      </p>
    </Panel>
  )
}

/* ---------------------------------------------------------------- Fundos */

const SOLID_BACKGROUNDS = [
  '#ffffff',
  '#f5f7fb',
  '#eef2f8',
  '#e6eaf2',
  '#0b1220',
  '#46536a',
  '#dbe6fe',
  '#cffafe',
  '#ede9fe',
  '#fef3c7',
  '#fce7f3',
  '#dcfce7',
]

const GRADIENTS = [
  'linear-gradient(135deg, #2563eb, #06b6d4)',
  'linear-gradient(135deg, #eef2f8, #ffffff)',
  'linear-gradient(135deg, #0b1220, #46536a)',
  'linear-gradient(135deg, #dbe6fe, #ede9fe)',
  'linear-gradient(160deg, #fef3c7, #fce7f3)',
  'linear-gradient(160deg, #cffafe, #dcfce7)',
]

export function BackgroundsPanel({
  current,
  onApply,
  onApplyAll,
}: {
  current: string | null
  onApply: (background: string | null) => void
  onApplyAll: (background: string | null) => void
}) {
  const [tab, setTab] = useState<'cores' | 'gradientes'>('cores')
  const options = tab === 'cores' ? SOLID_BACKGROUNDS : GRADIENTS

  return (
    <Panel title="Fundos" subtitle="Aplique na lâmina atual ou no álbum inteiro">
      <div className="mb-3 flex gap-1.5">
        <Chip active={tab === 'cores'} onClick={() => setTab('cores')} className="h-7 px-3 text-[11px]">
          Cores
        </Chip>
        <Chip active={tab === 'gradientes'} onClick={() => setTab('gradientes')} className="h-7 px-3 text-[11px]">
          Gradientes
        </Chip>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {options.map((background) => (
          <button
            key={background}
            type="button"
            onClick={() => onApply(background)}
            aria-label={`Aplicar fundo ${background}`}
            className={`aspect-square rounded-xl border-2 transition ${
              current === background ? 'border-primary' : 'border-line hover:border-primary/50'
            }`}
            style={{ background }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Button size="sm" variant="white" block onClick={() => onApplyAll(current)}>
          Aplicar ao álbum inteiro
        </Button>
        <Button size="sm" variant="ghost" block onClick={() => onApply(null)}>
          Remover fundo
        </Button>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------- Elementos */

export function ElementsPanel({
  customElements,
  elementUrls,
  onInsert,
}: {
  customElements: CustomElement[]
  elementUrls: Record<string, string>
  onInsert: (elementId: string, color: string) => void
}) {
  const [category, setCategory] = useState<string>('todos')
  const [color, setColor] = useState('#2563eb')

  const visible =
    category === 'todos'
      ? BUILTIN_ELEMENTS
      : BUILTIN_ELEMENTS.filter((element) => element.category === category)

  const visibleCustom =
    category === 'todos'
      ? customElements
      : customElements.filter((element) => element.category === category)

  return (
    <Panel title="Elementos" subtitle="Clique para inserir na lâmina">
      <div className="mb-3 flex items-center gap-1.5 rounded-xl bg-subtle px-3 py-2">
        <span className="text-[11px] font-medium text-ink-faint">Cor</span>
        {['#2563eb', '#06b6d4', '#7c3aed', '#0b1220', '#ffffff'].map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => setColor(swatch)}
            aria-label={`Cor ${swatch}`}
            className={`size-5 rounded-full border transition ${
              color === swatch ? 'border-ink ring-2 ring-ink' : 'border-line hover:scale-110'
            }`}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Chip active={category === 'todos'} onClick={() => setCategory('todos')} className="h-7 px-2.5 text-[11px]">
          Todos
        </Chip>
        {ELEMENT_CATEGORIES.map((item) => (
          <Chip
            key={item}
            active={category === item}
            onClick={() => setCategory(item)}
            className="h-7 px-2.5 text-[11px]"
          >
            {item}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {visible.map((element) => (
          <button
            key={element.id}
            type="button"
            onClick={() => onInsert(element.id, color)}
            title={element.name}
            className="aspect-square rounded-xl border border-line bg-white p-2 transition hover:border-primary"
            style={{ color }}
          >
            <svg
              viewBox="0 0 100 100"
              className="size-full"
              dangerouslySetInnerHTML={{ __html: element.svg }}
              aria-label={element.name}
              role="img"
            />
          </button>
        ))}

        {visibleCustom.map((element) => (
          <button
            key={element.id}
            type="button"
            onClick={() => onInsert(element.id, color)}
            title={element.name}
            className="aspect-square rounded-xl border border-line bg-white p-2 transition hover:border-primary"
          >
            <img src={elementUrls[element.id]} alt={element.name} className="size-full object-contain" />
          </button>
        ))}
      </div>
    </Panel>
  )
}

/* -------------------------------------------------------------- Assistência */

export function AssistPanel({
  onFillEmpty,
  onSuggestLayout,
  onBalanceSpacing,
  onHarmonizeBackground,
  onGrayscale,
  emptyCount,
  unusedCount,
}: {
  onFillEmpty: () => void
  onSuggestLayout: () => void
  onBalanceSpacing: () => void
  onHarmonizeBackground: () => void
  onGrayscale: () => void
  emptyCount: number
  unusedCount: number
}) {
  const actions = [
    {
      label: 'Preencher quadros vazios',
      description:
        emptyCount === 0
          ? 'Nenhum quadro vazio nesta lâmina'
          : `${emptyCount} quadro(s) vazio(s) · ${unusedCount} foto(s) não usada(s)`,
      onClick: onFillEmpty,
      disabled: emptyCount === 0 || unusedCount === 0,
    },
    {
      label: 'Escolher o melhor layout',
      description: 'Reorganiza os quadros pela quantidade de fotos',
      onClick: onSuggestLayout,
    },
    {
      label: 'Equilibrar espaçamento',
      description: 'Volta ao respiro recomendado de 4 mm',
      onClick: onBalanceSpacing,
    },
    {
      label: 'Harmonizar o fundo',
      description: 'Aplica um tom claro que não briga com as fotos',
      onClick: onHarmonizeBackground,
    },
    {
      label: 'Deixar em preto e branco',
      description: 'Aplica a todas as fotos da lâmina',
      onClick: onGrayscale,
    },
  ]

  return (
    <Panel title="Assistência" subtitle="Ações automáticas para esta lâmina">
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="w-full rounded-xl border border-line bg-white p-3.5 text-left transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line"
          >
            <p className="text-sm font-semibold text-ink">{action.label}</p>
            <p className="mt-0.5 text-[11px] text-ink-faint">{action.description}</p>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-subtle p-3 text-[11px] leading-relaxed text-ink-soft">
        Estas ações seguem regras fixas de diagramação — orientação das fotos,
        quadros livres e espaçamento. Não há chamada a um modelo de IA nesta
        versão.
      </p>
    </Panel>
  )
}
