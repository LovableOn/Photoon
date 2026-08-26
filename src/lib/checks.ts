import type { Selection, Spread } from './editorTypes'
import { spreadAspect } from './editorTypes'
import type { Photo } from './store'

/**
 * Verificações da lâmina.
 *
 * São todas calculadas a partir de dados reais: as dimensões do arquivo, o
 * tamanho físico do produto e a geometria dos quadros. Nada aqui é estimado
 * por aparência — não há detecção de rosto nesta versão, então o lugar do
 * aviso "rosto no corte" é ocupado por checagens que o sistema consegue provar:
 * resolução de impressão, quadro sobre o vinco e conteúdo fora da área segura.
 */

export type IssueLevel = 'bloqueador' | 'aviso'

export interface Issue {
  id: string
  level: IssueLevel
  title: string
  detail: string
  spreadId: string
  spreadIndex: number
  target?: Selection
  /** Correção que o sistema sabe aplicar sozinho. */
  fix?: 'preencher' | 'reenquadrar' | 'afastar-do-vinco' | 'trazer-para-area-segura'
}

const DPI_ERRO = 150
const DPI_AVISO = 200
const MM_POR_POLEGADA = 25.4

/** Largura física da lâmina aberta, em mm, a partir do formato do produto. */
export function spreadWidthMm(format: string): number {
  const match = format.match(/(\d+)\s*[×x]\s*(\d+)/)
  if (!match) return 400
  return Number(match[1]) * 2 * 10
}

/**
 * Resolução efetiva de um quadro, em DPI.
 *
 * O zoom recorta a foto: com 200%, metade da largura do arquivo cobre a mesma
 * área impressa, então a resolução efetiva cai pela metade.
 */
export function frameDpi(
  frameWidthPercent: number,
  zoom: number,
  photo: Photo,
  format: string,
): number {
  const larguraMm = (frameWidthPercent / 100) * spreadWidthMm(format)
  if (larguraMm <= 0) return Infinity
  const pixeisEfetivos = photo.width * (100 / Math.max(1, zoom))
  return pixeisEfetivos / (larguraMm / MM_POR_POLEGADA)
}

/** O quadro atravessa o vinco central da lâmina? */
export function crossesFold(x: number, w: number): boolean {
  const margem = 2
  return x + margem < 50 && x + w - margem > 50
}

export function outsideSafeArea(x: number, y: number, w: number, h: number): boolean {
  const SAFE = 5
  return x < SAFE || y < SAFE || x + w > 100 - SAFE || y + h > 100 - SAFE
}

export function checkSpread(
  spread: Spread,
  index: number,
  photos: Map<string, Photo>,
  format: string,
): Issue[] {
  const issues: Issue[] = []
  const vistas = new Set<string>()

  for (const frame of spread.frames) {
    if (!frame.photoId) {
      issues.push({
        id: `${spread.id}-${frame.id}-vazio`,
        level: 'bloqueador',
        title: 'Quadro sem foto',
        detail: 'Todo quadro do layout precisa de uma foto antes de finalizar.',
        spreadId: spread.id,
        spreadIndex: index,
        target: { kind: 'frame', id: frame.id },
        fix: 'preencher',
      })
      continue
    }

    const photo = photos.get(frame.photoId)
    if (!photo) continue

    if (vistas.has(frame.photoId)) {
      issues.push({
        id: `${spread.id}-${frame.id}-repetida`,
        level: 'aviso',
        title: 'Foto repetida na lâmina',
        detail: `"${photo.name}" aparece mais de uma vez nesta mesma lâmina.`,
        spreadId: spread.id,
        spreadIndex: index,
        target: { kind: 'frame', id: frame.id },
      })
    }
    vistas.add(frame.photoId)

    const dpi = frameDpi(frame.w, frame.zoom, photo, format)
    if (dpi < DPI_ERRO) {
      issues.push({
        id: `${spread.id}-${frame.id}-resolucao`,
        level: 'bloqueador',
        title: 'Resolução baixa para impressão',
        detail: `"${photo.name}" sairia com ${Math.round(dpi)} DPI neste tamanho. O mínimo é ${DPI_ERRO} DPI.`,
        spreadId: spread.id,
        spreadIndex: index,
        target: { kind: 'frame', id: frame.id },
        fix: 'reenquadrar',
      })
    } else if (dpi < DPI_AVISO) {
      issues.push({
        id: `${spread.id}-${frame.id}-resolucao-aviso`,
        level: 'aviso',
        title: 'Resolução no limite',
        detail: `"${photo.name}" sairia com ${Math.round(dpi)} DPI. O ideal é ${DPI_AVISO} DPI ou mais.`,
        spreadId: spread.id,
        spreadIndex: index,
        target: { kind: 'frame', id: frame.id },
        fix: 'reenquadrar',
      })
    }

    if (spread.kind === 'spread' && crossesFold(frame.x, frame.w)) {
      issues.push({
        id: `${spread.id}-${frame.id}-vinco`,
        level: 'aviso',
        title: 'Quadro sobre o vinco',
        detail: 'O centro da foto cai na dobra do álbum e some parcialmente na encadernação.',
        spreadId: spread.id,
        spreadIndex: index,
        target: { kind: 'frame', id: frame.id },
        fix: 'afastar-do-vinco',
      })
    }
  }

  for (const text of spread.texts) {
    const altura = text.size * 1.6
    if (outsideSafeArea(text.x, text.y, text.w, altura)) {
      issues.push({
        id: `${spread.id}-${text.id}-area-segura`,
        level: 'aviso',
        title: 'Texto fora da área segura',
        detail: 'Texto perto da borda pode ser cortado no acabamento.',
        spreadId: spread.id,
        spreadIndex: index,
        target: { kind: 'text', id: text.id },
        fix: 'trazer-para-area-segura',
      })
    }
  }

  return issues
}

export function checkAlbum(
  spreads: Spread[],
  photos: Map<string, Photo>,
  format: string,
): Issue[] {
  return spreads.flatMap((spread, index) => checkSpread(spread, index, photos, format))
}

/** Proporção da lâmina, reexportada para quem já importa deste módulo. */
export { spreadAspect }
