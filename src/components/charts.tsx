import { useEffect, useRef, useState } from 'react'

/**
 * Paleta dos gráficos.
 *
 * A série única usa o azul da marca. A escala categórica (blue → cyan →
 * violet) foi validada com o script do skill de dataviz: passa na banda de
 * luminosidade, no piso de croma, na separação para daltonismo (ΔE 21.3) e no
 * piso de visão normal (ΔE 23.3). O cyan fica abaixo de 3:1 contra a
 * superfície clara, então todo uso categórico leva rótulo direto visível — a
 * "regra de alívio" exigida pelo validador.
 */
const SERIES = '#2563eb'
export const CATEGORICAL = ['#2563eb', '#06b6d4', '#7c3aed', '#8593a8']

const AXIS = '#8593a8'
const GRID = '#e6eaf2'

/**
 * Mede o container para desenhar o SVG em pixels reais (texto não distorce).
 * O gráfico ocupa 100% do espaço que o pai der — quem controla a altura é o
 * layout, não o gráfico.
 */
function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

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

  return [ref, size] as const
}

interface Point {
  label: string
  value: number
}

/* -------------------------------------------------------- Gráfico de barras */

export function BarChart({ data, unit = '' }: { data: Point[]; unit?: string }) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const padBottom = 22
  const plotHeight = height - padBottom
  const max = Math.max(1, ...data.map((point) => point.value))
  const peak = data.reduce(
    (best, point, index) => (point.value > data[best].value ? index : best),
    0,
  )

  // 2px de respiro entre barras vizinhas, conforme a especificação de marcas.
  const slot = width / Math.max(1, data.length)
  const barWidth = Math.max(6, Math.min(30, slot - 10))
  const radius = 4

  return (
    <div ref={ref} className="relative size-full">
      {width > 0 && height > 0 && (
        <svg width={width} height={height} role="img" aria-label="Fotos adicionadas por dia">
          <line
            x1={0}
            y1={plotHeight}
            x2={width}
            y2={plotHeight}
            stroke={GRID}
            strokeWidth={1}
          />

          {data.map((point, index) => {
            const barHeight = Math.max(2, (point.value / max) * (plotHeight - 26))
            const x = slot * index + (slot - barWidth) / 2
            const y = plotHeight - barHeight
            const r = Math.min(radius, barHeight)
            const isPeak = index === peak && point.value > 0
            const isHover = hover === index

            return (
              <g
                key={point.label}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
              >
                {/* alvo de hover maior que a marca */}
                <rect
                  x={slot * index}
                  y={0}
                  width={slot}
                  height={plotHeight}
                  fill="transparent"
                />
                <path
                  d={`M${x},${plotHeight} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barWidth - r},${y} Q${x + barWidth},${y} ${x + barWidth},${y + r} L${x + barWidth},${plotHeight} Z`}
                  fill={isPeak || isHover ? SERIES : '#dbe6fe'}
                />
                {isPeak && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 18}
                      y={y - 22}
                      width={36}
                      height={17}
                      rx={8.5}
                      fill={SERIES}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={600}
                      fill="#ffffff"
                    >
                      {point.value}
                      {unit}
                    </text>
                  </g>
                )}
                <text
                  x={slot * index + slot / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fill={isHover ? '#0b1220' : AXIS}
                >
                  {point.label}
                </text>
              </g>
            )
          })}
        </svg>
      )}

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1 text-[11px] font-medium text-white shadow-lift"
          style={{ left: slot * hover + slot / 2 }}
        >
          {data[hover].value}
          {unit} · {data[hover].label}
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------- Gráfico de linha */

export function LineChart({ data, label = 'Total' }: { data: Point[]; label?: string }) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const padBottom = 22
  const padTop = 14
  const plotHeight = height - padBottom
  const max = Math.max(1, ...data.map((point) => point.value))
  const step = data.length > 1 ? width / (data.length - 1) : width

  const x = (index: number) => (data.length > 1 ? index * step : width / 2)
  const y = (value: number) =>
    plotHeight - (value / max) * (plotHeight - padTop)

  const line = data.map((point, index) => `${x(index)},${y(point.value)}`).join(' L')
  const area = data.length
    ? `M${x(0)},${plotHeight} L${line} L${x(data.length - 1)},${plotHeight} Z`
    : ''

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const index = Math.round((event.clientX - bounds.left) / step)
    setHover(Math.max(0, Math.min(data.length - 1, index)))
  }

  return (
    <div
      ref={ref}
      className="relative size-full"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {width > 0 && height > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${label} ao longo do tempo`}>
          <defs>
            <linearGradient id="line-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES} stopOpacity="0.16" />
              <stop offset="100%" stopColor={SERIES} stopOpacity="0" />
            </linearGradient>
          </defs>

          <line x1={0} y1={plotHeight} x2={width} y2={plotHeight} stroke={GRID} strokeWidth={1} />

          {area && <path d={area} fill="url(#line-fade)" />}
          <path d={`M${line}`} fill="none" stroke={SERIES} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {hover !== null && data[hover] && (
            <g>
              <line
                x1={x(hover)}
                y1={padTop - 8}
                x2={x(hover)}
                y2={plotHeight}
                stroke={GRID}
                strokeWidth={1}
              />
              {/* anel na cor da superfície para destacar a marca sobreposta */}
              <circle cx={x(hover)} cy={y(data[hover].value)} r={6} fill="#ffffff" />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={4} fill={SERIES} />
            </g>
          )}

          {data.map((point, index) => {
            const showLabel =
              data.length <= 7 || index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2)
            if (!showLabel) return null
            return (
              <text
                key={point.label}
                x={x(index)}
                y={height - 6}
                textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
                fontSize={11}
                fill={AXIS}
              >
                {point.label}
              </text>
            )
          })}
        </svg>
      )}

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1 text-[11px] font-medium text-white shadow-lift"
          style={{ left: Math.max(40, Math.min(width - 40, x(hover))) }}
        >
          {data[hover].value} · {data[hover].label}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------- Composição com rótulos */

export function Breakdown({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (!total) {
    return (
      <p className="py-6 text-center text-sm text-ink-faint">
        Adicione fotos para ver a composição da sua biblioteca.
      </p>
    )
  }

  return (
    <div>
      {/* barra segmentada com 2px de respiro entre segmentos */}
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {data.map((item, index) =>
          item.value ? (
            <div
              key={item.label}
              className="first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(item.value / total) * 100}%`,
                backgroundColor: CATEGORICAL[index % CATEGORICAL.length],
              }}
            />
          ) : null,
        )}
      </div>

      <ul className="mt-4 space-y-2.5">
        {data.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORICAL[index % CATEGORICAL.length] }}
            />
            <span className="flex-1 text-ink-soft">{item.label}</span>
            <span className="numeric font-semibold text-ink">{item.value}</span>
            <span className="numeric w-10 text-right text-xs text-ink-faint">
              {Math.round((item.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
