/**
 * Modelo das lâminas do álbum.
 *
 * Todas as posições são percentuais da lâmina (0–100), então o mesmo conteúdo
 * serve para o canvas em qualquer zoom, para a miniatura do storyboard e para
 * a prévia, sem recalcular nada.
 */

export interface Frame {
  id: string
  x: number
  y: number
  w: number
  h: number
  photoId: string | null
  /** 100 = a foto preenche o quadro. Acima disso, recorta. */
  zoom: number
  /** Deslocamento do recorte, em % do quadro. */
  offsetX: number
  offsetY: number
  rotation: number
  brightness: number
  contrast: number
  saturation: number
  grayscale: boolean
}

export interface TextBox {
  id: string
  x: number
  y: number
  w: number
  text: string
  /** Tamanho em % da altura da lâmina, para escalar junto com o zoom. */
  size: number
  weight: number
  align: 'left' | 'center' | 'right'
  color: string
  uppercase: boolean
  letterSpacing: number
  lineHeight: number
}

export interface ElementItem {
  id: string
  x: number
  y: number
  /** Largura em % da lâmina; a altura acompanha (viewBox quadrado). */
  w: number
  elementId: string
  color: string
  rotation: number
  opacity: number
}

export interface Spread {
  id: string
  kind: 'cover' | 'spread'
  frames: Frame[]
  texts: TextBox[]
  elements: ElementItem[]
  /** CSS de fundo (cor ou gradiente); `null` = branco. */
  background: string | null
  gapH: number
  gapV: number
  approved: boolean
  locked: boolean
}

export type SelectionKind = 'frame' | 'text' | 'element'

export interface Selection {
  kind: SelectionKind
  id: string
}

/* -------------------------------------------------------------- fábricas */

let counter = 0
function id(prefix: string) {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

export function makeFrame(partial: Partial<Frame> = {}): Frame {
  return {
    id: id('frm'),
    x: 10,
    y: 10,
    w: 30,
    h: 40,
    photoId: null,
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    grayscale: false,
    ...partial,
  }
}

export function makeText(partial: Partial<TextBox> = {}): TextBox {
  return {
    id: id('txt'),
    x: 34,
    y: 45,
    w: 32,
    text: 'Seu texto aqui',
    size: 7,
    weight: 600,
    align: 'center',
    color: '#0b1220',
    uppercase: false,
    letterSpacing: 0,
    lineHeight: 1.25,
    ...partial,
  }
}

export function makeElement(partial: Partial<ElementItem> = {}): ElementItem {
  return {
    id: id('elm'),
    x: 44,
    y: 40,
    w: 12,
    elementId: 'shape-circle',
    color: '#2563eb',
    rotation: 0,
    opacity: 100,
    ...partial,
  }
}

export function makeSpread(partial: Partial<Spread> = {}): Spread {
  return {
    id: id('spr'),
    kind: 'spread',
    frames: [],
    texts: [],
    elements: [],
    background: null,
    gapH: 4,
    gapV: 4,
    approved: false,
    locked: false,
    ...partial,
  }
}

/* ---------------------------------------------------------------- ajudas */

/** Proporção da lâmina aberta (duas páginas lado a lado) a partir do formato. */
export function spreadAspect(format: string): number {
  const match = format.match(/(\d+)\s*[×x]\s*(\d+)/)
  if (!match) return 2
  const width = Number(match[1])
  const height = Number(match[2])
  if (!width || !height) return 2
  return (width * 2) / height
}

/** Proporção de uma página única, usada na capa e na prévia por página. */
export function pageAspect(format: string): number {
  const match = format.match(/(\d+)\s*[×x]\s*(\d+)/)
  if (!match) return 1
  return Number(match[1]) / Number(match[2]) || 1
}

export function cssFilter(frame: Frame): string {
  const parts = [
    `brightness(${1 + frame.brightness / 100})`,
    `contrast(${1 + frame.contrast / 100})`,
    `saturate(${1 + frame.saturation / 100})`,
  ]
  if (frame.grayscale) parts.push('grayscale(1)')
  return parts.join(' ')
}

/** Quadros obrigatórios ainda sem foto — o erro que trava a finalização. */
export function emptyFrames(spread: Spread): Frame[] {
  return spread.frames.filter((frame) => !frame.photoId)
}

export function spreadHasContent(spread: Spread): boolean {
  return (
    spread.frames.some((frame) => frame.photoId) ||
    spread.texts.length > 0 ||
    spread.elements.length > 0
  )
}
