/**
 * Biblioteca curada de elementos.
 *
 * Todos usam viewBox 0 0 100 100 e `currentColor`, para que a cor seja
 * definida no momento da aplicação. A especificação pede curadoria moderna e
 * minimalista — nada de cliparts datados como padrão.
 */

export type ElementCategory =
  | 'Formas'
  | 'Linhas'
  | 'Molduras'
  | 'Ícones'
  | 'Selos'
  | 'Etiquetas'
  | 'Data e localização'

export interface BuiltinElement {
  id: string
  name: string
  category: ElementCategory
  tags: string[]
  svg: string
}

const S = 'stroke="currentColor" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"'
const F = 'fill="currentColor"'

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  'Formas',
  'Linhas',
  'Molduras',
  'Ícones',
  'Selos',
  'Etiquetas',
  'Data e localização',
]

export const BUILTIN_ELEMENTS: BuiltinElement[] = [
  // Formas
  {
    id: 'shape-circle',
    name: 'Círculo',
    category: 'Formas',
    tags: ['círculo', 'redondo', 'básico'],
    svg: `<circle cx="50" cy="50" r="34" ${F} />`,
  },
  {
    id: 'shape-circle-outline',
    name: 'Círculo vazado',
    category: 'Formas',
    tags: ['círculo', 'contorno'],
    svg: `<circle cx="50" cy="50" r="32" ${S} />`,
  },
  {
    id: 'shape-squircle',
    name: 'Quadrado suave',
    category: 'Formas',
    tags: ['quadrado', 'suave'],
    svg: `<rect x="18" y="18" width="64" height="64" rx="20" ${F} />`,
  },
  {
    id: 'shape-blob',
    name: 'Forma orgânica',
    category: 'Formas',
    tags: ['orgânico', 'blob', 'moderno'],
    svg: `<path d="M74 30c8 11 6 28-3 38s-27 15-38 8S16 50 20 38 38 18 50 17s16 2 24 13Z" ${F} />`,
  },
  {
    id: 'shape-arch',
    name: 'Arco',
    category: 'Formas',
    tags: ['arco', 'editorial'],
    svg: `<path d="M24 84V48a26 26 0 0 1 52 0v36Z" ${F} />`,
  },
  {
    id: 'shape-triangle',
    name: 'Triângulo',
    category: 'Formas',
    tags: ['triângulo'],
    svg: `<path d="M50 20 82 76H18Z" ${F} />`,
  },

  // Linhas
  {
    id: 'line-straight',
    name: 'Linha fina',
    category: 'Linhas',
    tags: ['linha', 'divisor'],
    svg: `<path d="M14 50h72" ${S} />`,
  },
  {
    id: 'line-double',
    name: 'Linha dupla',
    category: 'Linhas',
    tags: ['linha', 'divisor', 'editorial'],
    svg: `<path d="M14 42h72M14 58h72" ${S} />`,
  },
  {
    id: 'line-wave',
    name: 'Onda',
    category: 'Linhas',
    tags: ['onda', 'curva'],
    svg: `<path d="M14 50c9-14 18-14 27 0s18 14 27 0 12-9 18-4" ${S} />`,
  },
  {
    id: 'line-dotted',
    name: 'Pontilhado',
    category: 'Linhas',
    tags: ['pontilhado', 'divisor'],
    svg: `<path d="M14 50h72" ${S} stroke-dasharray="1 12" />`,
  },
  {
    id: 'line-corner',
    name: 'Canto',
    category: 'Linhas',
    tags: ['canto', 'moldura'],
    svg: `<path d="M20 44V20h24" ${S} />`,
  },

  // Molduras
  {
    id: 'frame-thin',
    name: 'Moldura fina',
    category: 'Molduras',
    tags: ['moldura', 'retângulo'],
    svg: `<rect x="16" y="16" width="68" height="68" rx="4" ${S} />`,
  },
  {
    id: 'frame-round',
    name: 'Moldura arredondada',
    category: 'Molduras',
    tags: ['moldura', 'suave'],
    svg: `<rect x="16" y="16" width="68" height="68" rx="18" ${S} />`,
  },
  {
    id: 'frame-arch',
    name: 'Moldura arco',
    category: 'Molduras',
    tags: ['moldura', 'arco', 'casamento'],
    svg: `<path d="M22 84V46a28 28 0 0 1 56 0v38Z" ${S} />`,
  },
  {
    id: 'frame-corners',
    name: 'Cantos',
    category: 'Molduras',
    tags: ['moldura', 'cantos', 'minimalista'],
    svg: `<path d="M20 38V20h18M62 20h18v18M80 62v18H62M38 80H20V62" ${S} />`,
  },
  {
    id: 'frame-circle',
    name: 'Moldura circular',
    category: 'Molduras',
    tags: ['moldura', 'círculo'],
    svg: `<circle cx="50" cy="50" r="33" ${S} />`,
  },

  // Ícones
  {
    id: 'icon-heart',
    name: 'Coração',
    category: 'Ícones',
    tags: ['coração', 'amor', 'casamento'],
    svg: `<path d="M50 80S20 62 20 42a16 16 0 0 1 30-8 16 16 0 0 1 30 8c0 20-30 38-30 38Z" ${S} />`,
  },
  {
    id: 'icon-star',
    name: 'Estrela',
    category: 'Ícones',
    tags: ['estrela', 'destaque'],
    svg: `<path d="m50 20 9 20 22 3-16 15 4 22-19-11-19 11 4-22-16-15 22-3Z" ${S} />`,
  },
  {
    id: 'icon-camera',
    name: 'Câmera',
    category: 'Ícones',
    tags: ['câmera', 'foto'],
    svg: `<rect x="16" y="30" width="68" height="46" rx="10" ${S} /><circle cx="50" cy="53" r="13" ${S} /><path d="M38 30l5-8h14l5 8" ${S} />`,
  },
  {
    id: 'icon-sparkle',
    name: 'Brilho',
    category: 'Ícones',
    tags: ['brilho', 'ia', 'moderno'],
    svg: `<path d="M50 18c3 16 8 21 24 24-16 3-21 8-24 24-3-16-8-21-24-24 16-3 21-8 24-24Z" ${S} /><path d="M76 62c1.5 7 3.5 9 10 10-6.5 1.5-8.5 3.5-10 10-1.5-6.5-3.5-8.5-10-10 6.5-1 8.5-3 10-10Z" ${S} />`,
  },
  {
    id: 'icon-ring',
    name: 'Aliança',
    category: 'Ícones',
    tags: ['aliança', 'casamento'],
    svg: `<circle cx="50" cy="58" r="22" ${S} /><path d="M40 34h20l-10 10Z" ${S} />`,
  },
  {
    id: 'icon-cap',
    name: 'Capelo',
    category: 'Ícones',
    tags: ['formatura', 'capelo'],
    svg: `<path d="M50 26 84 42 50 58 16 42Z" ${S} /><path d="M30 50v18c0 6 9 10 20 10s20-4 20-10V50" ${S} />`,
  },
  {
    id: 'icon-plane',
    name: 'Avião',
    category: 'Ícones',
    tags: ['viagem', 'avião'],
    svg: `<path d="M18 54l64-22-14 34-16-6-8 16-4-14Z" ${S} />`,
  },
  {
    id: 'icon-balloon',
    name: 'Balão',
    category: 'Ícones',
    tags: ['aniversário', 'festa'],
    svg: `<path d="M50 20a18 20 0 0 1 0 40 18 20 0 0 1 0-40Z" ${S} /><path d="M50 60v8m0 0c-4 4 4 8 0 12" ${S} />`,
  },

  // Selos
  {
    id: 'badge-circle',
    name: 'Selo redondo',
    category: 'Selos',
    tags: ['selo', 'carimbo'],
    svg: `<circle cx="50" cy="50" r="32" ${S} /><circle cx="50" cy="50" r="24" ${S} stroke-dasharray="2 8" />`,
  },
  {
    id: 'badge-scallop',
    name: 'Selo recortado',
    category: 'Selos',
    tags: ['selo', 'recorte'],
    svg: `<circle cx="50" cy="50" r="30" ${S} stroke-dasharray="6 5" /><circle cx="50" cy="50" r="20" ${F} />`,
  },
  {
    id: 'badge-ribbon',
    name: 'Fita',
    category: 'Selos',
    tags: ['fita', 'premiado'],
    svg: `<circle cx="50" cy="40" r="20" ${S} /><path d="M38 56 32 84l18-10 18 10-6-28" ${S} />`,
  },

  // Etiquetas
  {
    id: 'tag-pill',
    name: 'Etiqueta pílula',
    category: 'Etiquetas',
    tags: ['etiqueta', 'legenda'],
    svg: `<rect x="14" y="38" width="72" height="24" rx="12" ${S} />`,
  },
  {
    id: 'tag-rect',
    name: 'Etiqueta reta',
    category: 'Etiquetas',
    tags: ['etiqueta', 'legenda'],
    svg: `<rect x="14" y="38" width="72" height="24" rx="3" ${S} />`,
  },
  {
    id: 'tag-flag',
    name: 'Bandeira',
    category: 'Etiquetas',
    tags: ['etiqueta', 'bandeira'],
    svg: `<path d="M14 38h58l14 12-14 12H14Z" ${S} />`,
  },

  // Data e localização
  {
    id: 'meta-calendar',
    name: 'Data',
    category: 'Data e localização',
    tags: ['data', 'calendário'],
    svg: `<rect x="18" y="26" width="64" height="56" rx="8" ${S} /><path d="M18 44h64M34 18v14M66 18v14" ${S} />`,
  },
  {
    id: 'meta-pin',
    name: 'Localização',
    category: 'Data e localização',
    tags: ['local', 'localização', 'mapa'],
    svg: `<path d="M50 84S24 62 24 44a26 26 0 0 1 52 0c0 18-26 40-26 40Z" ${S} /><circle cx="50" cy="44" r="9" ${S} />`,
  },
  {
    id: 'meta-clock',
    name: 'Horário',
    category: 'Data e localização',
    tags: ['hora', 'relógio'],
    svg: `<circle cx="50" cy="50" r="32" ${S} /><path d="M50 30v22l14 8" ${S} />`,
  },
]
