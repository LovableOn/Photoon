/**
 * Biblioteca de elementos.
 *
 * Todos usam viewBox 0 0 100 100 e `currentColor`, então a cor é escolhida no
 * momento de aplicar. A profundidade vem de opacidade, não de uma segunda cor:
 * assim o mesmo desenho funciona em qualquer paleta sem virar duas escolhas.
 *
 * São desenhos originais deste projeto, na linha decorativa de álbum — nada
 * copiado de biblioteca de terceiros.
 */

export type ElementCategory =
  | 'Corações'
  | 'Molduras'
  | 'Arabescos'
  | 'Florais'
  | 'Fitas'
  | 'Selos'
  | 'Formas'
  | 'Linhas'
  | 'Data e local'

export interface BuiltinElement {
  id: string
  name: string
  category: ElementCategory
  tags: string[]
  svg: string
}

const T = 'stroke="currentColor" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"'
const TF = 'stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
const F = 'fill="currentColor"'

const HEART_D =
  'M50 84C50 84 14 60 14 36A20 20 0 0 1 50 24a20 20 0 0 1 36 12c0 24-36 48-36 48Z'

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  'Corações',
  'Molduras',
  'Arabescos',
  'Florais',
  'Fitas',
  'Selos',
  'Formas',
  'Linhas',
  'Data e local',
]

