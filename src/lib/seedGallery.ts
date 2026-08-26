/**
 * Galeria de exemplo da loja.
 *
 * As imagens são **geradas no navegador**, não baixadas: o ambiente onde este
 * projeto foi montado bloqueia bancos de imagem, então cada foto é desenhada
 * num canvas a partir de uma paleta e de uma semente. São marcadores de
 * lugar com cara de galeria de casamento — luz, tom e enquadramento variados —
 * e não fotografias reais.
 *
 * Vantagem prática: nada de imagem entra no bundle, e cada foto vira um Blob
 * de verdade em alta resolução, indistinguível de um upload para todo o resto
 * do sistema (miniatura, orientação, cálculo de DPI, recorte).
 *
 * Para trocar por fotos reais, veja `scripts/seed-fotos.md`.
 */

export interface SeedSpec {
  name: string
  /** Momento do casamento — vira etiqueta e ajuda a filtrar. */
  moment: string
  palette: [string, string, string]
  width: number
  height: number
  seed: number
  favorite?: boolean
}

const MAKING_OF: [string, string, string] = ['#f6efe6', '#e8d9c5', '#c9ae8e']
const CERIMONIA: [string, string, string] = ['#eef1f6', '#d8dfe9', '#9aa8bd']
const FOLHAGEM: [string, string, string] = ['#e9efe4', '#c7d6bd', '#7d9670']
const HORA_DOURADA: [string, string, string] = ['#fbeeda', '#f0cf9a', '#c98f4a']
const FESTA: [string, string, string] = ['#efe6f3', '#d6c3e2', '#8f6fae']
const HORA_AZUL: [string, string, string] = ['#e4e9f2', '#b9c6dc', '#5d719a']
const RETRATO: [string, string, string] = ['#f3ece7', '#dcc9bd', '#a8846f']
const DETALHES: [string, string, string] = ['#f7f3ee', '#e5dad0', '#b9a494']

// Resolução de cobertura real reduzida ao suficiente: o lado maior em 1400 px
// dá cerca de 180 DPI numa página de 20 cm, então os avisos de resolução da
// revisão aparecem quando devem, sem custar segundos para desenhar.
const V = { width: 950, height: 1400 } // vertical
const H = { width: 1400, height: 950 } // horizontal
const Q = { width: 1200, height: 1200 } // quadrada
const P = { width: 1700, height: 750 } // panorâmica

/**
 * 42 fotos, nomeadas como um fotógrafo nomearia, com a mistura de orientações
 * que uma cobertura real costuma ter (mais verticais que horizontais).
 */
