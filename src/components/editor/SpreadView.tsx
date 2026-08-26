import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  cssFilter,
  type ElementItem,
  type Frame,
  type Selection,
  type Spread,
  type TextBox,
} from '../../lib/editorTypes'
import { BUILTIN_ELEMENTS } from '../../lib/builtinElements'

const BUILTIN_BY_ID = new Map(BUILTIN_ELEMENTS.map((element) => [element.id, element]))

interface Props {
  spread: Spread
  /** Recuo entre as células, em % da lâmina — o espaçamento do álbum. */
  gapX: number
  gapY: number
  thumbUrls: Record<string, string>
  elementUrls?: Record<string, string>
  /** Margem de corte, área segura e vinco central. */
  guides?: boolean
  interactive?: boolean
  selection?: Selection | null
  onSelect?: (selection: Selection | null) => void
  onChange?: (spread: Spread) => void
  onDropPhoto?: (frameId: string, photoId: string) => void
  onEditText?: (id: string) => void
  className?: string
}

type DragMode =
  | { type: 'move'; kind: Selection['kind']; id: string; startX: number; startY: number; originX: number; originY: number }
  | {
      type: 'resize'
      kind: Selection['kind']
      id: string
      handle: 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e'
      startX: number
      startY: number
      origin: { x: number; y: number; w: number; h: number }
    }
  | { type: 'pan'; id: string; startX: number; startY: number; originX: number; originY: number }

