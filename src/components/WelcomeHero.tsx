import { Avatar, LinkButton } from './ui'
import { Icon } from './icons'

/**
 * Entrada do painel.
 *
 * O fundo é uma foto da própria galeria liberada pela loja — a pessoa vê o
 * seu casamento, não uma imagem de banco. Sem galeria ainda, o degradê da
 * marca segura a composição.
 */
export function WelcomeHero({
  name,
  avatar,
  store,
  gallery,
  backgroundUrl,
  photoCount,
  albumCount,
  seeding,
}: {
  name: string
  avatar: string | null
  store: string | null
  gallery: string | null
  backgroundUrl: string | null
  photoCount: number
  albumCount: number
  seeding: { done: number; total: number } | null
}) {
  const firstName = name.split(' ')[0] ?? ''
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-ink">
      {/* fundo */}
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

      {/* Véu só do lado do texto: escurece o suficiente para ler e deixa a
          foto respirar à direita, que é onde ela aparece de verdade. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />

      <div className="relative flex flex-col gap-8 px-7 py-9 sm:px-10 sm:py-11 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <Avatar
              name={name}
              src={avatar}
              size={52}
              className="ring-2 ring-white/70"
            />
            <div>
              <p className="text-[13px] font-medium text-white/70">
                {saudacao}
                {store ? ` · ${store}` : ''}
              </p>
              <p className="text-[13px] text-white/55">
                {gallery ? `Galeria ${gallery}` : 'Sua biblioteca'}
              </p>
            </div>
          </div>

          <h1 className="mt-6 text-[34px] leading-[1.12] font-bold tracking-tight text-white sm:text-[42px]">
            Que bom te ver, {firstName}.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75">
            {seeding
              ? 'Estamos preparando as fotos que a loja liberou para você. Já pode começar a olhar — o resto chega em instantes.'
              : photoCount === 0
                ? 'Assim que a loja liberar suas fotos, elas aparecem aqui prontas para virar álbum.'
                : albumCount === 0
                  ? 'Suas fotos já estão aqui. Escolha as preferidas e monte um álbum para guardar esse dia.'
                  : 'Seu álbum continua exatamente onde você parou. É só voltar e seguir montando.'}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <LinkButton to="/app/fotos" variant="white">
              <Icon.Photos className="size-4" />
              Ver minhas fotos
            </LinkButton>
            <LinkButton
              to={albumCount === 0 ? '/app/albuns/novo' : '/app/albuns'}
              variant="dark"
              className="border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              {albumCount === 0 ? 'Montar meu álbum' : 'Continuar meu álbum'}
            </LinkButton>
          </div>
        </div>

        {/* números, em vidro sobre a foto */}
        <dl className="flex shrink-0 gap-3">
          <Stat label="Fotos" value={photoCount} />
          <Stat label={albumCount === 1 ? 'Álbum' : 'Álbuns'} value={albumCount} />
        </dl>
      </div>

      {seeding && (
        <div className="relative border-t border-white/15 bg-white/10 px-7 py-3 backdrop-blur-sm sm:px-10">
          <div className="flex items-center justify-between gap-4 text-[12px] text-white/80">
            <span>Preparando as fotos da loja</span>
            <span className="numeric font-semibold text-white">
              {seeding.done} de {seeding.total}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-300"
              style={{ width: `${(seeding.done / seeding.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[104px] rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
      <dt className="text-[11px] font-medium text-white/65">{label}</dt>
      <dd className="numeric mt-1 text-3xl font-bold text-white">{value}</dd>
    </div>
  )
}
