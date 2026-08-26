import { makeFrame, makeSpread, makeText, type Spread } from './editorTypes'

/**
 * Layouts de lâmina.
 *
 * As células ladrilham a área útil sem folga entre elas — quem cria o respiro
 * é o controle de espaçamento, aplicado como recuo no momento de desenhar.
 * Assim o mesmo layout serve para um álbum apertado ou arejado.
 *
 * O vinco fica em x = 50. Nenhuma célula o atravessa, exceto os layouts de
 * página inteira, que sangram de propósito.
 */

export type LayoutStyle = 'clean' | 'editorial' | 'assimetrico' | 'destaque' | 'mosaico'

interface Cell {
  x: number
  y: number
  w: number
  h: number
}

export interface Layout {
  id: string
  name: string
  count: number
  style: LayoutStyle
  withText: boolean
  cells: Cell[]
}

// Área útil: margem de 5% nas laterais e 8% em cima e embaixo.
const M_X = 5
const M_Y = 8
const W = 100 - M_X * 2
const H = 100 - M_Y * 2

const col2 = [M_X, 50]
const col2w = 45
const col3 = [M_X, 35, 65]
const col3w = 30
const row2 = [M_Y, 50]
const row2h = 42
const row3 = [M_Y, 36, 64]
const row3h = 28

export const LAYOUTS: Layout[] = [
  /* ---------------------------------------------------------------- 1 foto */
  // "Centralizada" vem primeiro porque é o que a sugestão automática escolhe:
  // sangrar na lâmina inteira joga o centro da foto no vinco, e isso vira
  // aviso na revisão. Página inteira continua disponível a um clique.
  {
    id: 'one-center',
    name: 'Centralizada',
    count: 1,
    style: 'clean',
    withText: false,
    cells: [{ x: 18, y: M_Y, w: 64, h: H }],
  },
  {
    id: 'full-bleed',
    name: 'Página inteira',
    count: 1,
    style: 'destaque',
    withText: false,
    cells: [{ x: 0, y: 0, w: 100, h: 100 }],
  },
  {
    id: 'one-left-text',
    name: 'Foto e texto',
    count: 1,
    style: 'editorial',
    withText: true,
    cells: [{ x: M_X, y: M_Y, w: 45, h: H }],
  },

  /* --------------------------------------------------------------- 2 fotos */
  {
    id: 'two-cols',
    name: 'Lado a lado',
    count: 2,
    style: 'clean',
    withText: false,
    cells: [
      { x: col2[0], y: M_Y, w: col2w, h: H },
      { x: col2[1], y: M_Y, w: col2w, h: H },
    ],
  },
  {
    id: 'two-rows',
    name: 'Empilhadas',
    count: 2,
    style: 'clean',
    withText: false,
    cells: [
      { x: M_X, y: row2[0], w: W, h: row2h },
      { x: M_X, y: row2[1], w: W, h: row2h },
    ],
  },
  {
    id: 'two-asym',
    name: 'Destaque e apoio',
    count: 2,
    style: 'assimetrico',
    withText: false,
    cells: [
      { x: M_X, y: M_Y, w: 45, h: H },
      { x: 50, y: 22, w: 45, h: 56 },
    ],
  },

  /* --------------------------------------------------------------- 3 fotos */
  {
    id: 'three-hero',
    name: 'Uma grande, duas menores',
    count: 3,
    style: 'destaque',
    withText: false,
    cells: [
      { x: M_X, y: M_Y, w: 45, h: H },
      { x: 50, y: row2[0], w: 45, h: row2h },
      { x: 50, y: row2[1], w: 45, h: row2h },
    ],
  },
  {
    id: 'three-cols',
    name: 'Três colunas',
    count: 3,
    style: 'editorial',
    withText: false,
    cells: col3.map((x) => ({ x, y: M_Y, w: col3w, h: H })),
  },
  {
    id: 'three-band',
    name: 'Faixa central',
    count: 3,
    style: 'editorial',
    withText: true,
    cells: col3.map((x) => ({ x, y: 24, w: col3w, h: 44 })),
  },

  /* --------------------------------------------------------------- 4 fotos */
  {
    id: 'four-grid',
    name: 'Grade 2 × 2',
    count: 4,
    style: 'clean',
    withText: false,
    cells: row2.flatMap((y) => col2.map((x) => ({ x, y, w: col2w, h: row2h }))),
  },
  {
    id: 'four-mosaic',
    name: 'Mosaico',
    count: 4,
    style: 'mosaico',
    withText: false,
    cells: [
      { x: M_X, y: M_Y, w: 45, h: H },
      { x: 50, y: M_Y, w: 45, h: 34 },
      { x: 50, y: 42, w: 22.5, h: 50 },
      { x: 72.5, y: 42, w: 22.5, h: 50 },
    ],
  },

  /* --------------------------------------------------------------- 5 fotos */
  {
    id: 'five-mix',
    name: 'Destaque e tira',
    count: 5,
    style: 'mosaico',
    withText: false,
    cells: [
      { x: M_X, y: M_Y, w: W, h: 50 },
      ...Array.from({ length: 4 }, (_, index) => ({
        x: M_X + index * 22.5,
        y: 58,
        w: 22.5,
        h: 34,
      })),
    ],
  },

  /* --------------------------------------------------------------- 6 fotos */
  {
    id: 'six-grid',
    name: 'Grade 3 × 2',
    count: 6,
    style: 'clean',
    withText: false,
    cells: row2.flatMap((y) => col3.map((x) => ({ x, y, w: col3w, h: row2h }))),
  },
  {
    id: 'six-tall',
    name: 'Grade 2 × 3',
    count: 6,
    style: 'mosaico',
    withText: false,
    cells: row3.flatMap((y) => col2.map((x) => ({ x, y, w: col2w, h: row3h }))),
  },
]