export function SpreadView({
  spread,
  gapX,
  gapY,
  thumbUrls,
  elementUrls = {},
  guides,
  interactive,
  selection,
  onSelect,
  onChange,
  onDropPhoto,
  onEditText,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [draft, setDraft] = useState<Spread | null>(null)
  const [drag, setDrag] = useState<DragMode | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    observer.observe(node)
    const bounds = node.getBoundingClientRect()
    setSize({ width: bounds.width, height: bounds.height })
    return () => observer.disconnect()
  }, [])

  const view = draft ?? spread

  /* ------------------------------------------------------------ arrastar */

  function begin(event: ReactPointerEvent, mode: DragMode) {
    if (!interactive || view.locked) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag(mode)
    setDraft(view)
  }

  function onPointerMove(event: ReactPointerEvent) {
    if (!drag || !draft || !size.width) return

    const dxPercent = ((event.clientX - drag.startX) / size.width) * 100
    const dyPercent = ((event.clientY - drag.startY) / size.height) * 100

    if (drag.type === 'move') {
      setDraft(moveObject(draft, drag.kind, drag.id, drag.originX + dxPercent, drag.originY + dyPercent))
      return
    }

    if (drag.type === 'pan') {
      setDraft(
        mapFrame(draft, drag.id, (frame) => ({
          ...frame,
          offsetX: clamp(drag.originX + dxPercent * 2, -100, 100),
          offsetY: clamp(drag.originY + dyPercent * 2, -100, 100),
        })),
      )
      return
    }

    setDraft(resizeObject(draft, drag, dxPercent, dyPercent))
  }

  function onPointerUp() {
    if (drag && draft) onChange?.(draft)
    setDrag(null)
    setDraft(null)
  }

  /* ------------------------------------------------------------ desenhar */

  const scaleY = size.height / 100
  const isSelected = (kind: Selection['kind'], id: string) =>
    interactive && selection?.kind === kind && selection.id === id

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-white select-none ${className}`}
      style={{ background: view.background ?? '#ffffff' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={() => interactive && onSelect?.(null)}
    >
      {/* quadros */}
      {view.frames.map((frame) => (
        <FrameView
          key={frame.id}
          frame={frame}
          gapX={gapX}
          gapY={gapY}
          url={frame.photoId ? thumbUrls[frame.photoId] : undefined}
          selected={isSelected('frame', frame.id)}
          interactive={interactive}
          isDropTarget={dropTarget === frame.id}
          onSelect={() => onSelect?.({ kind: 'frame', id: frame.id })}
          onBeginMove={(event) =>
            begin(event, {
              type: 'move',
              kind: 'frame',
              id: frame.id,
              startX: event.clientX,
              startY: event.clientY,
              originX: frame.x,
              originY: frame.y,
            })
          }
          onBeginPan={(event) =>
            begin(event, {
              type: 'pan',
              id: frame.id,
              startX: event.clientX,
              startY: event.clientY,
              originX: frame.offsetX,
              originY: frame.offsetY,
            })
          }
          onBeginResize={(event, handle) =>
            begin(event, {
              type: 'resize',
              kind: 'frame',
              id: frame.id,
              handle,
              startX: event.clientX,
              startY: event.clientY,
              origin: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
            })
          }
          onDragOver={(event) => {
            if (!interactive) return
            event.preventDefault()
            setDropTarget(frame.id)
          }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(event) => {
            event.preventDefault()
            setDropTarget(null)
            const photoId = event.dataTransfer.getData('text/photo-id')
            if (photoId) onDropPhoto?.(frame.id, photoId)
          }}
        />
      ))}

      {/* elementos */}
      {view.elements.map((element) => (
        <ElementView
          key={element.id}
          element={element}
          url={elementUrls[element.elementId]}
          selected={isSelected('element', element.id)}
          interactive={interactive}
          onSelect={() => onSelect?.({ kind: 'element', id: element.id })}
          onBeginMove={(event) =>
            begin(event, {
              type: 'move',
              kind: 'element',
              id: element.id,
              startX: event.clientX,
              startY: event.clientY,
              originX: element.x,
              originY: element.y,
            })
          }
          onBeginResize={(event, handle) =>
            begin(event, {
              type: 'resize',
              kind: 'element',
              id: element.id,
              handle,
              startX: event.clientX,
              startY: event.clientY,
              origin: { x: element.x, y: element.y, w: element.w, h: element.w },
            })
          }
        />
      ))}

      {/* textos */}
      {view.texts.map((text) => (
        <TextView
          key={text.id}
          text={text}
          scaleY={scaleY}
          selected={isSelected('text', text.id)}
          interactive={interactive}
          onSelect={() => onSelect?.({ kind: 'text', id: text.id })}
          onEdit={() => onEditText?.(text.id)}
          onBeginMove={(event) =>
            begin(event, {
              type: 'move',
              kind: 'text',
              id: text.id,
              startX: event.clientX,
              startY: event.clientY,
              originX: text.x,
              originY: text.y,
            })
          }
          onBeginResize={(event, handle) =>
            begin(event, {
              type: 'resize',
              kind: 'text',
              id: text.id,
              handle,
              startX: event.clientX,
              startY: event.clientY,
              origin: { x: text.x, y: text.y, w: text.w, h: 0 },
            })
          }
        />
      ))}

      {guides && <Guides fold={view.kind !== 'cover'} />}
    </div>
  )
}

/* -------------------------------------------------------------- auxiliares */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function mapFrame(spread: Spread, id: string, update: (frame: Frame) => Frame): Spread {
  return { ...spread, frames: spread.frames.map((frame) => (frame.id === id ? update(frame) : frame)) }
}

function moveObject(
  spread: Spread,
  kind: Selection['kind'],
  id: string,
  x: number,
  y: number,
): Spread {
  if (kind === 'frame') {
    return mapFrame(spread, id, (frame) => ({
      ...frame,
      x: clamp(x, -frame.w / 2, 100 - frame.w / 2),
      y: clamp(y, -frame.h / 2, 100 - frame.h / 2),
    }))
  }
  if (kind === 'text') {
    return {
      ...spread,
      texts: spread.texts.map((text) =>
        text.id === id ? { ...text, x: clamp(x, -text.w / 2, 100 - text.w / 2), y: clamp(y, 0, 96) } : text,
      ),
    }
  }
  return {
    ...spread,
    elements: spread.elements.map((element) =>
      element.id === id
        ? { ...element, x: clamp(x, -element.w / 2, 100 - element.w / 2), y: clamp(y, -20, 100) }
        : element,
    ),
  }
}

function resizeObject(
  spread: Spread,
  drag: Extract<DragMode, { type: 'resize' }>,
  dx: number,
  dy: number,
): Spread {
  const { origin, handle } = drag
  const MIN = 6

  const west = handle === 'nw' || handle === 'sw' || handle === 'w'
  const north = handle === 'nw' || handle === 'ne'

  let { x, y, w, h } = origin
  if (west) {
    w = Math.max(MIN, origin.w - dx)
    x = origin.x + (origin.w - w)
  } else {
    w = Math.max(MIN, origin.w + dx)
  }

  if (handle !== 'w' && handle !== 'e') {
    if (north) {
      h = Math.max(MIN, origin.h - dy)
      y = origin.y + (origin.h - h)
    } else {
      h = Math.max(MIN, origin.h + dy)
    }
  }

  if (drag.kind === 'frame') {
    return mapFrame(spread, drag.id, (frame) => ({ ...frame, x, y, w, h }))
  }
  if (drag.kind === 'text') {
    return {
      ...spread,
      texts: spread.texts.map((text) => (text.id === drag.id ? { ...text, x, w } : text)),
    }
  }
  return {
    ...spread,
    elements: spread.elements.map((element) =>
      element.id === drag.id ? { ...element, x, y, w } : element,
    ),
  }
}

/* ------------------------------------------------------------------ guias */

function Guides({ fold }: { fold: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* vinco central — a capa é uma página só, não tem dobra */}
      {fold && <div className="absolute inset-y-0 left-1/2 w-px bg-ink/12" />}
      {/* margem de corte */}
      <div className="absolute inset-[2%] border border-dashed border-warning/70" />
      {/* área segura */}
      <div className="absolute inset-[5%] border border-dashed border-primary/45" />
    </div>
  )
}

/* ----------------------------------------------------------------- quadro */

function FrameView({
  frame,
  gapX,
  gapY,
  url,
  selected,
  interactive,
  isDropTarget,
  onSelect,
  onBeginMove,
  onBeginPan,
  onBeginResize,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  frame: Frame
  gapX: number
  gapY: number
  url?: string
  selected?: boolean
  interactive?: boolean
  isDropTarget?: boolean
  onSelect: () => void
  onBeginMove: (event: ReactPointerEvent) => void
  onBeginPan: (event: ReactPointerEvent) => void
  onBeginResize: (event: ReactPointerEvent, handle: 'nw' | 'ne' | 'sw' | 'se') => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: React.DragEvent) => void
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${frame.x + gapX / 2}%`,
        top: `${frame.y + gapY / 2}%`,
        width: `${Math.max(0, frame.w - gapX)}%`,
        height: `${Math.max(0, frame.h - gapY)}%`,
        transform: frame.rotation ? `rotate(${frame.rotation}deg)` : undefined,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={`relative size-full overflow-hidden ${
          url ? '' : 'border border-dashed border-ink/20 bg-subtle'
        } ${isDropTarget ? 'ring-2 ring-primary' : ''} ${
          selected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={(event) => {
          if (!interactive) return
          event.stopPropagation()
          onSelect()
        }}
        onPointerDown={(event) => {
          if (!interactive || event.button !== 0) return
          onSelect()
          // Com a foto colocada, arrastar reposiciona o recorte; vazio, move o quadro.
          if (url) onBeginPan(event)
          else onBeginMove(event)
        }}
        style={{ cursor: interactive ? (url ? 'grab' : 'move') : undefined }}
      >
        {url ? (
          <img
            src={url}
            alt=""
            draggable={false}
            className="pointer-events-none size-full object-cover"
            style={{
              transform: `scale(${frame.zoom / 100}) translate(${frame.offsetX}%, ${frame.offsetY}%)`,
              filter: cssFilter(frame),
            }}
          />
        ) : interactive ? (
          // A instrução só faz sentido onde dá para arrastar. Em miniatura e
          // prévia o quadro vazio fica apenas vazio.
          <div className="flex size-full flex-col items-center justify-center gap-1.5 overflow-hidden text-ink-faint">
            <svg viewBox="0 0 24 24" fill="none" className="size-6 shrink-0" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 16 4.5-4 3 2.5L15 11l5 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] whitespace-nowrap">Arraste uma foto</span>
          </div>
        ) : null}
      </div>

      {selected && (
        <>
          <Handle position="nw" onPointerDown={(event) => onBeginResize(event, 'nw')} />
          <Handle position="ne" onPointerDown={(event) => onBeginResize(event, 'ne')} />
          <Handle position="sw" onPointerDown={(event) => onBeginResize(event, 'sw')} />
          <Handle position="se" onPointerDown={(event) => onBeginResize(event, 'se')} />
          {/* alça para mover o quadro sem mexer no recorte */}
          <button
            type="button"
            aria-label="Mover quadro"
            title="Mover quadro"
            onPointerDown={onBeginMove}
            className="absolute -top-3.5 left-1/2 flex size-7 -translate-x-1/2 cursor-move items-center justify-center rounded-full border border-primary bg-white text-primary shadow-float"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M3 12h18M12 3 9 6m3-3 3 3M12 21l-3-3m3 3 3-3M3 12l3-3m-3 3 3 3M21 12l-3-3m3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ texto */

function TextView({
  text,
  scaleY,
  selected,
  interactive,
  onSelect,
  onEdit,
  onBeginMove,
  onBeginResize,
}: {
  text: TextBox
  scaleY: number
  selected?: boolean
  interactive?: boolean
  onSelect: () => void
  onEdit: () => void
  onBeginMove: (event: ReactPointerEvent) => void
  onBeginResize: (event: ReactPointerEvent, handle: 'w' | 'e') => void
}) {
  return (
    <div
      className={`absolute ${selected ? 'ring-2 ring-primary' : ''}`}
      style={{ left: `${text.x}%`, top: `${text.y}%`, width: `${text.w}%` }}
      onClick={(event) => {
        if (!interactive) return
        event.stopPropagation()
        onSelect()
      }}
      onDoubleClick={() => interactive && onEdit()}
      onPointerDown={(event) => {
        if (!interactive || event.button !== 0) return
        onSelect()
        onBeginMove(event)
      }}
    >
      <p
        className="m-0 break-words whitespace-pre-wrap"
        style={{
          fontSize: `${Math.max(6, text.size * scaleY)}px`,
          fontWeight: text.weight,
          textAlign: text.align,
          color: text.color,
          textTransform: text.uppercase ? 'uppercase' : 'none',
          letterSpacing: `${text.letterSpacing}em`,
          lineHeight: text.lineHeight,
          cursor: interactive ? 'move' : undefined,
        }}
      >
        {text.text}
      </p>

      {selected && (
        <>
          <Handle position="w" onPointerDown={(event) => onBeginResize(event, 'w')} />
          <Handle position="e" onPointerDown={(event) => onBeginResize(event, 'e')} />
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- elemento */

function ElementView({
  element,
  url,
  selected,
  interactive,
  onSelect,
  onBeginMove,
  onBeginResize,
}: {
  element: ElementItem
  url?: string
  selected?: boolean
  interactive?: boolean
  onSelect: () => void
  onBeginMove: (event: ReactPointerEvent) => void
  onBeginResize: (event: ReactPointerEvent, handle: 'nw' | 'se') => void
}) {
  const builtin = BUILTIN_BY_ID.get(element.elementId)

  return (
    <div
      className={`absolute aspect-square ${selected ? 'ring-2 ring-primary' : ''}`}
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.w}%`,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        opacity: element.opacity / 100,
        color: element.color,
        cursor: interactive ? 'move' : undefined,
      }}
      onClick={(event) => {
        if (!interactive) return
        event.stopPropagation()
        onSelect()
      }}
      onPointerDown={(event) => {
        if (!interactive || event.button !== 0) return
        onSelect()
        onBeginMove(event)
      }}
    >
      {builtin ? (
        <svg
          viewBox="0 0 100 100"
          className="size-full"
          dangerouslySetInnerHTML={{ __html: builtin.svg }}
          aria-hidden="true"
        />
      ) : url ? (
        <img src={url} alt="" draggable={false} className="size-full object-contain" />
      ) : null}

      {selected && (
        <>
          <Handle position="nw" onPointerDown={(event) => onBeginResize(event, 'nw')} />
          <Handle position="se" onPointerDown={(event) => onBeginResize(event, 'se')} />
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ alças */

const HANDLE_POSITION = {
  nw: '-top-1.5 -left-1.5 cursor-nwse-resize',
  ne: '-top-1.5 -right-1.5 cursor-nesw-resize',
  sw: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
  se: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
  w: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize',
  e: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize',
}

function Handle({
  position,
  onPointerDown,
}: {
  position: keyof typeof HANDLE_POSITION
  onPointerDown: (event: ReactPointerEvent) => void
}) {
  return (
    <span
      role="presentation"
      onPointerDown={onPointerDown}
      className={`absolute size-3 rounded-full border-2 border-primary bg-white ${HANDLE_POSITION[position]}`}
    />
  )
}
