import { Badge, IconButton, Modal } from '../ui'
import { Icon } from '../icons'
import { SpreadView } from './SpreadView'
import { emptyFrames, type Spread } from '../../lib/editorTypes'

interface Props {
  spreads: Spread[]
  current: number
  thumbUrls: Record<string, string>
  elementUrls: Record<string, string>
  gapFor: (spread: Spread) => { gapX: number; gapY: number }
  aspect: number
  /** Proporção de uma página só — a capa é mais estreita que a lâmina aberta. */
  coverAspect: number
  open: boolean
  allOpen: boolean
  onToggle: () => void
  onToggleAll: () => void
  onSelect: (index: number) => void
  onAdd: () => void
  onDuplicate: (index: number) => void
  onDelete: (index: number) => void
  onReorder: (from: number, to: number) => void
}

export function Storyboard({
  spreads,
  current,
  thumbUrls,
  elementUrls,
  gapFor,
  aspect,
  coverAspect,
  open,
  allOpen,
  onToggle,
  onToggleAll,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onReorder,
}: Props) {
  const withoutPhoto = spreads.filter((spread) => emptyFrames(spread).length > 0).length

  return (
    <>
      <div className="border-t border-line bg-white">
        <div className="flex items-center justify-between gap-3 px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13px] font-bold text-ink">Páginas</h2>
            {withoutPhoto > 0 && (
              <Badge tone="warning">
                {withoutPhoto} {withoutPhoto === 1 ? 'lâmina sem foto' : 'lâminas sem foto'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAll}
              className="text-[12px] font-semibold text-primary hover:underline"
            >
              Ver todas as páginas
            </button>
            <IconButton label={open ? 'Recolher páginas' : 'Expandir páginas'} size="sm" onClick={onToggle}>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`size-4 transition-transform ${open ? '' : 'rotate-180'}`}
              >
                <path d="M5 12.5 10 7.5 15 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </div>
        </div>

        {open && (
          <div className="scrollbar-thin flex items-end gap-3 overflow-x-auto px-5 pb-3">
            {spreads.map((spread, index) => (
              <Thumb
                key={spread.id}
                spread={spread}
                index={index}
                active={index === current}
                thumbUrls={thumbUrls}
                elementUrls={elementUrls}
                gapFor={gapFor}
                aspect={aspect}
                coverAspect={coverAspect}
                onSelect={() => onSelect(index)}
                onDuplicate={() => onDuplicate(index)}
                onDelete={() => onDelete(index)}
                onReorder={onReorder}
              />
            ))}

            <button
              type="button"
              onClick={onAdd}
              className="mb-4 flex h-[50px] w-[100px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-line text-ink-faint transition hover:border-primary hover:text-primary"
            >
              <Icon.Plus className="size-4" />
              <span className="text-[10px] font-medium">Nova lâmina</span>
            </button>
          </div>
        )}
      </div>

      {/* gerenciador em tela cheia */}
      <Modal
        open={allOpen}
        onClose={onToggleAll}
        title="Todas as páginas"
        description={`${spreads.length} lâminas · arraste para reordenar`}
        size="xl"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {spreads.map((spread, index) => {
            const { gapX, gapY } = gapFor(spread)
            const vazios = emptyFrames(spread).length
            const isCover = spread.kind === 'cover'
            return (
              <div key={spread.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(index)
                    onToggleAll()
                  }}
                  className={`block w-full overflow-hidden rounded-xl border-2 transition ${
                    index === current ? 'border-primary' : 'border-line hover:border-primary/50'
                  }`}
                >
                  {/* Todas as células têm a mesma altura; a capa, mais estreita,
                      fica centralizada para a grade não desalinhar. */}
                  <div
                    className="flex items-center justify-center bg-subtle"
                    style={{ aspectRatio: aspect }}
                  >
                    <div
                      className="h-full"
                      style={{ width: isCover ? `${(coverAspect / aspect) * 100}%` : '100%' }}
                    >
                      <SpreadView
                        spread={spread}
                        gapX={gapX}
                        gapY={gapY}
                        thumbUrls={thumbUrls}
                        elementUrls={elementUrls}
                        className="size-full"
                      />
                    </div>
                  </div>
                </button>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-ink">{label(spread, index)}</span>
                  {vazios > 0 ? (
                    <Badge tone="warning">{vazios} vazio(s)</Badge>
                  ) : spread.approved ? (
                    <Badge tone="success">Aprovada</Badge>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}

function label(spread: Spread, index: number) {
  if (spread.kind === 'cover') return 'Capa'
  const first = index * 2 - 1
  return `${first}–${first + 1}`
}

function Thumb({
  spread,
  index,
  active,
  thumbUrls,
  elementUrls,
  gapFor,
  aspect,
  coverAspect,
  onSelect,
  onDuplicate,
  onDelete,
  onReorder,
}: {
  spread: Spread
  index: number
  active: boolean
  thumbUrls: Record<string, string>
  elementUrls: Record<string, string>
  gapFor: (spread: Spread) => { gapX: number; gapY: number }
  aspect: number
  coverAspect: number
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onReorder: (from: number, to: number) => void
}) {
  const { gapX, gapY } = gapFor(spread)
  const vazios = emptyFrames(spread).length
  const isCover = spread.kind === 'cover'
  // Altura fixa para a tira: a largura sai da proporção de cada peça.
  const THUMB_HEIGHT = 50
  const width = THUMB_HEIGHT * (isCover ? coverAspect : aspect)

  return (
    <div
      className="group relative shrink-0"
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/spread-index', String(index))}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const from = Number(event.dataTransfer.getData('text/spread-index'))
        if (!Number.isNaN(from) && from !== index) onReorder(from, index)
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`block overflow-hidden rounded-lg border-2 transition ${
          active ? 'border-primary' : 'border-line hover:border-primary/50'
        }`}
        style={{ width, height: THUMB_HEIGHT }}
      >
        <SpreadView
          spread={spread}
          gapX={gapX}
          gapY={gapY}
          thumbUrls={thumbUrls}
          elementUrls={elementUrls}
          className="size-full"
        />
      </button>

      {/* estado */}
      <span className="absolute -top-1 -right-1">
        {vazios > 0 ? (
          <span className="flex size-4 items-center justify-center rounded-full bg-warning text-[9px] font-bold text-white">
            !
          </span>
        ) : spread.approved ? (
          <span className="flex size-4 items-center justify-center rounded-full bg-success text-white">
            <Icon.Check className="size-2.5" />
          </span>
        ) : null}
      </span>

      <p className="mt-1 text-center text-[10px] font-medium text-ink-faint">
        {label(spread, index)}
      </p>

      {!isCover && (
        <div className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={onDuplicate}
            aria-label="Duplicar lâmina"
            title="Duplicar lâmina"
            className="flex size-5 items-center justify-center rounded-full bg-white text-ink-soft shadow-float hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-3" stroke="currentColor" strokeWidth="1.6">
              <rect x="6" y="6" width="10" height="10" rx="2" />
              <path d="M13 4H5a1 1 0 0 0-1 1v8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Excluir lâmina"
            title="Excluir lâmina"
            className="flex size-5 items-center justify-center rounded-full bg-white text-danger shadow-float"
          >
            <Icon.Trash className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}
