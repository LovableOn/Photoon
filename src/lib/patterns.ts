/**
 * Texturas de fundo.
 *
 * Cada textura é um ladrilho SVG desenhado aqui e entregue como data URI no
 * `background` da lâmina. Duas consequências práticas:
 *
 * - **Recolorível**: a cor do fundo e a do traço entram como parâmetro, então
 *   a mesma textura serve a qualquer paleta.
 * - **Proporcional à lâmina**: o tamanho vem em porcentagem (`repeatsX`), não
 *   em pixels. A miniatura do storyboard, o canvas em 200% e a prévia mostram
 *   exatamente o mesmo desenho.
 *
 * São padrões originais, desenhados para este projeto.
 */

export interface Pattern {
  id: string
  name: string
  category: 'Corações' | 'Matelassê' | 'Arabescos' | 'Geométricos' | 'Delicados'
  /** Quantas vezes o ladrilho se repete na largura da lâmina. */
  repeatsX: number
  /** Corpo do SVG. `{ink}` recebe a cor do traço. */
  tile: (ink: string) => string
  /** Proporção do ladrilho (largura / altura). Quadrado quando ausente. */
  ratio?: number
}

const CORACAO = (x: number, y: number, s: number, ink: string, opacity = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6.2C0 6.2-5.2 2.6-5.2-1.1A2.9 2.9 0 0 1 0-2.6a2.9 2.9 0 0 1 5.2 1.5C5.2 2.6 0 6.2 0 6.2Z" fill="${ink}" opacity="${opacity}"/>`

const CORACAO_VAZADO = (x: number, y: number, s: number, ink: string) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6.2C0 6.2-5.2 2.6-5.2-1.1A2.9 2.9 0 0 1 0-2.6a2.9 2.9 0 0 1 5.2 1.5C5.2 2.6 0 6.2 0 6.2Z" fill="none" stroke="${ink}" stroke-width="1.4"/>`

const BRILHO = (x: number, y: number, s: number, ink: string, opacity = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0-7C1 -2 2 -1 7 0 2 1 1 2 0 7-1 2-2 1-7 0-2-1-1-2 0-7Z" fill="${ink}" opacity="${opacity}"/>`

export const PATTERNS: Pattern[] = [
  /* ------------------------------------------------------------ Corações */
  {
    id: 'coracoes-espalhados',
    name: 'Corações espalhados',
    category: 'Corações',
    repeatsX: 9,
    tile: (ink) =>
      `${CORACAO(25, 22, 1.5, ink)}${CORACAO(75, 34, 1.1, ink, 0.75)}${CORACAO(50, 62, 1.4, ink)}${CORACAO(12, 82, 1, ink, 0.7)}${CORACAO(88, 80, 1.25, ink, 0.85)}`,
  },
  {
    id: 'coracoes-mini',
    name: 'Corações miúdos',
    category: 'Corações',
    repeatsX: 18,
    tile: (ink) =>
      `${CORACAO(25, 25, 0.95, ink)}${CORACAO(75, 75, 0.95, ink)}`,
  },
  {
    id: 'coracoes-vazados',
    name: 'Corações vazados',
    category: 'Corações',
    repeatsX: 11,
    tile: (ink) =>
      `${CORACAO_VAZADO(28, 28, 1.5, ink)}${CORACAO_VAZADO(72, 72, 1.5, ink)}`,
  },
  {
    id: 'linha-coracao',
    name: 'Linha com coração',
    category: 'Corações',
    repeatsX: 5,
    ratio: 2,
    tile: (ink) =>
      `<path d="M0 62 C 30 62, 40 40, 62 40 S 92 58, 120 58 S 170 40, 200 40" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.85"/>${CORACAO_VAZADO(62, 30, 1.5, ink)}${CORACAO_VAZADO(150, 30, 1.1, ink)}`,
  },

  /* ----------------------------------------------------------- Matelassê */
  {
    id: 'matelasse-coracao',
    name: 'Matelassê com coração',
    category: 'Matelassê',
    repeatsX: 8,
    tile: (ink) =>
      `<path d="M0 0 100 100M100 0 0 100" stroke="${ink}" stroke-width="1.4" stroke-dasharray="5 6" opacity="0.9"/>${CORACAO(50, 46, 1.5, ink)}${CORACAO(0, -4, 1.5, ink)}${CORACAO(100, -4, 1.5, ink)}${CORACAO(0, 96, 1.5, ink)}${CORACAO(100, 96, 1.5, ink)}`,
  },
  {
    id: 'matelasse',
    name: 'Matelassê',
    category: 'Matelassê',
    repeatsX: 8,
    tile: (ink) =>
      `<path d="M0 0 100 100M100 0 0 100" stroke="${ink}" stroke-width="1.6" stroke-dasharray="7 7" opacity="0.9"/>`,
  },
  {
    id: 'matelasse-brilho',
    name: 'Matelassê com brilho',
    category: 'Matelassê',
    repeatsX: 7,
    tile: (ink) =>
      `<path d="M0 0 100 100M100 0 0 100" stroke="${ink}" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.85"/>${BRILHO(50, 50, 1.9, ink)}${BRILHO(0, 0, 1.9, ink)}${BRILHO(100, 0, 1.9, ink)}${BRILHO(0, 100, 1.9, ink)}${BRILHO(100, 100, 1.9, ink)}`,
  },
  {
    id: 'losango',
    name: 'Losangos',
    category: 'Matelassê',
    repeatsX: 10,
    tile: (ink) =>
      `<path d="M50 8 92 50 50 92 8 50Z" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.9"/>`,
  },

  /* ---------------------------------------------------------- Arabescos */
  {
    id: 'arabesco',
    name: 'Arabesco',
    category: 'Arabescos',
    repeatsX: 6,
    tile: (ink) =>
      `<g fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" opacity="0.9">
        <path d="M50 6c-16 0-26 12-26 24 0 10 7 17 16 17 8 0 14-6 14-13 0-6-4-10-9-10-4 0-7 3-7 6"/>
        <path d="M50 94c16 0 26-12 26-24 0-10-7-17-16-17-8 0-14 6-14 13 0 6 4 10 9 10 4 0 7-3 7-6"/>
        <path d="M6 50c0 16 12 26 24 26"/><path d="M94 50c0-16-12-26-24-26"/>
      </g>`,
  },
  {
    id: 'arabesco-duplo',
    name: 'Arabesco duplo',
    category: 'Arabescos',
    repeatsX: 5,
    tile: (ink) =>
      `<g fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round" opacity="0.85">
        <path d="M20 80c0-24 14-40 30-40s26 12 26 24c0 9-6 15-14 15-6 0-11-4-11-10 0-5 3-8 7-8"/>
        <path d="M80 20c0 24-14 40-30 40S24 48 24 36c0-9 6-15 14-15 6 0 11 4 11 10 0 5-3 8-7 8"/>
      </g>`,
  },
  {
    id: 'folhas',
    name: 'Folhas',
    category: 'Arabescos',
    repeatsX: 8,
    tile: (ink) =>
      `<g fill="${ink}" opacity="0.8">
        <path d="M28 18c14 0 22 9 22 22-14 0-22-9-22-22Z"/>
        <path d="M72 52c-14 0-22 9-22 22 14 0 22-9 22-22Z"/>
      </g><path d="M50 40v20" stroke="${ink}" stroke-width="1.6" opacity="0.6"/>`,
  },

  /* -------------------------------------------------------- Geométricos */
  {
    id: 'poa',
    name: 'Poá',
    category: 'Geométricos',
    repeatsX: 16,
    tile: (ink) =>
      `<circle cx="25" cy="25" r="9" fill="${ink}"/><circle cx="75" cy="75" r="9" fill="${ink}"/>`,
  },
  {
    id: 'poa-mini',
    name: 'Poá miúdo',
    category: 'Geométricos',
    repeatsX: 28,
    tile: (ink) => `<circle cx="50" cy="50" r="10" fill="${ink}"/>`,
  },
  {
    id: 'listras',
    name: 'Listras diagonais',
    category: 'Geométricos',
    repeatsX: 22,
    tile: (ink) =>
      `<path d="M-20 20 20 -20M0 100 100 0M80 120 120 80" stroke="${ink}" stroke-width="14" opacity="0.85"/>`,
  },
  {
    id: 'chevron',
    name: 'Chevron',
    category: 'Geométricos',
    repeatsX: 12,
    tile: (ink) =>
      `<path d="M0 70 50 30 100 70" fill="none" stroke="${ink}" stroke-width="9" opacity="0.85"/><path d="M0 20 50 -20 100 20" fill="none" stroke="${ink}" stroke-width="9" opacity="0.85"/>`,
  },
  {
    id: 'grade',
    name: 'Grade fina',
    category: 'Geométricos',
    repeatsX: 16,
    tile: (ink) =>
      `<path d="M0 0h100M0 0v100" stroke="${ink}" stroke-width="2" opacity="0.7"/>`,
  },

  /* ----------------------------------------------------------- Delicados */
  {
    id: 'brilhos',
    name: 'Brilhos',
    category: 'Delicados',
    repeatsX: 9,
    tile: (ink) =>
      `${BRILHO(30, 28, 2.4, ink)}${BRILHO(74, 58, 1.6, ink, 0.75)}${BRILHO(46, 84, 1.2, ink, 0.6)}`,
  },
  {
    id: 'estrelas',
    name: 'Estrelinhas',
    category: 'Delicados',
    repeatsX: 12,
    tile: (ink) =>
      `<path d="M30 12l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="${ink}"/><path d="M72 62l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="${ink}" opacity="0.7"/>`,
  },
  {
    id: 'florzinhas',
    name: 'Florzinhas',
    category: 'Delicados',
    repeatsX: 11,
    tile: (ink) =>
      `<g fill="${ink}">
        <g transform="translate(30 30)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="4.5" ry="8" transform="rotate(${a})"/>`).join('')}</g>
        <g transform="translate(74 74) scale(0.72)" opacity="0.75">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="4.5" ry="8" transform="rotate(${a})"/>`).join('')}</g>
      </g>`,
  },
  {
    id: 'confete',
    name: 'Confete',
    category: 'Delicados',
    repeatsX: 13,
    tile: (ink) =>
      `<g fill="${ink}">
        <rect x="18" y="14" width="5" height="13" rx="2.5" transform="rotate(24 20 20)"/>
        <rect x="66" y="40" width="5" height="13" rx="2.5" transform="rotate(-38 68 46)" opacity="0.8"/>
        <rect x="34" y="72" width="5" height="13" rx="2.5" transform="rotate(62 36 78)" opacity="0.65"/>
      </g>`,
  },

  /* ------------------------------------------------- Corações (segunda leva) */
  {
    id: 'coracoes-linha',
    name: 'Corações em fileira',
    category: 'Corações',
    repeatsX: 14,
    tile: (ink) => `${CORACAO(50, 42, 1.5, ink)}`,
  },
  {
    id: 'coracoes-alternados',
    name: 'Cheios e vazados',
    category: 'Corações',
    repeatsX: 10,
    tile: (ink) =>
      `${CORACAO(26, 26, 1.4, ink)}${CORACAO_VAZADO(74, 26, 1.4, ink)}${CORACAO_VAZADO(26, 74, 1.4, ink)}${CORACAO(74, 74, 1.4, ink)}`,
  },
  {
    id: 'coracoes-chuva',
    name: 'Chuva de corações',
    category: 'Corações',
    repeatsX: 7,
    tile: (ink) =>
      `${CORACAO(18, 16, 1.1, ink, 0.9)}${CORACAO(54, 30, 1.7, ink)}${CORACAO(84, 12, 0.9, ink, 0.6)}${CORACAO(32, 58, 1.3, ink, 0.8)}${CORACAO(70, 70, 1.5, ink)}${CORACAO(14, 88, 1, ink, 0.6)}${CORACAO(92, 52, 1.1, ink, 0.7)}`,
  },

  /* ------------------------------------------------ Matelassê (segunda leva) */
  {
    id: 'matelasse-flor',
    name: 'Matelassê com flor',
    category: 'Matelassê',
    repeatsX: 7,
    tile: (ink) =>
      `<path d="M0 0 100 100M100 0 0 100" stroke="${ink}" stroke-width="1.4" stroke-dasharray="5 7" opacity="0.85"/>
       <g fill="${ink}">
         <g transform="translate(50 50) scale(0.5)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-14" rx="6" ry="12" transform="rotate(${a})"/>`).join('')}</g>
       </g>`,
  },
  {
    id: 'losango-duplo',
    name: 'Losango duplo',
    category: 'Matelassê',
    repeatsX: 8,
    tile: (ink) =>
      `<path d="M50 6 94 50 50 94 6 50Z" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.9"/>
       <path d="M50 24 76 50 50 76 24 50Z" fill="none" stroke="${ink}" stroke-width="1.3" opacity="0.55"/>`,
  },
  {
    id: 'matelasse-poa',
    name: 'Matelassê com poá',
    category: 'Matelassê',
    repeatsX: 9,
    tile: (ink) =>
      `<path d="M0 0 100 100M100 0 0 100" stroke="${ink}" stroke-width="1.4" stroke-dasharray="4 8" opacity="0.8"/>
       <circle cx="50" cy="50" r="7" fill="${ink}"/>
       <circle cx="0" cy="0" r="7" fill="${ink}"/><circle cx="100" cy="0" r="7" fill="${ink}"/>
       <circle cx="0" cy="100" r="7" fill="${ink}"/><circle cx="100" cy="100" r="7" fill="${ink}"/>`,
  },

  /* ------------------------------------------------ Arabescos (segunda leva) */
  {
    id: 'damasco',
    name: 'Damasco',
    category: 'Arabescos',
    repeatsX: 6,
    tile: (ink) =>
      `<g fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" opacity="0.9">
        <path d="M50 10c-14 10-20 24-20 36 0 12 9 20 20 20s20-8 20-20c0-12-6-26-20-36Z"/>
        <path d="M50 66v24"/>
        <path d="M30 78c8 0 14 5 20 12 6-7 12-12 20-12"/>
      </g>`,
  },
  {
    id: 'trevo',
    name: 'Trevo',
    category: 'Arabescos',
    repeatsX: 9,
    tile: (ink) =>
      `<g fill="none" stroke="${ink}" stroke-width="2.4" opacity="0.85">
        <path d="M50 20a15 15 0 0 1 0 30 15 15 0 0 1 0-30ZM20 50a15 15 0 0 1 30 0 15 15 0 0 1-30 0ZM50 50a15 15 0 0 1 30 0 15 15 0 0 1-30 0ZM50 50a15 15 0 0 1 0 30 15 15 0 0 1 0-30Z"/>
      </g>`,
  },
  {
    id: 'ondas',
    name: 'Ondas',
    category: 'Arabescos',
    repeatsX: 8,
    tile: (ink) =>
      `<g fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" opacity="0.85">
        <path d="M0 30c12-16 25-16 37 0s25 16 37 0 18-9 26-4"/>
        <path d="M0 70c12-16 25-16 37 0s25 16 37 0 18-9 26-4"/>
      </g>`,
  },

  /* ----------------------------------------------- Geométricos (segunda leva) */
  {
    id: 'escamas',
    name: 'Escamas',
    category: 'Geométricos',
    repeatsX: 11,
    tile: (ink) =>
      `<g fill="none" stroke="${ink}" stroke-width="2.4" opacity="0.85">
        <path d="M0 50a25 25 0 0 1 50 0 25 25 0 0 1 50 0"/>
        <path d="M-50 100a25 25 0 0 1 50 0 25 25 0 0 1 50 0 25 25 0 0 1 50 0"/>
        <path d="M-50 0a25 25 0 0 1 50 0 25 25 0 0 1 50 0 25 25 0 0 1 50 0"/>
      </g>`,
  },
  {
    id: 'triangulos',
    name: 'Triângulos',
    category: 'Geométricos',
    repeatsX: 12,
    tile: (ink) =>
      `<path d="M50 16 84 76H16Z" fill="${ink}" opacity="0.85"/>`,
  },
  {
    id: 'cruzetas',
    name: 'Cruzetas',
    category: 'Geométricos',
    repeatsX: 15,
    tile: (ink) =>
      `<path d="M50 30v40M30 50h40" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`,
  },
  {
    id: 'favo',
    name: 'Favo',
    category: 'Geométricos',
    repeatsX: 9,
    ratio: 1.16,
    tile: (ink) =>
      `<path d="M25 4 50 18v28L25 60 0 46V18ZM75 4l25 14v28L75 60 50 46V18Z" fill="none" stroke="${ink}" stroke-width="2.4" opacity="0.85"/>`,
  },

  /* ------------------------------------------------- Delicados (segunda leva) */
  {
    id: 'penas',
    name: 'Peninhas',
    category: 'Delicados',
    repeatsX: 10,
    tile: (ink) =>
      `<g stroke="${ink}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85">
        <path d="M34 74C34 52 42 34 54 24"/>
        <path d="M40 60c-8-2-12-8-12-16M44 48c-8-2-12-8-12-16M50 36c-6-2-9-6-9-13"/>
      </g>`,
  },
  {
    id: 'ramos-delicados',
    name: 'Raminhos',
    category: 'Delicados',
    repeatsX: 8,
    tile: (ink) =>
      `<g fill="${ink}" opacity="0.8">
        <path d="M50 84V30" stroke="${ink}" stroke-width="2" fill="none"/>
        <ellipse cx="38" cy="44" rx="4" ry="8" transform="rotate(-35 38 44)"/>
        <ellipse cx="62" cy="44" rx="4" ry="8" transform="rotate(35 62 44)"/>
        <ellipse cx="38" cy="62" rx="4" ry="8" transform="rotate(-35 38 62)"/>
        <ellipse cx="62" cy="62" rx="4" ry="8" transform="rotate(35 62 62)"/>
      </g>`,
  },
  {
    id: 'gotas',
    name: 'Gotas',
    category: 'Delicados',
    repeatsX: 13,
    tile: (ink) =>
      `<path d="M50 22c10 14 16 22 16 30a16 16 0 0 1-32 0c0-8 6-16 16-30Z" fill="${ink}" opacity="0.85"/>`,
  },
  {
    id: 'aneis',
    name: 'Argolinhas',
    category: 'Delicados',
    repeatsX: 12,
    tile: (ink) =>
      `<circle cx="30" cy="30" r="14" fill="none" stroke="${ink}" stroke-width="2.4"/>
       <circle cx="70" cy="70" r="14" fill="none" stroke="${ink}" stroke-width="2.4" opacity="0.65"/>`,
  },
]

export const PATTERN_CATEGORIES = [
  'Corações',
  'Matelassê',
  'Arabescos',
  'Geométricos',
  'Delicados',
] as const

/**
 * Monta o `background` CSS da textura.
 *
 * O tamanho sai em porcentagem da largura do elemento, então o padrão
 * acompanha a lâmina em qualquer zoom em vez de ficar preso a pixels.
 */
export function patternCss(pattern: Pattern, background: string, ink: string): string {
  const largura = 100
  const altura = pattern.ratio ? Math.round(100 / pattern.ratio) : 100

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}">` +
    pattern.tile(ink) +
    '</svg>'

  const tamanho = 100 / pattern.repeatsX

  return `${background} url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / ${tamanho}% auto repeat`
}

/** Textura usada num preview pequeno, com menos repetições para o desenho aparecer. */
export function patternPreviewCss(pattern: Pattern, background: string, ink: string): string {
  return patternCss({ ...pattern, repeatsX: Math.max(2, Math.round(pattern.repeatsX / 3)) }, background, ink)
}