export const SEED_GALLERY: SeedSpec[] = [
  { name: 'IMG_0104_making-of', moment: 'Making of', palette: MAKING_OF, ...V, seed: 104 },
  { name: 'IMG_0112_making-of', moment: 'Making of', palette: MAKING_OF, ...V, seed: 112, favorite: true },
  { name: 'IMG_0128_detalhes', moment: 'Detalhes', palette: DETALHES, ...Q, seed: 128 },
  { name: 'IMG_0133_detalhes', moment: 'Detalhes', palette: DETALHES, ...H, seed: 133 },
  { name: 'IMG_0147_making-of', moment: 'Making of', palette: MAKING_OF, ...H, seed: 147 },
  { name: 'IMG_0159_detalhes', moment: 'Detalhes', palette: DETALHES, ...V, seed: 159 },

  { name: 'IMG_0204_cerimonia', moment: 'Cerimônia', palette: CERIMONIA, ...V, seed: 204 },
  { name: 'IMG_0211_cerimonia', moment: 'Cerimônia', palette: CERIMONIA, ...H, seed: 211, favorite: true },
  { name: 'IMG_0219_cerimonia', moment: 'Cerimônia', palette: CERIMONIA, ...V, seed: 219 },
  { name: 'IMG_0226_cerimonia', moment: 'Cerimônia', palette: CERIMONIA, ...P, seed: 226 },
  { name: 'IMG_0233_cerimonia', moment: 'Cerimônia', palette: CERIMONIA, ...V, seed: 233 },
  { name: 'IMG_0241_cerimonia', moment: 'Cerimônia', palette: CERIMONIA, ...H, seed: 241 },
  { name: 'IMG_0248_votos', moment: 'Cerimônia', palette: CERIMONIA, ...V, seed: 248, favorite: true },
  { name: 'IMG_0255_aliancas', moment: 'Cerimônia', palette: DETALHES, ...Q, seed: 255 },

  { name: 'IMG_0302_retratos', moment: 'Retratos', palette: RETRATO, ...V, seed: 302, favorite: true },
  { name: 'IMG_0309_retratos', moment: 'Retratos', palette: RETRATO, ...V, seed: 309 },
  { name: 'IMG_0316_retratos', moment: 'Retratos', palette: RETRATO, ...H, seed: 316 },
  { name: 'IMG_0324_retratos', moment: 'Retratos', palette: RETRATO, ...V, seed: 324 },
  { name: 'IMG_0331_casal', moment: 'Retratos', palette: HORA_DOURADA, ...V, seed: 331, favorite: true },
  { name: 'IMG_0338_casal', moment: 'Retratos', palette: HORA_DOURADA, ...H, seed: 338 },
  { name: 'IMG_0345_casal', moment: 'Retratos', palette: HORA_DOURADA, ...V, seed: 345 },
  { name: 'IMG_0352_familia', moment: 'Retratos', palette: FOLHAGEM, ...H, seed: 352 },
  { name: 'IMG_0359_familia', moment: 'Retratos', palette: FOLHAGEM, ...H, seed: 359 },
  { name: 'IMG_0366_padrinhos', moment: 'Retratos', palette: FOLHAGEM, ...P, seed: 366 },

  { name: 'IMG_0403_hora-dourada', moment: 'Hora dourada', palette: HORA_DOURADA, ...V, seed: 403, favorite: true },
  { name: 'IMG_0410_hora-dourada', moment: 'Hora dourada', palette: HORA_DOURADA, ...H, seed: 410 },
  { name: 'IMG_0417_hora-dourada', moment: 'Hora dourada', palette: HORA_DOURADA, ...V, seed: 417 },
  { name: 'IMG_0424_hora-dourada', moment: 'Hora dourada', palette: HORA_DOURADA, ...P, seed: 424 },
  { name: 'IMG_0431_hora-azul', moment: 'Hora azul', palette: HORA_AZUL, ...H, seed: 431 },
  { name: 'IMG_0438_hora-azul', moment: 'Hora azul', palette: HORA_AZUL, ...V, seed: 438 },

  { name: 'IMG_0505_festa', moment: 'Festa', palette: FESTA, ...H, seed: 505 },
  { name: 'IMG_0512_festa', moment: 'Festa', palette: FESTA, ...V, seed: 512 },
  { name: 'IMG_0519_festa', moment: 'Festa', palette: FESTA, ...H, seed: 519, favorite: true },
  { name: 'IMG_0526_danca', moment: 'Festa', palette: FESTA, ...V, seed: 526 },
  { name: 'IMG_0533_danca', moment: 'Festa', palette: FESTA, ...H, seed: 533 },
  { name: 'IMG_0540_bolo', moment: 'Festa', palette: DETALHES, ...Q, seed: 540 },
  { name: 'IMG_0547_brinde', moment: 'Festa', palette: HORA_DOURADA, ...V, seed: 547 },
  { name: 'IMG_0554_festa', moment: 'Festa', palette: FESTA, ...H, seed: 554 },
  { name: 'IMG_0561_festa', moment: 'Festa', palette: FESTA, ...P, seed: 561 },
  { name: 'IMG_0568_saida', moment: 'Festa', palette: HORA_AZUL, ...V, seed: 568 },
  { name: 'IMG_0575_saida', moment: 'Festa', palette: HORA_AZUL, ...H, seed: 575 },
  { name: 'IMG_0582_final', moment: 'Festa', palette: HORA_AZUL, ...Q, seed: 582 },
]

export const SEED_GALLERY_NAME = 'Casamento Ana e Pedro'
export const SEED_STORE_NAME = 'Estúdio Luz & Véu'

/* ------------------------------------------------------------- desenho */

/** Ladrilho de ruído, desenhado uma vez e reaproveitado por todas as fotos. */
let noiseTileCache: HTMLCanvasElement | null = null

function noiseTile(): HTMLCanvasElement {
  if (noiseTileCache) return noiseTileCache

  const tile = document.createElement('canvas')
  tile.width = 96
  tile.height = 96
  const ctx = tile.getContext('2d')
  if (ctx) {
    const dados = ctx.createImageData(96, 96)
    for (let i = 0; i < dados.data.length; i += 4) {
      const valor = 110 + Math.random() * 90
      dados.data[i] = valor
      dados.data[i + 1] = valor
      dados.data[i + 2] = valor
      dados.data[i + 3] = 255
    }
    ctx.putImageData(dados, 0, 0)
  }

  noiseTileCache = tile
  return tile
}

