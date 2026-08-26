/**
 * Assinatura perceptual de imagem, calculada no navegador.
 *
 * A assinatura junta duas leituras da mesma foto:
 *
 * 1. **Estrutura** — a imagem reduzida a 12×12 em tons de cinza, normalizada
 *    pela média. Guarda o desenho da cena (onde está claro e onde está
 *    escuro) sem depender do brilho geral.
 * 2. **Cor** — uma grade 4×4 com a cor média de cada célula. Guarda a
 *    paleta e onde ela está no quadro.
 *
 * Serve para achar fotos parecidas: mesma cena, mesma sequência, mesma luz.
 * **Não é reconhecimento facial** — não identifica pessoas. Para isso seria
 * preciso um modelo de detecção e um vetor de rosto, que rodam no servidor.
 */

const ESTRUTURA = 12
const COR = 4

export const SIGNATURE_LENGTH = ESTRUTURA * ESTRUTURA + COR * COR * 3

/** Pesa a estrutura acima da cor: cena parecida importa mais que tom parecido. */
const PESO_ESTRUTURA = 1
const PESO_COR = 0.65

function drawToCanvas(image: HTMLImageElement, size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  // Estica para o quadrado de propósito: a comparação fica indiferente ao
  // formato, então uma vertical e uma horizontal da mesma cena se aproximam.
  ctx.drawImage(image, 0, 0, size, size)
  return ctx.getImageData(0, 0, size, size).data
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    image.src = url
  })
}

export async function computeSignature(source: Blob): Promise<number[]> {
  const url = URL.createObjectURL(source)
  try {
    const image = await loadImage(url)

    const estrutura: number[] = []
    const pixelsEstrutura = drawToCanvas(image, ESTRUTURA)
    if (pixelsEstrutura) {
      for (let i = 0; i < pixelsEstrutura.length; i += 4) {
        const luz =
          pixelsEstrutura[i] * 0.299 +
          pixelsEstrutura[i + 1] * 0.587 +
          pixelsEstrutura[i + 2] * 0.114
        estrutura.push(luz / 255)
      }
      // normaliza pela média: tira o efeito de foto mais clara ou mais escura
      const media = estrutura.reduce((soma, valor) => soma + valor, 0) / estrutura.length
      for (let i = 0; i < estrutura.length; i += 1) estrutura[i] -= media
    }

    const cor: number[] = []
    const pixelsCor = drawToCanvas(image, COR)
    if (pixelsCor) {
      for (let i = 0; i < pixelsCor.length; i += 4) {
        cor.push(pixelsCor[i] / 255, pixelsCor[i + 1] / 255, pixelsCor[i + 2] / 255)
      }
    }

    return [...estrutura, ...cor]
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Distância entre duas assinaturas. Quanto menor, mais parecidas. */
export function signatureDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return Infinity

  const corte = ESTRUTURA * ESTRUTURA
  let somaEstrutura = 0
  let somaCor = 0

  for (let i = 0; i < corte; i += 1) {
    const diferenca = a[i] - b[i]
    somaEstrutura += diferenca * diferenca
  }
  for (let i = corte; i < a.length; i += 1) {
    const diferenca = a[i] - b[i]
    somaCor += diferenca * diferenca
  }

  return (
    PESO_ESTRUTURA * Math.sqrt(somaEstrutura / corte) +
    PESO_COR * Math.sqrt(somaCor / (a.length - corte))
  )
}

/**
 * Converte a distância numa afinidade de 0 a 100, para mostrar na interface.
 * A escala vem da faixa que as distâncias ocupam na prática nesta assinatura.
 */
export function similarityScore(distance: number): number {
  if (!Number.isFinite(distance)) return 0
  return Math.max(0, Math.min(100, Math.round((1 - distance / 0.45) * 100)))
}
