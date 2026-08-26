import { useMemo } from 'react'
import { AppShell, PageHeader } from '../components/AppShell'
import { Card, IconButton, LinkButton, Spinner } from '../components/ui'
import { BarChart, Breakdown, LineChart } from '../components/charts'
import { ProjectCard } from '../components/ProjectCard'
import { Icon } from '../components/icons'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { formatBytes } from '../lib/images'
import { BUILTIN_ELEMENTS } from '../lib/builtinElements'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

export function Dashboard() {
  const { user } = useAuth()
  const { photos, elements, projects, isLoading } = useStore()

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
    }
  }, [photos])

  const firstName = user?.name.split(' ')[0] ?? ''
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
      <PageHeader
        breadcrumb={['Biblioteca', 'Visão geral']}
        title={`Olá, ${firstName}`}
        actions={
          <>
            <IconButton label="Buscar">
              <Icon.Search className="size-[18px]" />
            </IconButton>
            <IconButton label="Filtros">
              <Icon.Sliders className="size-[18px]" />
            </IconButton>
            <LinkButton to="/app/fotos" variant="white">
              <Icon.Upload className="size-4" />
              Enviar fotos
            </LinkButton>
            <LinkButton to="/app/albuns/novo">
              <Icon.Plus className="size-4" />
              Novo álbum
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <HeroCard photoCount={photos.length} />

        <div className="grid gap-4 sm:grid-cols-2">
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
              <MiniStat label="Álbuns" value={projects.length} />
              <MiniStat label="Favoritas" value={stats.favorites} />
              <MiniStat
                label="Elementos"
                value={BUILTIN_ELEMENTS.length + elements.length}
              />
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

function HeroCard({ photoCount }: { photoCount: number }) {
  return (
    <Card className="relative overflow-hidden border-0 bg-brand p-0">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between p-7">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white">
            <Icon.Sparkle className="size-3.5" />
            Assistência inteligente
          </span>
          <h2 className="mt-4 text-2xl leading-tight font-bold text-white">
            {photoCount === 0
              ? 'Comece enviando suas fotos'
              : 'Monte um álbum em poucos cliques'}
          </h2>
          <p className="mt-2 text-sm text-white/75">
            {photoCount === 0
              ? 'Cadastre sua biblioteca e a Photoon organiza tudo para você.'
              : `Você já tem ${photoCount} ${photoCount === 1 ? 'foto pronta' : 'fotos prontas'} para virar álbum.`}
          </p>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/12 p-2 backdrop-blur-sm">
            <div className="col-span-2 aspect-4/3 rounded-xl bg-white/25" />
            <div className="aspect-square rounded-xl bg-white/18" />
            <div className="aspect-square rounded-xl bg-white/18" />
            <div className="col-span-2 aspect-4/3 rounded-xl bg-white/25" />
          </div>

          <LinkButton
            to={photoCount === 0 ? '/app/fotos' : '/app/albuns/novo'}
            variant="white"
            size="lg"
            block
            className="mt-5"
          >
            {photoCount === 0 ? 'Enviar minhas fotos' : 'Criar álbum agora'}
          </LinkButton>
        </div>
      </div>
    </Card>
  )
}