/** PRNG determinístico: a mesma semente sempre desenha a mesma foto. */
function rng(seed: number) {
  let state = seed * 9301 + 49297
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

/**
 * Desenha uma foto. A composição imita o que uma lente aberta produz: um
 * fundo em degradê, manchas de luz desfocadas, uma massa mais escura na base
 * (o assunto em contraluz), vinheta e grão fino.
 */
export function renderSeedPhoto(spec: SeedSpec): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = spec.width
  canvas.height = spec.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas indisponível.'))

  const random = rng(spec.seed)
  const [claro, medio, escuro] = spec.palette
  const { width, height } = spec

  // Fundo em duas faixas: o alto mais claro (a luz), a base mais fechada.
  // A separação é o que faz a miniatura ler como foto e não como mancha.
  const fundo = ctx.createLinearGradient(0, 0, width * 0.2, height)
  fundo.addColorStop(0, claro)
  fundo.addColorStop(0.42, medio)
  fundo.addColorStop(1, escuro)
  ctx.fillStyle = fundo
  ctx.fillRect(0, 0, width, height)

  // fonte de luz num dos cantos de cima
  const ladoDaLuz = random() > 0.5 ? 0.22 : 0.78
  const luz = ctx.createRadialGradient(
    width * ladoDaLuz,
    height * 0.14,
    0,
    width * ladoDaLuz,
    height * 0.14,
    Math.max(width, height) * 0.6,
  )
  luz.addColorStop(0, 'rgba(255,255,255,0.55)')
  luz.addColorStop(0.35, 'rgba(255,255,255,0.16)')
  luz.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = luz
  ctx.fillRect(0, 0, width, height)

  // manchas de luz desfocadas
  ctx.save()
  ctx.filter = `blur(${Math.round(width * 0.05)}px)`
  const bokeh = 5 + Math.floor(random() * 5)
  for (let i = 0; i < bokeh; i += 1) {
    const raio = width * (0.04 + random() * 0.13)
    const x = random() * width
    const y = random() * height * 0.7
    const brilho = ctx.createRadialGradient(x, y, 0, x, y, raio)
    brilho.addColorStop(0, `rgba(255,255,255,${0.3 + random() * 0.4})`)
    brilho.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = brilho
    ctx.beginPath()
    ctx.arc(x, y, raio, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // Silhueta do assunto em primeiro plano, desfocada: uma massa escura que
  // sobe da base e ancora a composição, como um casal em contraluz.
  ctx.save()
  ctx.filter = `blur(${Math.round(width * 0.05)}px)`
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  const centro = width * (0.34 + random() * 0.32)
  const larguraOmbros = width * (0.3 + random() * 0.2)
  const alturaCabeca = height * (0.44 + random() * 0.16)

  ctx.beginPath()
  ctx.ellipse(centro, alturaCabeca, larguraOmbros * 0.26, larguraOmbros * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(centro, height * 1.05, larguraOmbros, height * 0.5, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // vinheta forte, que é o que dá volume à imagem pequena
  const vinheta = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    Math.min(width, height) * 0.22,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7,
  )
  vinheta.addColorStop(0, 'rgba(0,0,0,0)')
  vinheta.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = vinheta
  ctx.fillRect(0, 0, width, height)

  // grão, pintado com um ladrilho repetido em vez de percorrer pixel a pixel:
  // varrer alguns milhões de pixels por foto custava mais de um segundo cada.
  const padrao = ctx.createPattern(noiseTile(), 'repeat')
  if (padrao) {
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.fillStyle = padrao
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a foto.'))),
      'image/jpeg',
      0.86,
    )
  })
}

const AVATAR_PALETAS: [string, string][] = [
  ['#f6efe6', '#b08d68'],
  ['#e9efe4', '#6f8a63'],
  ['#eef1f6', '#6b7f9e'],
  ['#f3ece7', '#a8756a'],
  ['#efe6f3', '#8266a3'],
  ['#fbeeda', '#c08a3e'],
]

/**
 * Retrato do cliente.
 *
 * No produto, a loja envia essa foto ao cadastrar o acesso. Aqui ela é
 * desenhada a partir do nome, para o painel já abrir com o rosto de quem
 * entrou em vez de um par de iniciais. Devolve um data URL pequeno, que cabe
 * no armazenamento local junto com o resto da sessão.
 */
export function makeAvatar(name: string): Promise<string | null> {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)

  const semente = [...name].reduce((soma, letra) => soma + letra.charCodeAt(0), 0)
  const random = rng(semente || 7)
  const [claro, escuro] = AVATAR_PALETAS[semente % AVATAR_PALETAS.length]

  const fundo = ctx.createLinearGradient(0, 0, 0, 320)
  fundo.addColorStop(0, claro)
  fundo.addColorStop(1, escuro)
  ctx.fillStyle = fundo
  ctx.fillRect(0, 0, 320, 320)

  ctx.save()
  ctx.filter = 'blur(26px)'
  for (let i = 0; i < 4; i += 1) {
    const raio = 40 + random() * 90
    const x = random() * 320
    const y = random() * 200
    const brilho = ctx.createRadialGradient(x, y, 0, x, y, raio)
    brilho.addColorStop(0, 'rgba(255,255,255,0.4)')
    brilho.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = brilho
    ctx.beginPath()
    ctx.arc(x, y, raio, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // silhueta de cabeça e ombros, desfocada como um retrato em contraluz
  ctx.save()
  ctx.filter = 'blur(14px)'
  ctx.fillStyle = `${escuro}cc`
  ctx.beginPath()
  ctx.arc(160, 146, 62, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(160, 330, 118, 108, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const vinheta = ctx.createRadialGradient(160, 160, 60, 160, 160, 230)
  vinheta.addColorStop(0, 'rgba(0,0,0,0)')
  vinheta.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = vinheta
  ctx.fillRect(0, 0, 320, 320)

  return Promise.resolve(canvas.toDataURL('image/jpeg', 0.82))
}
