import { useMemo } from 'react'
import { AppShell } from '../components/AppShell'
import { Card, IconButton, LinkButton, Spinner } from '../components/ui'
import { BarChart, Breakdown, LineChart } from '../components/charts'
import { ProjectCard } from '../components/ProjectCard'
import { WelcomeHero } from '../components/WelcomeHero'
import { Icon } from '../components/icons'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { formatBytes } from '../lib/images'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

export function Dashboard() {
  const { user } = useAuth()
  const { photos, projects, isLoading, thumbUrls, seeding } = useStore()

  /**
   * Fundo da hero: uma foto da própria cobertura. Prefere favorita e deitada,
   * que é o que preenche uma faixa larga sem cortar o assunto.
   */
  const heroPhotoUrl = useMemo(() => {
    const deitada = (photo: (typeof photos)[number]) =>
      photo.orientation === 'horizontal' || photo.orientation === 'panoramica'

    const escolhida =
      photos.find((photo) => photo.favorite && deitada(photo)) ??
      photos.find(deitada) ??
      photos.find((photo) => photo.favorite) ??
      photos[0]

    return escolhida ? (thumbUrls[escolhida.id] ?? null) : null
  }, [photos, thumbUrls])

  const stats = useMemo(() => {
    const today = startOfDay(new Date())
    const dayMs = 86_400_000

    // Barras: fotos adicionadas em cada um dos últimos 7 dias.
    const weekly = Array.from({ length: 7 }, (_, offset) => {
      const day = today - (6 - offset) * dayMs
      const count = photos.filter(
        (photo) => startOfDay(new Date(photo.createdAt)) === day,
      ).length
      return { label: WEEKDAYS[new Date(day).getDay()], value: count }
    })

    // Linha: tamanho acumulado da biblioteca ao longo dos últimos 14 dias.
    const cumulative = Array.from({ length: 14 }, (_, offset) => {
      const day = today - (13 - offset) * dayMs
      const count = photos.filter((photo) => photo.createdAt <= day + dayMs).length
      const date = new Date(day)
      return {
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        value: count,
      }
    })

    const byOrientation = [
      { label: 'Verticais', value: 0 },
      { label: 'Horizontais', value: 0 },
      { label: 'Quadradas', value: 0 },
      { label: 'Panorâmicas', value: 0 },
    ]
    for (const photo of photos) {
      const index =
        photo.orientation === 'vertical'
          ? 0
          : photo.orientation === 'horizontal'
            ? 1
            : photo.orientation === 'quadrada'
              ? 2
              : 3
      byOrientation[index].value += 1
    }

    return {
      weekly,
      cumulative,
      byOrientation,
      addedThisWeek: weekly.reduce((sum, day) => sum + day.value, 0),
      totalBytes: photos.reduce((sum, photo) => sum + photo.size, 0),
      favorites: photos.filter((photo) => photo.favorite).length,
      fromStore: photos.filter((photo) => photo.origin === 'loja').length,
    }
  }, [photos])

  const recentProjects = projects.slice(0, 4)

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-primary">
          <Spinner className="size-7" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="pt-2 pb-6">
        <WelcomeHero
          name={user?.name ?? ''}
          avatar={user?.avatar ?? null}
          store={user?.store ?? null}
          gallery={photos.find((photo) => photo.gallery)?.gallery ?? null}
          backgroundUrl={heroPhotoUrl}
          photoCount={photos.length}
          albumCount={projects.length}
          seeding={seeding}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">Sua biblioteca</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            O que a loja liberou e o que você já enviou.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LinkButton to="/app/fotos" variant="white" size="sm">
            <Icon.Upload className="size-4" />
            Enviar minhas fotos
          </LinkButton>
          <LinkButton to="/app/albuns/novo" size="sm">
            <Icon.Plus className="size-4" />
            Novo álbum
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="flex min-h-[260px] flex-col p-6">
            <p className="text-[13px] font-medium text-ink-soft">Adicionadas na semana</p>
            <p className="numeric mt-1 text-[40px] leading-none font-bold text-ink">
              {stats.addedThisWeek}
            </p>
            <div className="mt-5 min-h-[130px] flex-1">
              <BarChart data={stats.weekly} />
            </div>
          </Card>

          <Card className="flex min-h-[260px] flex-col p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-ink-soft">Biblioteca total</p>
                <p className="numeric mt-1 text-[40px] leading-none font-bold text-ink">
                  {photos.length}
                </p>
              </div>
              <IconButton label="Ver fotos" size="sm">
                <Icon.ArrowUpRight className="size-4" />
              </IconButton>
            </div>
            <div className="mt-5 min-h-[130px] flex-1">
              <LineChart data={stats.cumulative} label="Fotos" />
            </div>
          </Card>

          <Card className="p-6">
            <CardHeaderInline title="Composição" subtitle="Por orientação" />
            <div className="mt-5">
              <Breakdown data={stats.byOrientation} />
            </div>
          </Card>

          <Card className="p-6">
            <CardHeaderInline title="Seu acervo" subtitle="Resumo geral" />
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Da loja" value={stats.fromStore} />
              <MiniStat label="Minhas" value={photos.length - stats.fromStore} />
              <MiniStat label="Favoritas" value={stats.favorites} />
              <MiniStat label="Espaço" value={formatBytes(stats.totalBytes)} />
            </dl>
          </Card>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">
              Álbuns recentes
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Continue de onde você parou.
            </p>
          </div>
          {projects.length > 0 && (
            <LinkButton to="/app/albuns" variant="white" size="sm">
              Ver todos
            </LinkButton>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon.Albums className="size-7" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">
                Nenhum álbum ainda
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
                Envie suas fotos e crie o primeiro álbum — a Photoon monta as
                páginas para você.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <LinkButton to="/app/fotos" variant="white">
                  Enviar fotos
                </LinkButton>
                <LinkButton to="/app/albuns/novo">Criar álbum</LinkButton>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

function CardHeaderInline({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-subtle px-4 py-3.5">
      <dt className="text-[11px] font-medium text-ink-faint">{label}</dt>
      <dd className="numeric mt-1 text-xl font-bold text-ink">{value}</dd>
    </div>
  )
}
