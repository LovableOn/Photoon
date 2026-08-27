import { useState } from 'react'
import { LAYOUTS, layoutsFor, type Layout } from '../../lib/layouts'
import type { Spread } from '../../lib/editorTypes'

/**
 * Barra de layouts, sempre à vista sobre a lâmina.
 *
 * Trocar o arranjo é a decisão que mais se repete ao montar um álbum, então
 * ela não fica atrás de uma aba: os arranjos aparecem em miniatura logo acima
 * do canvas e um clique aplica na lâmina aberta.
 *
 * A barra abre já filtrada pela quantidade de fotos que a lâmina tem — que é
 * quase sempre o que a pessoa quer — com os demais a um clique.
 */
export function LayoutBar({
  spread,
  onApply,
}: {
  spread: Spread
  onApply: (layout: Layout) => void
}) {
  const comFoto = spread.frames.filter((frame) => frame.photoId).length
  const [filtro, setFiltro] = useState<number | 'todos'>('auto' as never)

  // "auto" segue a lâmina; assim que a pessoa escolhe um filtro, ele manda.
  const quantidade = filtro === ('auto' as never) ? Math.max(1, Math.min(6, comFoto || 2)) : filtro
  const visiveis = quantidade === 'todos' ? LAYOUTS : layoutsFor(quantidade as number)

  const atual = LAYOUTS.find(
    (layout) =>
      layout.cells.length === spread.frames.length &&
      layout.cells.every(
        (cell, index) =>
          Math.abs(cell.x - spread.frames[index].x) < 0.6 &&
          Math.abs(cell.y - spread.frames[index].y) < 0.6,
      ),
  )

  return (
    <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-2.5">
      <span className="shrink-0 text-[11px] font-bold tracking-[0.08em] text-ink-faint uppercase">
        Layouts
      </span>

      {/* filtro por quantidade de fotos */}
      <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-subtle p-0.5">
        {([1, 2, 3, 4, 5, 6, 'todos'] as const).map((item) => {
          const ativo = filtro === item || (filtro === ('auto' as never) && item === quantidade)
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFiltro(item)}
              aria-pressed={ativo}
              title={item === 'todos' ? 'Todos os layouts' : `${item} foto${item > 1 ? 's' : ''}`}
              className={`h-7 min-w-7 rounded-full px-2 text-[11px] font-semibold transition ${
                ativo ? 'bg-ink text-white' : 'text-ink-faint hover:bg-white hover:text-ink'
              }`}
            >
              {item === 'todos' ? 'Todos' : item}
            </button>
          )
        })}
      </div>

      <span className="h-6 w-px shrink-0 bg-line" role="presentation" />

      {/* miniaturas: um clique troca o arranjo da lâmina aberta */}
      <div className="scrollbar-thin flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5">
        {visiveis.map((layout) => {
          const ativo = atual?.id === layout.id
          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => onApply(layout)}
              title={`${layout.name} · ${layout.count} foto${layout.count > 1 ? 's' : ''}`}
              aria-label={`Aplicar layout ${layout.name}`}
              aria-pressed={ativo}
              className={`relative h-11 w-[86px] shrink-0 overflow-hidden rounded-lg border-2 bg-subtle transition hover:-translate-y-0.5 ${
                ativo ? 'border-primary' : 'border-line hover:border-primary/50'
              }`}
            >
              <span className="absolute inset-y-0 left-1/2 w-px bg-ink/10" />
              {layout.cells.map((cell, index) => (
                <span
                  key={index}
                  className={`absolute rounded-[2px] transition ${
                    ativo ? 'bg-primary/60' : 'bg-primary/30'
                  }`}
                  style={{
                    left: `${cell.x + 1}%`,
                    top: `${cell.y + 2}%`,
                    width: `${cell.w - 2}%`,
                    height: `${cell.h - 4}%`,
                  }}
                />
              ))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