export function layoutsFor(count: number): Layout[] {
  return LAYOUTS.filter((layout) => layout.count === count)
}

/**
 * Aplica um layout à lâmina, preservando as fotos já usadas na ordem em que
 * estavam. Fotos que sobram (layout menor) são devolvidas para quem chamou
 * decidir o que fazer.
 */
export function applyLayout(
  spread: Spread,
  layout: Layout,
): { spread: Spread; dropped: string[] } {
  const photos = spread.frames.map((frame) => frame.photoId).filter(Boolean) as string[]
  const previous = spread.frames

  const frames = layout.cells.map((cell, index) => {
    const source = previous[index]
    return makeFrame({
      ...cell,
      photoId: photos[index] ?? null,
      // Mantém os ajustes de quem já ocupava a posição.
      zoom: source?.zoom ?? 100,
      offsetX: source?.offsetX ?? 0,
      offsetY: source?.offsetY ?? 0,
      brightness: source?.brightness ?? 0,
      contrast: source?.contrast ?? 0,
      saturation: source?.saturation ?? 0,
      grayscale: source?.grayscale ?? false,
    })
  })

  const texts =
    layout.withText && spread.texts.length === 0
      ? [makeText({ x: 55, y: 44, w: 35, text: 'Escreva aqui', align: 'left' })]
      : spread.texts

  return {
    spread: { ...spread, frames, texts },
    dropped: photos.slice(layout.cells.length),
  }
}

/** Melhor layout para uma quantidade de fotos, quando a IA monta a lâmina. */
export function suggestLayout(count: number): Layout {
  const exact = layoutsFor(count)
  if (exact.length) return exact[0]
  const capped = Math.max(1, Math.min(6, count))
  return layoutsFor(capped)[0] ?? LAYOUTS[0]
}

/**
 * Monta as lâminas iniciais de um álbum: capa mais as lâminas internas, com as
 * fotos escolhidas distribuídas por igual. Usado ao abrir pela primeira vez um
 * projeto criado antes do editor existir.
 */
export function buildSpreads(
  pages: number,
  photoIds: string[],
  coverPhotoId: string | null,
): Spread[] {
  const cover = makeSpread({
    kind: 'cover',
    frames: [makeFrame({ x: 0, y: 0, w: 100, h: 100, photoId: coverPhotoId })],
    texts: [],
  })

  const count = Math.max(1, Math.ceil(pages / 2))
  const inner = photoIds.filter((photoId) => photoId !== coverPhotoId)
  const perSpread = Math.max(1, Math.min(6, Math.ceil(inner.length / count) || 1))

  const spreads: Spread[] = []
  let cursor = 0

  for (let index = 0; index < count; index += 1) {
    const slice = inner.slice(cursor, cursor + perSpread)
    cursor += slice.length

    const layout = suggestLayout(slice.length || 2)
    spreads.push(
      makeSpread({
        frames: layout.cells.map((cell, cellIndex) =>
          makeFrame({ ...cell, photoId: slice[cellIndex] ?? null }),
        ),
      }),
    )
  }

  return [cover, ...spreads]
}
