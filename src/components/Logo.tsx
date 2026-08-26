import { useId } from 'react'
import { Link } from 'react-router-dom'

/**
 * Símbolo da marca: um centro ligado a seis nós.
 *
 * O desenho é o recorte de uma forma cheia por seis círculos — são eles que
 * apertam as hastes no meio do caminho e abrem as conchas côncavas onde cada
 * haste encontra o centro. Por isso vem numa máscara: as partes vazadas
 * precisam deixar o fundo passar, em vez de serem pintadas de branco, senão a
 * marca só funcionaria sobre fundo claro.
 */

const CENTRO = 20
const RAIO_CENTRO = 6.2
const DISTANCIA_NO = 13.6
const RAIO_NO = 4.6
const ESPESSURA_HASTE = 3.6
// Recorte perto do centro e pequeno: é o par de valores que abre a concha sem
// estrangular a haste. Mais longe ou maior, a haste rompe nos tamanhos pequenos.
const DISTANCIA_RECORTE = 6.8
const RAIO_RECORTE = 2.2

const ANGULOS_NO = [0, 60, 120, 180, 240, 300]
const ANGULOS_RECORTE = [30, 90, 150, 210, 270, 330]

function ponto(anguloGraus: number, distancia: number) {
  const rad = (anguloGraus * Math.PI) / 180
  return {
    x: CENTRO + distancia * Math.cos(rad),
    y: CENTRO + distancia * Math.sin(rad),
  }
}

export function LogoMark({ className = 'size-9' }: { className?: string }) {
  const id = useId()
  const mascara = `photoon-mark-${id.replace(/:/g, '')}`
  const degrade = `photoon-grad-${id.replace(/:/g, '')}`

  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Photoon">
      <defs>
        <linearGradient id={degrade} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-secondary)" />
        </linearGradient>

        <mask id={mascara}>
          <rect width="40" height="40" fill="black" />

          {/* corpo: centro, hastes e nós */}
          <g fill="white" stroke="white">
            <circle cx={CENTRO} cy={CENTRO} r={RAIO_CENTRO} />
            {ANGULOS_NO.map((angulo) => {
              const no = ponto(angulo, DISTANCIA_NO)
              return (
                <g key={angulo}>
                  <line
                    x1={CENTRO}
                    y1={CENTRO}
                    x2={no.x}
                    y2={no.y}
                    strokeWidth={ESPESSURA_HASTE}
                    strokeLinecap="round"
                  />
                  <circle cx={no.x} cy={no.y} r={RAIO_NO} stroke="none" />
                </g>
              )
            })}
          </g>

          {/* recortes que apertam as hastes e abrem as conchas */}
          <g fill="black">
            {ANGULOS_RECORTE.map((angulo) => {
              const centro = ponto(angulo, DISTANCIA_RECORTE)
              return (
                <circle key={angulo} cx={centro.x} cy={centro.y} r={RAIO_RECORTE} />
              )
            })}
          </g>

          {/* brilho do centro, vazado como no original */}
          <path
            d="M16.43 18.7A3.8 3.8 0 0 1 21.3 16.43"
            fill="none"
            stroke="black"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </mask>
      </defs>

      <rect width="40" height="40" fill={`url(#${degrade})`} mask={`url(#${mascara})`} />
    </svg>
  )
}

/**
 * Marca completa. O texto usa Plus Jakarta Sans — a mesma família do produto —
 * em peso 800 com entreletra fechada, que é o que dá cara de logotipo e não
 * de título comum.
 */
export function Logo({
  to = '/',
  className,
}: {
  to?: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 ${className ?? ''}`}
    >
      <LogoMark />
      <span className="font-sans text-[21px] leading-none font-extrabold tracking-[-0.035em] text-ink">
        Photoon
      </span>
    </Link>
  )
}
