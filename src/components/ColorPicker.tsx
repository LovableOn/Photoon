import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Seletor de cor: área de saturação e brilho para arrastar, faixa de matiz e
 * campo hexadecimal. Qualquer cor é alcançável — pelo arraste ou digitando o
 * código.
 */

const ATALHOS = [
  '#ffffff', '#f5f7fb', '#8593a8', '#46536a', '#0b1220',
  '#2563eb', '#06b6d4', '#7c3aed', '#e11d48', '#f59e0b',
  '#059669', '#f9a8d4', '#fbcfe8', '#c7d2fe', '#fde68a',
]

/* --------------------------------------------------------- conversões */

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x]
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const limpo = hex.replace('#', '')
  const completo =
    limpo.length === 3
      ? limpo.split('').map((c) => c + c).join('')
      : limpo
  if (!/^[0-9a-f]{6}$/i.test(completo)) return null

  const r = parseInt(completo.slice(0, 2), 16) / 255
  const g = parseInt(completo.slice(2, 4), 16) / 255
  const b = parseInt(completo.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }
  if (h < 0) h += 360

  return { h, s: max === 0 ? 0 : delta / max, v: max }
}

/* ------------------------------------------------------------ seletor */

export function ColorPicker({
  value,
  onChange,
  label = 'Cor',
}: {
  value: string
  onChange: (color: string) => void
  label?: string
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(value) ?? { h: 220, s: 0.8, v: 0.9 })
  const [texto, setTexto] = useState(value)
  const areaRef = useRef<HTMLDivElement | null>(null)
  const arrastando = useRef<'area' | 'matiz' | null>(null)

  // Cor vinda de fora (outro objeto selecionado) reposiciona os controles.
  useEffect(() => {
    const convertido = hexToHsv(value)
    if (convertido) setHsv(convertido)
    setTexto(value)
  }, [value])

  function emitir(next: { h: number; s: number; v: number }) {
    setHsv(next)
    const hex = rgbToHex(...(hsvToRgb(next.h, next.s, next.v) as [number, number, number]))
    setTexto(hex)
    onChange(hex)
  }

  function pontoDaArea(event: { clientX: number; clientY: number }) {
    const node = areaRef.current
    if (!node) return
    const bounds = node.getBoundingClientRect()
    const s = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    const v = 1 - Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
    emitir({ ...hsv, s, v })
  }

  function onPointerDownArea(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    arrastando.current = 'area'
    pontoDaArea(event)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (arrastando.current === 'area') pontoDaArea(event)
  }

  function aplicarTexto(bruto: string) {
    setTexto(bruto)
    const comCerquilha = bruto.startsWith('#') ? bruto : `#${bruto}`
    const convertido = hexToHsv(comCerquilha)
    if (convertido) {
      setHsv(convertido)
      onChange(
        comCerquilha.length === 4
          ? `#${comCerquilha.slice(1).split('').map((c) => c + c).join('')}`
          : comCerquilha.toLowerCase(),
      )
    }
  }

  const matizHex = rgbToHex(...(hsvToRgb(hsv.h, 1, 1) as [number, number, number]))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-soft">{label}</span>
        <span
          className="size-6 rounded-full border border-line"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
      </div>

      {/* área de saturação e brilho */}
      <div
        ref={areaRef}
        role="slider"
        tabIndex={0}
        aria-label="Saturação e brilho"
        aria-valuetext={value}
        onPointerDown={onPointerDownArea}
        onPointerMove={onPointerMove}
        onPointerUp={() => (arrastando.current = null)}
        onPointerCancel={() => (arrastando.current = null)}
        className="relative h-28 w-full cursor-crosshair touch-none rounded-xl border border-line"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${matizHex})`,
        }}
      >
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: value,
          }}
        />
      </div>

      {/* matiz */}
      <input
        type="range"
        min={0}
        max={359}
        value={Math.round(hsv.h)}
        onChange={(event) => emitir({ ...hsv, h: Number(event.target.value) })}
        aria-label="Matiz"
        className="mt-3 h-3 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background:
            'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        }}
      />

      {/* hexadecimal */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] font-semibold text-ink-faint">
            #
          </span>
          <input
            value={texto.replace('#', '')}
            onChange={(event) => aplicarTexto(event.target.value)}
            spellCheck={false}
            maxLength={6}
            aria-label="Código hexadecimal da cor"
            className="h-10 w-full rounded-xl border border-line bg-subtle pr-3 pl-7 font-mono text-[13px] tracking-wide text-ink uppercase focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>
        <input
          type="color"
          value={value}
          onChange={(event) => aplicarTexto(event.target.value)}
          aria-label="Escolher cor no seletor do sistema"
          title="Seletor do sistema"
          className="size-10 cursor-pointer rounded-xl border border-line bg-surface p-1"
        />
      </div>

      {/* atalhos */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ATALHOS.map((cor) => (
          <button
            key={cor}
            type="button"
            onClick={() => aplicarTexto(cor)}
            aria-label={`Usar a cor ${cor}`}
            title={cor}
            className={`size-6 rounded-lg border transition hover:scale-110 ${
              value.toLowerCase() === cor ? 'border-ink ring-2 ring-ink' : 'border-line'
            }`}
            style={{ backgroundColor: cor }}
          />
        ))}
      </div>
    </div>
  )
}
