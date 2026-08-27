import { Avatar, LinkButton } from './ui'
import { Icon } from './icons'

/**
 * Entrada do painel.
 *
 * O fundo é uma foto da própria galeria liberada pela loja — a pessoa vê o
 * seu evento, não uma imagem de banco. Sem galeria ainda, o degradê da marca
 * segura a composição.
 *
 * O texto e os números saem do estado real: quantas fotos a loja liberou,
 * quantos álbuns existem e quantos já passaram pela revisão.
 */
export function WelcomeHero({
  name,
  avatar,
  store,
  gallery,
  backgroundUrl,
  photoCount,
  albumCount,
  readyCount,
  pendingCount,
  progress,
  continueTo,
  seeding,
}: {
  name: string
  avatar: string | null
  store: string | null
  gallery: string | null
  backgroundUrl: string | null
  photoCount: number
  albumCount: number
  readyCount: number
  pendingCount: number
  /** Progresso do pedido, de 0 a 100. */
  progress: number
  /** Para onde vai o botão de continuar: o editor aberto ou a criação. */
  continueTo: string
  seeding: { done: number; total: number } | null
}) {
  const firstName = name.split(' ')[0] ?? ''

  const titulo = seeding
    ? 'Estamos preparando suas fotos.'
    : photoCount === 0
      ? 'Sua galeria chega em breve.'
      : albumCount === 0
        ? 'Suas fotos já estão aqui.'
        : readyCount === albumCount
          ? 'Seu álbum está pronto.'
          : 'Falta pouco para o seu álbum.'

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-navy-deep">
      {backgroundUrl ? (
        <img
          src={backgroundUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-105 object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-brand" />
      )}

      {/* Véu azul da marca, não preto: escurece o suficiente para o texto ler
          e mantém a foto com cor, em vez de apagá-la em cinza. */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy/35" />
      <div className="absolute -top-24 -right-16 size-80 rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative flex flex-col gap-8 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-11">
        <div className="min-w-0 max-w-xl">
          {/* etiqueta da galeria */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 py-1.5 pr-4 pl-1.5 backdrop-blur-sm">
            <Avatar name={name} src={avatar} size={26} className="ring-1 ring-white/40" />
            <span className="text-[12px] font-semibold text-white/85">
              {gallery ?? 'Sua biblioteca'}
            </span>
          </span>

          <h1 className="mt-5 text-[32px] leading-[1.1] font-bold tracking-tight text-white sm:text-[40px]">
            Olá, {firstName}.
            <br />
            {titulo}
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            {seeding ? (
              <>
                Já pode começar a olhar — o resto da galeria chega em instantes.
              </>
            ) : photoCount === 0 ? (
              <>Assim que a loja liberar sua galeria, ela aparece aqui.</>
            ) : (
              <>
                A <strong className="font-semibold text-white">{store}</strong> liberou{' '}
                {photoCount} fotos
                {albumCount > 0 && (
                  <> e {albumCount} {albumCount === 1 ? 'projeto' : 'projetos'}</>
                )}
                .{' '}
                {readyCount > 0 && (
                  <>
                    {readyCount} já {readyCount === 1 ? 'está pronto' : 'estão prontos'} para
                    finalizar.
                  </>
                )}
              </>
            )}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {readyCount > 0 ? (
              <LinkButton to="/app/albuns?status=pronto" variant="white">
                <Icon.Check className="size-4" />
                Revisar e finalizar
              </LinkButton>
            ) : (
              <LinkButton to="/app/fotos" variant="white">
                <Icon.Photos className="size-4" />
                Ver minhas fotos
              </LinkButton>
            )}

            <LinkButton to={continueTo}>
              <Icon.ArrowUpRight className="size-4" />
              {albumCount === 0 ? 'Montar meu álbum' : 'Continuar editando'}
            </LinkButton>

            <LinkButton
              to="/app/albuns/novo"
              variant="dark"
              className="border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              <Icon.Plus className="size-4" />
              Criar outro álbum
            </LinkButton>
          </div>
        </div>

        {/* progresso do pedido */}
        <div className="w-full shrink-0 rounded-[22px] border border-white/15 bg-white/8 p-6 backdrop-blur-sm lg:w-[380px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-medium text-white/70">
              {seeding ? 'Preparando a galeria' : 'Progresso do pedido'}
            </span>
            <span className="numeric text-[15px] font-bold text-white">
              {seeding
                ? `${seeding.done}/${seeding.total}`
                : `${Math.round(progress)}%`}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-white transition-[width] duration-500"
              style={{
                width: `${seeding ? (seeding.done / seeding.total) * 100 : progress}%`,
              }}
            />
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4">
            <Stat value={albumCount} label={albumCount === 1 ? 'projeto' : 'projetos'} />
            <Stat value={photoCount} label="fotos liberadas" />
            <Stat
              value={readyCount}
              label={readyCount === 1 ? 'pronto' : 'prontos'}
              tone={readyCount > 0 ? 'destaque' : 'normal'}
            />
          </dl>

          {pendingCount > 0 && (
            <p className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 text-[12px] leading-relaxed text-white/70">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-warning/25 text-[10px] font-bold text-warning">
                !
              </span>
              {pendingCount} {pendingCount === 1 ? 'álbum ainda tem' : 'álbuns ainda têm'}{' '}
              lâminas sem foto.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function Stat({
  value,
  label,
  tone = 'normal',
}: {
  value: number
  label: string
  tone?: 'normal' | 'destaque'
}) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span
          className={`numeric block text-2xl font-bold ${
            tone === 'destaque' ? 'text-warning' : 'text-white'
          }`}
        >
          {value}
        </span>
        <span className="mt-0.5 block text-[11px] text-white/60">{label}</span>
      </dd>
    </div>
  )
}
