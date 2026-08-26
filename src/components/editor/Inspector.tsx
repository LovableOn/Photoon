import { Badge, Button } from '../ui'
import { Icon } from '../icons'
import type {
  ElementItem,
  Frame,
  Selection,
  Spread,
  TextBox,
} from '../../lib/editorTypes'
import type { Issue } from '../../lib/checks'
import type { Photo } from '../../lib/store'

/* ------------------------------------------------------------- controles */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-4">
      <h3 className="mb-3 text-[10px] font-bold tracking-[0.09em] text-ink-faint uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[12px] text-ink-soft">{label}</label>
        <span className="numeric text-[12px] font-semibold text-ink">
          {value > 0 && min < 0 ? '+' : ''}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-inset accent-primary"
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  suffix,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  suffix: string
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] text-ink-soft">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={Math.round(value)}
          min={min}
          max={max}
          onChange={(event) =>
            onChange(Math.max(min, Math.min(max, Number(event.target.value) || 0)))
          }
          className="numeric h-10 w-full rounded-xl border border-line bg-subtle pr-8 pl-3 text-[13px] font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] text-ink-faint">
          {suffix}
        </span>
      </div>
    </div>
  )
}

function ActionGrid({
  actions,
}: {
  actions: { label: string; icon: React.ReactNode; onClick: () => void }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-[12px] font-medium text-ink transition hover:border-primary"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- inspetor */

interface Props {
  spread: Spread
  selection: Selection | null
  photos: Map<string, Photo>
  issues: Issue[]
  onUpdateFrame: (id: string, patch: Partial<Frame>) => void
  onUpdateText: (id: string, patch: Partial<TextBox>) => void
  onUpdateElement: (id: string, patch: Partial<ElementItem>) => void
  onUpdateSpread: (patch: Partial<Spread>) => void
  onRemove: () => void
  onApplyFix: (issue: Issue) => void
}

export function Inspector({
  spread,
  selection,
  photos,
  issues,
  onUpdateFrame,
  onUpdateText,
  onUpdateElement,
  onUpdateSpread,
  onRemove,
  onApplyFix,
}: Props) {
  const frame = selection?.kind === 'frame'
    ? spread.frames.find((item) => item.id === selection.id)
    : undefined
  const text = selection?.kind === 'text'
    ? spread.texts.find((item) => item.id === selection.id)
    : undefined
  const element = selection?.kind === 'element'
    ? spread.elements.find((item) => item.id === selection.id)
    : undefined

  const photo = frame?.photoId ? photos.get(frame.photoId) : undefined
  const frameIssues = selection
    ? issues.filter(
        (issue) => issue.target?.kind === selection.kind && issue.target.id === selection.id,
      )
    : []

  return (
    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <h2 className="text-base font-bold text-ink">
          {frame ? 'Foto selecionada' : text ? 'Texto' : element ? 'Elemento' : 'Lâmina'}
        </h2>
        {photo && <Badge tone="brand">{photo.name}</Badge>}
      </div>

      {/* avisos do objeto selecionado */}
      {frameIssues.length > 0 && (
        <div className="space-y-2 px-5 pb-2">
          {frameIssues.map((issue) => (
            <div
              key={issue.id}
              className={`rounded-2xl border p-3.5 ${
                issue.level === 'bloqueador'
                  ? 'border-danger/25 bg-danger-soft'
                  : 'border-warning/25 bg-warning-soft'
              }`}
            >
              <p
                className={`text-[13px] font-semibold ${
                  issue.level === 'bloqueador' ? 'text-danger' : 'text-warning'
                }`}
              >
                {issue.title}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{issue.detail}</p>
              {issue.fix && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => onApplyFix(issue)}>
                    Corrigir
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {frame && (
        <>
          <Section title="Enquadramento">
            <ActionGrid
              actions={[
                {
                  label: 'Preencher',
                  icon: <Icon.Photos className="size-4" />,
                  onClick: () => onUpdateFrame(frame.id, { zoom: 110, offsetX: 0, offsetY: 0 }),
                },
                {
                  label: 'Encaixar',
                  icon: <Icon.Elements className="size-4" />,
                  onClick: () => onUpdateFrame(frame.id, { zoom: 100, offsetX: 0, offsetY: 0 }),
                },
                {
                  label: 'Girar',
                  icon: <Icon.ArrowUpRight className="size-4" />,
                  onClick: () =>
                    onUpdateFrame(frame.id, { rotation: (frame.rotation + 90) % 360 }),
                },
                {
                  label: 'Centralizar',
                  icon: <Icon.Check className="size-4" />,
                  onClick: () => onUpdateFrame(frame.id, { offsetX: 0, offsetY: 0 }),
                },
              ]}
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <NumberField
                label="Zoom"
                value={frame.zoom}
                suffix="%"
                min={100}
                max={300}
                onChange={(zoom) => onUpdateFrame(frame.id, { zoom })}
              />
              <NumberField
                label="Rotação"
                value={frame.rotation}
                suffix="°"
                min={0}
                max={359}
                onChange={(rotation) => onUpdateFrame(frame.id, { rotation })}
              />
            </div>

            {photo && (
              <p className="mt-2.5 text-[11px] text-ink-faint">
                Arquivo de {photo.width} × {photo.height} px. Arraste sobre a foto
                para reposicionar o recorte.
              </p>
            )}
          </Section>

          <Section title="Ajustes">
            <Slider
              label="Brilho"
              value={frame.brightness}
              min={-50}
              max={50}
              onChange={(brightness) => onUpdateFrame(frame.id, { brightness })}
            />
            <Slider
              label="Contraste"
              value={frame.contrast}
              min={-50}
              max={50}
              onChange={(contrast) => onUpdateFrame(frame.id, { contrast })}
            />
            <Slider
              label="Saturação"
              value={frame.saturation}
              min={-100}
              max={100}
              onChange={(saturation) => onUpdateFrame(frame.id, { saturation })}
            />

            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl bg-subtle px-3.5 py-2.5">
              <span className="text-[12px] font-medium text-ink">Preto e branco</span>
              <input
                type="checkbox"
                checked={frame.grayscale}
                onChange={(event) =>
                  onUpdateFrame(frame.id, { grayscale: event.target.checked })
                }
                className="size-4 rounded accent-primary"
              />
            </label>

            {(frame.brightness || frame.contrast || frame.saturation || frame.grayscale) && (
              <Button
                size="sm"
                variant="ghost"
                block
                className="mt-2"
                onClick={() =>
                  onUpdateFrame(frame.id, {
                    brightness: 0,
                    contrast: 0,
                    saturation: 0,
                    grayscale: false,
                  })
                }
              >
                Restaurar original
              </Button>
            )}
          </Section>

          <Section title="Quadro">
            <Button size="sm" variant="danger" block onClick={onRemove}>
              <Icon.Trash className="size-4" />
              {frame.photoId ? 'Tirar a foto do quadro' : 'Excluir quadro'}
            </Button>
          </Section>
        </>
      )}

      {text && (
        <>
          <Section title="Conteúdo">
            <textarea
              value={text.text}
              onChange={(event) => onUpdateText(text.id, { text: event.target.value })}
              rows={3}
              aria-label="Texto"
              className="w-full resize-none rounded-xl border border-line bg-subtle p-3 text-[13px] text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
          </Section>

          <Section title="Tipografia">
            <Slider
              label="Tamanho"
              value={text.size}
              min={2}
              max={16}
              onChange={(size) => onUpdateText(text.id, { size })}
            />
            <Slider
              label="Peso"
              value={text.weight}
              min={300}
              max={800}
              onChange={(weight) => onUpdateText(text.id, { weight })}
            />
            <Slider
              label="Entrelinha"
              value={Math.round(text.lineHeight * 100)}
              min={90}
              max={200}
              suffix="%"
              onChange={(value) => onUpdateText(text.id, { lineHeight: value / 100 })}
            />

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdateText(text.id, { align })}
                  aria-label={`Alinhar à ${align === 'left' ? 'esquerda' : align === 'center' ? 'centro' : 'direita'}`}
                  className={`h-9 rounded-xl border text-[11px] font-medium transition ${
                    text.align === align
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink-soft hover:border-primary'
                  }`}
                >
                  {align === 'left' ? 'Esq.' : align === 'center' ? 'Centro' : 'Dir.'}
                </button>
              ))}
            </div>

            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl bg-subtle px-3.5 py-2.5">
              <span className="text-[12px] font-medium text-ink">Caixa alta</span>
              <input
                type="checkbox"
                checked={text.uppercase}
                onChange={(event) => onUpdateText(text.id, { uppercase: event.target.checked })}
                className="size-4 rounded accent-primary"
              />
            </label>
          </Section>

          <Section title="Cor">
            <div className="flex flex-wrap gap-2">
              {['#0b1220', '#46536a', '#ffffff', '#2563eb', '#06b6d4', '#7c3aed'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onUpdateText(text.id, { color })}
                  aria-label={`Cor ${color}`}
                  className={`size-8 rounded-full border-2 transition ${
                    text.color === color ? 'border-ink' : 'border-line hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Button size="sm" variant="danger" block className="mt-4" onClick={onRemove}>
              <Icon.Trash className="size-4" />
              Excluir texto
            </Button>
          </Section>
        </>
      )}

      {element && (
        <>
          <Section title="Aparência">
            <div className="mb-3 flex flex-wrap gap-2">
              {['#2563eb', '#06b6d4', '#7c3aed', '#0b1220', '#8593a8', '#ffffff'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onUpdateElement(element.id, { color })}
                  aria-label={`Cor ${color}`}
                  className={`size-8 rounded-full border-2 transition ${
                    element.color === color ? 'border-ink' : 'border-line hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Slider
              label="Tamanho"
              value={Math.round(element.w)}
              min={4}
              max={60}
              suffix="%"
              onChange={(w) => onUpdateElement(element.id, { w })}
            />
            <Slider
              label="Rotação"
              value={element.rotation}
              min={0}
              max={359}
              suffix="°"
              onChange={(rotation) => onUpdateElement(element.id, { rotation })}
            />
            <Slider
              label="Opacidade"
              value={element.opacity}
              min={10}
              max={100}
              suffix="%"
              onChange={(opacity) => onUpdateElement(element.id, { opacity })}
            />

            <Button size="sm" variant="danger" block className="mt-4" onClick={onRemove}>
              <Icon.Trash className="size-4" />
              Excluir elemento
            </Button>
          </Section>
        </>
      )}

      <Section title="Espaçamento da lâmina">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Horizontal"
            value={spread.gapH}
            suffix="mm"
            min={0}
            max={30}
            onChange={(gapH) => onUpdateSpread({ gapH })}
          />
          <NumberField
            label="Vertical"
            value={spread.gapV}
            suffix="mm"
            min={0}
            max={30}
            onChange={(gapV) => onUpdateSpread({ gapV })}
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          block
          className="mt-2.5"
          onClick={() => onUpdateSpread({ gapH: 4, gapV: 4 })}
        >
          Restaurar recomendado
        </Button>
      </Section>

      {!selection && (
        <Section title="Lâmina">
          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-subtle px-3.5 py-2.5">
            <span className="text-[12px] font-medium text-ink">Marcar como aprovada</span>
            <input
              type="checkbox"
              checked={spread.approved}
              onChange={(event) => onUpdateSpread({ approved: event.target.checked })}
              className="size-4 rounded accent-primary"
            />
          </label>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
            Selecione uma foto, um texto ou um elemento na lâmina para editar suas
            propriedades aqui.
          </p>
        </Section>
      )}
    </div>
  )
}