export const BUILTIN_ELEMENTS: BuiltinElement[] = [
  /* ------------------------------------------------------------ Corações */
  {
    id: 'coracao-cheio',
    name: 'Coração',
    category: 'Corações',
    tags: ['coração', 'amor', 'casamento'],
    svg: `<path d="${HEART_D}" ${F} />`,
  },
  {
    id: 'coracao-contorno',
    name: 'Coração vazado',
    category: 'Corações',
    tags: ['coração', 'contorno'],
    svg: `<path d="${HEART_D}" ${T} />`,
  },
  {
    id: 'coracao-duplo',
    name: 'Corações entrelaçados',
    category: 'Corações',
    tags: ['coração', 'casal', 'dois'],
    svg: `<g transform="translate(-10 4) scale(0.72)"><path d="${HEART_D}" ${T} /></g><g transform="translate(38 4) scale(0.72)" opacity="0.55"><path d="${HEART_D}" ${T} /></g>`,
  },
  {
    id: 'coracao-rendado',
    name: 'Coração rendado',
    category: 'Corações',
    tags: ['coração', 'renda', 'delicado'],
    svg: `<path d="${HEART_D}" ${T} /><g transform="translate(12 10) scale(0.76)" opacity="0.5"><path d="${HEART_D}" ${TF} stroke-dasharray="4 5" /></g>`,
  },
  {
    id: 'coracao-florido',
    name: 'Coração florido',
    category: 'Corações',
    tags: ['coração', 'flor', 'mãe', 'romântico'],
    svg: `<path d="${HEART_D}" ${T} />
      <g ${F}>
        <circle cx="50" cy="26" r="4.5"/><circle cx="24" cy="38" r="3.6"/><circle cx="76" cy="38" r="3.6"/>
        <circle cx="33" cy="62" r="3"/><circle cx="67" cy="62" r="3"/><circle cx="50" cy="78" r="3.4"/>
      </g>`,
  },
  {
    id: 'coracao-fita',
    name: 'Coração com faixa',
    category: 'Corações',
    tags: ['coração', 'faixa', 'fita'],
    svg: `<path d="${HEART_D}" ${T} /><path d="M8 54h84l-9 11 9 11H8l9-11Z" ${T} />`,
  },
  {
    id: 'guirlanda-coracoes',
    name: 'Guirlanda de corações',
    category: 'Corações',
    tags: ['coração', 'varal', 'guirlanda'],
    svg: `<path d="M4 30c18 22 74 22 92 0" ${TF} />
      <g transform="translate(-32 22) scale(0.3)"><path d="${HEART_D}" ${F} /></g>
      <g transform="translate(-2 34) scale(0.3)"><path d="${HEART_D}" ${F} /></g>
      <g transform="translate(28 34) scale(0.3)"><path d="${HEART_D}" ${F} /></g>
      <g transform="translate(58 22) scale(0.3)"><path d="${HEART_D}" ${F} /></g>`,
  },

  /* ------------------------------------------------------------ Molduras */
  {
    id: 'moldura-coracao',
    name: 'Moldura coração',
    category: 'Molduras',
    tags: ['moldura', 'coração'],
    svg: `<path d="${HEART_D}" ${T} /><g transform="translate(9 8) scale(0.82)"><path d="${HEART_D}" ${TF} opacity="0.6" /></g>`,
  },
  {
    id: 'moldura-oval',
    name: 'Moldura oval',
    category: 'Molduras',
    tags: ['moldura', 'oval', 'clássica'],
    svg: `<ellipse cx="50" cy="50" rx="33" ry="42" ${T} /><ellipse cx="50" cy="50" rx="28" ry="37" ${TF} opacity="0.55" />`,
  },
  {
    id: 'moldura-arco',
    name: 'Moldura arco',
    category: 'Molduras',
    tags: ['moldura', 'arco', 'casamento'],
    svg: `<path d="M20 88V44a30 30 0 0 1 60 0v44Z" ${T} /><path d="M27 84V45a23 23 0 0 1 46 0v39" ${TF} opacity="0.55" />`,
  },
  {
    id: 'moldura-cantos',
    name: 'Cantos ornamentados',
    category: 'Molduras',
    tags: ['moldura', 'cantos', 'minimalista'],
    svg: `<g ${T}>
      <path d="M14 34V14h20M66 14h20v20M86 66v20H66M34 86H14V66"/>
    </g><g ${TF} opacity="0.55">
      <path d="M22 30c0-8 0-8 8-8M70 22c8 0 8 0 8 8M78 70c0 8 0 8-8 8M30 78c-8 0-8 0-8-8"/>
    </g>`,
  },
  {
    id: 'moldura-festonada',
    name: 'Moldura festonada',
    category: 'Molduras',
    tags: ['moldura', 'renda', 'delicada'],
    svg: `<circle cx="50" cy="50" r="34" ${T} stroke-dasharray="7 6" /><circle cx="50" cy="50" r="26" ${TF} opacity="0.6" />`,
  },
  {
    id: 'moldura-losango',
    name: 'Moldura losango',
    category: 'Molduras',
    tags: ['moldura', 'losango', 'moderna'],
    svg: `<path d="M50 10 90 50 50 90 10 50Z" ${T} /><path d="M50 20 80 50 50 80 20 50Z" ${TF} opacity="0.5" />`,
  },

  /* ----------------------------------------------------------- Arabescos */
  {
    id: 'arabesco-central',
    name: 'Arabesco central',
    category: 'Arabescos',
    tags: ['arabesco', 'ornamento', 'divisor'],
    svg: `<g ${T}>
      <path d="M50 50c-10-14-26-16-34-8-6 6-4 16 5 18 7 2 12-3 12-8"/>
      <path d="M50 50c10 14 26 16 34 8 6-6 4-16-5-18-7-2-12 3-12 8"/>
    </g>`,
  },
  {
    id: 'arabesco-esquerda',
    name: 'Arabesco à esquerda',
    category: 'Arabescos',
    tags: ['arabesco', 'lateral'],
    svg: `<g ${T}>
      <path d="M92 50H36"/>
      <path d="M36 50c0-12-8-20-18-20-9 0-15 7-13 14 2 6 9 8 13 5"/>
      <path d="M52 50c-2-8-8-13-14-13"/>
    </g>`,
  },
  {
    id: 'arabesco-direita',
    name: 'Arabesco à direita',
    category: 'Arabescos',
    tags: ['arabesco', 'lateral'],
    svg: `<g ${T}>
      <path d="M8 50h56"/>
      <path d="M64 50c0-12 8-20 18-20 9 0 15 7 13 14-2 6-9 8-13 5"/>
      <path d="M48 50c2-8 8-13 14-13"/>
    </g>`,
  },
  {
    id: 'arabesco-canto',
    name: 'Volta de canto',
    category: 'Arabescos',
    tags: ['arabesco', 'canto', 'espiral'],
    svg: `<g ${T}>
      <path d="M12 12c34 0 58 20 58 50"/>
      <path d="M70 62c0 9 6 15 13 15 7 0 12-5 12-12 0-8-7-13-13-11"/>
    </g>`,
  },
  {
    id: 'espiral',
    name: 'Espiral',
    category: 'Arabescos',
    tags: ['espiral', 'volta'],
    svg: `<path d="M50 88c22 0 38-16 38-38S72 12 50 12 16 26 16 44c0 15 12 26 26 26 12 0 21-9 21-20 0-9-7-16-15-16-7 0-12 5-12 11" ${T} />`,
  },
  {
    id: 'divisor-arabesco',
    name: 'Divisor com losango',
    category: 'Arabescos',
    tags: ['divisor', 'linha', 'ornamento'],
    svg: `<g ${T}>
      <path d="M6 50h30M64 50h30"/>
      <path d="M50 42 58 50 50 58 42 50Z"/>
    </g>`,
  },

  /* ------------------------------------------------------------- Florais */
  {
    id: 'flor',
    name: 'Flor',
    category: 'Florais',
    tags: ['flor', 'delicado'],
    svg: `<g ${F}>${[0, 72, 144, 216, 288]
      .map((a) => `<ellipse cx="50" cy="30" rx="9" ry="18" transform="rotate(${a} 50 50)"/>`)
      .join('')}</g><circle cx="50" cy="50" r="7" fill="currentColor" opacity="0.45"/>`,
  },
  {
    id: 'flor-contorno',
    name: 'Flor vazada',
    category: 'Florais',
    tags: ['flor', 'contorno'],
    svg: `<g ${TF}>${[0, 72, 144, 216, 288]
      .map((a) => `<ellipse cx="50" cy="30" rx="9" ry="18" transform="rotate(${a} 50 50)"/>`)
      .join('')}</g><circle cx="50" cy="50" r="6" ${T} />`,
  },
  {
    id: 'ramo',
    name: 'Ramo',
    category: 'Florais',
    tags: ['ramo', 'folha', 'verde'],
    svg: `<path d="M50 92V22" ${T} />
      <g ${F} opacity="0.9">
        <path d="M50 34c-12-2-19-9-19-19 12 2 19 9 19 19Z"/>
        <path d="M50 34c12-2 19-9 19-19-12 2-19 9-19 19Z"/>
        <path d="M50 54c-12-2-19-9-19-19 12 2 19 9 19 19Z"/>
        <path d="M50 54c12-2 19-9 19-19-12 2-19 9-19 19Z"/>
        <path d="M50 74c-12-2-19-9-19-19 12 2 19 9 19 19Z"/>
        <path d="M50 74c12-2 19-9 19-19-12 2-19 9-19 19Z"/>
      </g>`,
  },
  {
    id: 'louro',
    name: 'Coroa de louros',
    category: 'Florais',
    tags: ['louro', 'coroa', 'formatura'],
    svg: `<g ${TF}>
      <path d="M34 88C16 76 10 54 18 32"/>
      <path d="M66 88c18-12 24-34 16-56"/>
    </g><g ${F} opacity="0.85">
      ${[0, 1, 2, 3, 4]
        .map((i) => {
          const y = 34 + i * 12
          return `<ellipse cx="${20 + i * 1.6}" cy="${y}" rx="4" ry="7.5" transform="rotate(-28 ${20 + i * 1.6} ${y})"/><ellipse cx="${80 - i * 1.6}" cy="${y}" rx="4" ry="7.5" transform="rotate(28 ${80 - i * 1.6} ${y})"/>`
        })
        .join('')}
    </g>`,
  },
  {
    id: 'buque',
    name: 'Buquê',
    category: 'Florais',
    tags: ['buquê', 'flores', 'casamento'],
    svg: `<g ${TF}><path d="M50 92V56M50 66 34 50M50 66l16-16"/></g>
      <g ${F}>
        <circle cx="50" cy="30" r="12"/>
        <circle cx="28" cy="46" r="9" opacity="0.75"/>
        <circle cx="72" cy="46" r="9" opacity="0.75"/>
      </g>`,
  },

  /* --------------------------------------------------------------- Fitas */
  {
    id: 'faixa',
    name: 'Faixa',
    category: 'Fitas',
    tags: ['faixa', 'fita', 'título'],
    svg: `<path d="M10 34h80v32H10l8-16Z" ${T} />`,
  },
  {
    id: 'faixa-dupla',
    name: 'Faixa com pontas',
    category: 'Fitas',
    tags: ['faixa', 'fita', 'bandeira'],
    svg: `<path d="M20 32h60v28H20Z" ${T} /><path d="M20 32 6 42l14 10M80 32l14 10-14 10" ${T} /><path d="M20 60l-8 12 12-2 4 10" ${TF} opacity="0.6"/><path d="M80 60l8 12-12-2-4 10" ${TF} opacity="0.6"/>`,
  },
  {
    id: 'laco',
    name: 'Laço',
    category: 'Fitas',
    tags: ['laço', 'fita', 'presente'],
    svg: `<g ${T}>
      <path d="M50 46c-8-12-20-18-28-12s-2 20 10 22c8 1 14-4 18-10Z"/>
      <path d="M50 46c8-12 20-18 28-12s2 20-10 22c-8 1-14-4-18-10Z"/>
      <path d="M50 46v10M42 88l8-32M58 88l-8-32"/>
    </g>`,
  },
  {
    id: 'etiqueta',
    name: 'Etiqueta',
    category: 'Fitas',
    tags: ['etiqueta', 'tag'],
    svg: `<path d="M14 30h56l18 20-18 20H14Z" ${T} /><circle cx="28" cy="50" r="4" ${TF} />`,
  },

  /* --------------------------------------------------------------- Selos */
  {
    id: 'selo-serrilhado',
    name: 'Selo serrilhado',
    category: 'Selos',
    tags: ['selo', 'carimbo'],
    svg: `<circle cx="50" cy="50" r="36" ${T} stroke-dasharray="6 5" /><circle cx="50" cy="50" r="26" ${TF} opacity="0.6" />`,
  },
  {
    id: 'selo-medalha',
    name: 'Medalha',
    category: 'Selos',
    tags: ['medalha', 'premiado', 'fita'],
    svg: `<circle cx="50" cy="38" r="24" ${T} /><path d="M36 58 28 92l22-12 22 12-8-34" ${T} /><circle cx="50" cy="38" r="15" ${TF} opacity="0.55" />`,
  },
  {
    id: 'brilho',
    name: 'Brilho',
    category: 'Selos',
    tags: ['brilho', 'estrela', 'ia'],
    svg: `<path d="M50 10c4 22 14 32 36 40-22 8-32 18-36 40-4-22-14-32-36-40 22-8 32-18 36-40Z" ${F} />`,
  },
  {
    id: 'brilhos-tres',
    name: 'Três brilhos',
    category: 'Selos',
    tags: ['brilho', 'estrelas'],
    svg: `<g ${F}>
      <path d="M38 12c3 15 9 21 24 26-15 5-21 11-24 26-3-15-9-21-24-26 15-5 21-11 24-26Z"/>
      <path d="M76 52c1.8 9 5.4 12.6 14.4 15.6-9 3-12.6 6.6-14.4 15.6-1.8-9-5.4-12.6-14.4-15.6 9-3 12.6-6.6 14.4-15.6Z" opacity="0.7"/>
      <path d="M74 14c1 5 3 7 8 8.6-5 1.6-7 3.6-8 8.6-1-5-3-7-8-8.6 5-1.6 7-3.6 8-8.6Z" opacity="0.5"/>
    </g>`,
  },
  {
    id: 'estrela',
    name: 'Estrela',
    category: 'Selos',
    tags: ['estrela'],
    svg: `<path d="m50 12 11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z" ${T} />`,
  },

  /* -------------------------------------------------------------- Formas */
  {
    id: 'circulo',
    name: 'Círculo',
    category: 'Formas',
    tags: ['círculo', 'básico'],
    svg: `<circle cx="50" cy="50" r="36" ${F} />`,
  },
  {
    id: 'circulo-vazado',
    name: 'Círculo vazado',
    category: 'Formas',
    tags: ['círculo', 'contorno'],
    svg: `<circle cx="50" cy="50" r="34" ${T} />`,
  },
  {
    id: 'quadrado-suave',
    name: 'Quadrado suave',
    category: 'Formas',
    tags: ['quadrado'],
    svg: `<rect x="14" y="14" width="72" height="72" rx="22" ${F} />`,
  },
  {
    id: 'arco',
    name: 'Arco',
    category: 'Formas',
    tags: ['arco', 'editorial'],
    svg: `<path d="M20 88V46a30 30 0 0 1 60 0v42Z" ${F} />`,
  },
  {
    id: 'organico',
    name: 'Forma orgânica',
    category: 'Formas',
    tags: ['orgânico', 'moderno'],
    svg: `<path d="M76 26c10 13 8 34-4 46s-33 18-46 10S8 54 14 40 40 16 54 14s14 3 22 12Z" ${F} />`,
  },
  {
    id: 'triangulo',
    name: 'Triângulo',
    category: 'Formas',
    tags: ['triângulo'],
    svg: `<path d="M50 16 88 84H12Z" ${F} />`,
  },

  /* -------------------------------------------------------------- Linhas */
  {
    id: 'linha-fina',
    name: 'Linha fina',
    category: 'Linhas',
    tags: ['linha', 'divisor'],
    svg: `<path d="M8 50h84" ${T} />`,
  },
  {
    id: 'linha-dupla',
    name: 'Linha dupla',
    category: 'Linhas',
    tags: ['linha', 'divisor'],
    svg: `<path d="M8 42h84M8 58h84" ${T} />`,
  },
  {
    id: 'linha-onda',
    name: 'Onda',
    category: 'Linhas',
    tags: ['onda', 'curva'],
    svg: `<path d="M8 50c11-16 22-16 33 0s22 16 33 0 12-10 18-5" ${T} />`,
  },
  {
    id: 'linha-pontilhada',
    name: 'Pontilhado',
    category: 'Linhas',
    tags: ['pontilhado'],
    svg: `<path d="M8 50h84" ${T} stroke-dasharray="1 12" />`,
  },

  /* -------------------------------------------------------- Data e local */
  {
    id: 'calendario',
    name: 'Data',
    category: 'Data e local',
    tags: ['data', 'calendário'],
    svg: `<rect x="14" y="24" width="72" height="64" rx="10" ${T} /><path d="M14 44h72M32 14v18M68 14v18" ${T} />`,
  },
  {
    id: 'local',
    name: 'Localização',
    category: 'Data e local',
    tags: ['local', 'mapa'],
    svg: `<path d="M50 92S20 66 20 44a30 30 0 0 1 60 0c0 22-30 48-30 48Z" ${T} /><circle cx="50" cy="44" r="11" ${T} />`,
  },
  {
    id: 'relogio',
    name: 'Horário',
    category: 'Data e local',
    tags: ['hora', 'relógio'],
    svg: `<circle cx="50" cy="50" r="36" ${T} /><path d="M50 26v26l16 9" ${T} />`,
  },
  {
    id: 'alianca',
    name: 'Alianças',
    category: 'Data e local',
    tags: ['aliança', 'casamento'],
    svg: `<circle cx="38" cy="58" r="24" ${T} /><circle cx="64" cy="58" r="24" ${T} opacity="0.6" /><path d="M30 30h16l-8 10Z" ${T} />`,
  },

  /* ----------------------------------------------- Corações (segunda leva) */
  {
    id: 'coracao-alado',
    name: 'Coração com asas',
    category: 'Corações',
    tags: ['coração', 'asas', 'anjo'],
    svg: `<g transform="translate(0 4) scale(0.72)"><g transform="translate(19 6)"><path d="${HEART_D}" ${F} /></g></g>
      <g ${TF}>
        <path d="M32 46c-10-8-20-10-26-6 5 3 8 8 9 13 6-2 12-4 17-7Z"/>
        <path d="M68 46c10-8 20-10 26-6-5 3-8 8-9 13-6-2-12-4-17-7Z"/>
      </g>`,
  },
  {
    id: 'coracao-flecha',
    name: 'Coração com flecha',
    category: 'Corações',
    tags: ['coração', 'flecha', 'cupido'],
    svg: `<path d="${HEART_D}" ${T} /><path d="M6 62 94 34" ${T} /><path d="M84 26l12 8-10 10" ${T} /><path d="M18 66l-12-4 2-8" ${T} />`,
  },
  {
    id: 'coracoes-tres',
    name: 'Três corações',
    category: 'Corações',
    tags: ['coração', 'trio'],
    svg: `<g transform="translate(4 -6) scale(0.5)"><path d="${HEART_D}" ${F} /></g>
      <g transform="translate(46 -14) scale(0.62)"><path d="${HEART_D}" ${F} /></g>
      <g transform="translate(24 30) scale(0.44)" opacity="0.6"><path d="${HEART_D}" ${F} /></g>`,
  },
  {
    id: 'coracao-mao',
    name: 'Coração de mãos',
    category: 'Corações',
    tags: ['coração', 'mãos', 'família'],
    svg: `<path d="${HEART_D}" ${T} /><path d="M50 32v38M32 46c6 4 12 6 18 6s12-2 18-6" ${TF} opacity="0.6" />`,
  },

  /* ----------------------------------------------- Molduras (segunda leva) */
  {
    id: 'moldura-dupla',
    name: 'Moldura dupla',
    category: 'Molduras',
    tags: ['moldura', 'retângulo', 'clássica'],
    svg: `<rect x="10" y="10" width="80" height="80" rx="4" ${T} /><rect x="18" y="18" width="64" height="64" rx="3" ${TF} opacity="0.55" />`,
  },
  {
    id: 'moldura-laco',
    name: 'Moldura com laço',
    category: 'Molduras',
    tags: ['moldura', 'laço', 'presente'],
    svg: `<rect x="14" y="30" width="72" height="58" rx="6" ${T} />
      <g ${T}>
        <path d="M50 30c-6-9-15-13-20-9s-1 13 7 14c5 1 10-1 13-5Z"/>
        <path d="M50 30c6-9 15-13 20-9s1 13-7 14c-5 1-10-1-13-5Z"/>
      </g>`,
  },
  {
    id: 'moldura-cordao',
    name: 'Moldura cordão',
    category: 'Molduras',
    tags: ['moldura', 'cordão', 'pontos'],
    svg: `<circle cx="50" cy="50" r="34" ${T} stroke-dasharray="0.5 8" stroke-width="5" />`,
  },
  {
    id: 'moldura-flores',
    name: 'Moldura florida',
    category: 'Molduras',
    tags: ['moldura', 'flores', 'romântica'],
    svg: `<circle cx="50" cy="50" r="30" ${T} />
      <g ${F} opacity="0.85">
        ${[0, 45, 90, 135, 180, 225, 270, 315]
          .map((a) => {
            const rad = (a * Math.PI) / 180
            const x = (50 + 30 * Math.cos(rad)).toFixed(1)
            const y = (50 + 30 * Math.sin(rad)).toFixed(1)
            return `<circle cx="${x}" cy="${y}" r="4.5"/>`
          })
          .join('')}
      </g>`,
  },

  /* ---------------------------------------------- Arabescos (segunda leva) */
  {
    id: 'arabesco-coroa',
    name: 'Coroa de arabesco',
    category: 'Arabescos',
    tags: ['arabesco', 'coroa', 'ornamento'],
    svg: `<g ${T}>
      <path d="M16 66c0-18 15-32 34-32s34 14 34 32"/>
      <path d="M16 66c-6 0-10-5-10-11s5-10 10-8"/>
      <path d="M84 66c6 0 10-5 10-11s-5-10-10-8"/>
      <path d="M50 34V18"/><circle cx="50" cy="14" r="4"/>
    </g>`,
  },
  {
    id: 'arabesco-simetrico',
    name: 'Arabesco simétrico',
    category: 'Arabescos',
    tags: ['arabesco', 'divisor', 'simétrico'],
    svg: `<g ${T}>
      <path d="M50 50c-8-10-20-12-28-6-6 5-4 14 4 15 6 1 10-3 10-8"/>
      <path d="M50 50c8-10 20-12 28-6 6 5 4 14-4 15-6 1-10-3-10-8"/>
      <path d="M50 50c-8 10-20 12-28 6-6-5-4-14 4-15 6-1 10 3 10 8"/>
      <path d="M50 50c8 10 20 12 28 6 6-5 4-14-4-15-6-1-10 3-10 8"/>
    </g>`,
  },
  {
    id: 'renda',
    name: 'Renda',
    category: 'Arabescos',
    tags: ['renda', 'delicado', 'barra'],
    svg: `<g ${TF}>
      <path d="M6 40h88"/>
      ${[16, 33, 50, 67, 84]
        .map((x) => `<path d="M${x} 40a9 9 0 0 0 18 0" transform="translate(-9 0)"/>`)
        .join('')}
      <path d="M6 40h88" transform="translate(0 22)" opacity="0.5" stroke-dasharray="2 6"/>
    </g>`,
  },

  /* ------------------------------------------------ Florais (segunda leva) */
  {
    id: 'rosa',
    name: 'Rosa',
    category: 'Florais',
    tags: ['rosa', 'flor', 'casamento'],
    svg: `<g ${T}>
      <circle cx="50" cy="42" r="26"/>
      <path d="M50 68c-8 0-14-6-14-14s6-12 14-12 14 5 14 12"/>
      <path d="M50 56c-4 0-7-3-7-7s3-6 7-6"/>
      <path d="M50 68v22M50 78c-9 0-14-5-15-13 9 0 15 5 15 13Z"/>
    </g>`,
  },
  {
    id: 'coroa-flores',
    name: 'Coroa de flores',
    category: 'Florais',
    tags: ['coroa', 'flores', 'guirlanda'],
    svg: `<circle cx="50" cy="50" r="30" ${TF} opacity="0.6" />
      <g ${F}>
        ${[10, 70, 130, 190, 250, 310]
          .map((a) => {
            const rad = (a * Math.PI) / 180
            const x = (50 + 30 * Math.cos(rad)).toFixed(1)
            const y = (50 + 30 * Math.sin(rad)).toFixed(1)
            return `<g transform="translate(${x} ${y}) scale(0.34)">${[0, 72, 144, 216, 288]
              .map((p) => `<ellipse cx="0" cy="-14" rx="7" ry="13" transform="rotate(${p})"/>`)
              .join('')}</g>`
          })
          .join('')}
      </g>`,
  },
  {
    id: 'folha-dupla',
    name: 'Folhas cruzadas',
    category: 'Florais',
    tags: ['folha', 'verde', 'natural'],
    svg: `<g ${F} opacity="0.9">
      <path d="M50 82C28 76 18 58 22 34c22 6 32 24 28 48Z"/>
      <path d="M50 82c22-6 32-24 28-48-22 6-32 24-28 48Z" opacity="0.6"/>
    </g><path d="M50 90V52" ${TF} />`,
  },

  /* -------------------------------------------------- Fitas (segunda leva) */
  {
    id: 'faixa-curva',
    name: 'Faixa curva',
    category: 'Fitas',
    tags: ['faixa', 'fita', 'curva'],
    svg: `<path d="M8 42c14-10 30-14 42-14s28 4 42 14v20c-14-10-30-14-42-14s-28 4-42 14Z" ${T} />`,
  },
  {
    id: 'pendao',
    name: 'Bandeirinhas',
    category: 'Fitas',
    tags: ['bandeirinha', 'festa', 'varal'],
    svg: `<path d="M4 26c22 20 70 20 92 0" ${TF} />
      <g ${F} opacity="0.9">
        <path d="M20 36l12 2-4 18Z"/><path d="M40 42l12 1-5 18Z" opacity="0.75"/>
        <path d="M60 42l12-1-8 18Z"/><path d="M78 36l12-3-10 17Z" opacity="0.75"/>
      </g>`,
  },
  {
    id: 'selo-fita',
    name: 'Fita com selo',
    category: 'Fitas',
    tags: ['fita', 'selo', 'premiado'],
    svg: `<path d="M28 8h44v58L50 52 28 66Z" ${T} /><circle cx="50" cy="30" r="12" ${TF} opacity="0.6" />`,
  },

  /* -------------------------------------------------- Selos (segunda leva) */
  {
    id: 'selo-losango',
    name: 'Selo losango',
    category: 'Selos',
    tags: ['selo', 'losango'],
    svg: `<path d="M50 8 92 50 50 92 8 50Z" ${T} stroke-dasharray="6 5" /><path d="M50 26 74 50 50 74 26 50Z" ${TF} opacity="0.6" />`,
  },
  {
    id: 'raios',
    name: 'Explosão',
    category: 'Selos',
    tags: ['raios', 'destaque', 'novo'],
    svg: `<g ${T}>${Array.from({ length: 12 }, (_, index) => {
      const a = (index * 30 * Math.PI) / 180
      const x1 = (50 + 20 * Math.cos(a)).toFixed(1)
      const y1 = (50 + 20 * Math.sin(a)).toFixed(1)
      const x2 = (50 + 40 * Math.cos(a)).toFixed(1)
      const y2 = (50 + 40 * Math.sin(a)).toFixed(1)
      return `<path d="M${x1} ${y1}L${x2} ${y2}"/>`
    }).join('')}</g><circle cx="50" cy="50" r="14" ${T} />`,
  },
  {
    id: 'estrela-cheia',
    name: 'Estrela cheia',
    category: 'Selos',
    tags: ['estrela', 'destaque'],
    svg: `<path d="m50 12 11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z" ${F} />`,
  },

  /* ------------------------------------------------- Formas (segunda leva) */
  {
    id: 'hexagono',
    name: 'Hexágono',
    category: 'Formas',
    tags: ['hexágono', 'moderno'],
    svg: `<path d="M50 10 88 30v40L50 90 12 70V30Z" ${F} />`,
  },
  {
    id: 'pilula',
    name: 'Pílula',
    category: 'Formas',
    tags: ['pílula', 'faixa'],
    svg: `<rect x="10" y="34" width="80" height="32" rx="16" ${F} />`,
  },
  {
    id: 'flor-forma',
    name: 'Forma de flor',
    category: 'Formas',
    tags: ['flor', 'orgânico'],
    svg: `<path d="M50 12c9 0 15 7 14 16 8-5 17-3 21 5s0 17-8 20c8 3 12 12 8 20s-13 10-21 5c1 9-5 16-14 16s-15-7-14-16c-8 5-17 3-21-5s0-17 8-20c-8-3-12-12-8-20s13-10 21-5c-1-9 5-16 14-16Z" ${F} />`,
  },
  {
    id: 'gota',
    name: 'Gota',
    category: 'Formas',
    tags: ['gota', 'orgânico'],
    svg: `<path d="M50 10c18 26 30 40 30 52a30 30 0 0 1-60 0c0-12 12-26 30-52Z" ${F} />`,
  },

  /* ------------------------------------------------- Linhas (segunda leva) */
  {
    id: 'linha-tracejada',
    name: 'Tracejado',
    category: 'Linhas',
    tags: ['tracejado', 'divisor'],
    svg: `<path d="M8 50h84" ${T} stroke-dasharray="9 8" />`,
  },
  {
    id: 'linha-ziguezague',
    name: 'Ziguezague',
    category: 'Linhas',
    tags: ['ziguezague', 'divisor'],
    svg: `<path d="M8 58 22 42l14 16 14-16 14 16 14-16 6 7" ${T} />`,
  },
  {
    id: 'linha-com-ponto',
    name: 'Linha com ponto',
    category: 'Linhas',
    tags: ['linha', 'divisor', 'ponto'],
    svg: `<path d="M8 50h34M58 50h34" ${T} /><circle cx="50" cy="50" r="5" ${F} />`,
  },
]
