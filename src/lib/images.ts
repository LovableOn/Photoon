export type Orientation = 'vertical' | 'horizontal' | 'quadrada' | 'panoramica'

export interface ProcessedImage {
  blob: Blob
  thumb: Blob
  width: number
  height: number
  orientation: Orientation
}

const THUMB_MAX = 480

export function orientationOf(width: number, height: number): Orientation {
  const ratio = width / height
  if (ratio > 1.9) return 'panoramica'
  if (ratio > 1.05) return 'horizontal'
  if (ratio < 0.95) return 'vertical'
  return 'quadrada'
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    image.src = src
  })
}

/**
 * Lê o arquivo, mede as dimensões reais e gera uma miniatura reduzida, para
 * que a grade não precise carregar os originais em tamanho cheio.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const { naturalWidth: width, naturalHeight: height } = image

    const scale = Math.min(1, THUMB_MAX / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Não foi possível processar a imagem.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const thumb = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error('Falha ao gerar miniatura.')),
        'image/jpeg',
        0.82,
      )
    })

    return {
      blob: file,
      thumb,
      width,
      height,
      orientation: orientationOf(width, height),
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
