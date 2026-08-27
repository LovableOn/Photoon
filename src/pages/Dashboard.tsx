import { useMemo } from 'react'
import { AppShell } from '../components/AppShell'
import { Card, LinkButton, ProgressBar, Spinner } from '../components/ui'
import { CATEGORICAL, MultiLineChart } from '../components/charts'
import { ProjectCard } from '../components/ProjectCard'
import { WelcomeHero } from '../components/WelcomeHero'
import { AiCallout } from '../components/AiCallout'
import { NextSteps, type Step } from '../components/NextSteps'
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

  /** Fotos que já ocupam um quadro em algum álbum. */
  const usedIds = useMemo(() => {
    const usadas = new Set<string>()
    for (const project of projects) {
      for (const spread of project.spreads ?? []) {
        for (const frame of spread.frames) if (frame.photoId) usadas.add(frame.photoId)
      }
    }
    return usadas
  }, [projects])

  const stats = useMemo(() => {
    const today = startOfDay(new Date())
    const dayMs = 86_400_000

    /**
     * Duas séries na mesma escala: o tamanho da galeria liberada e quanto dela
     * já entrou num álbum. A distância entre as linhas é a leitura útil — o
     * que ainda falta aproveitar.
     */
    const dias = Array.from({ length: 14 }, (_, offset) => {
      const day = today - (13 - offset) * dayMs
      const date = new Date(day)
      return { day, label: `${date.getDate()}/${date.getMonth() + 1}` }
    })

    const liberadas = dias.map(({ day, label }) => ({
      label,
      value: photos.filter((photo) => photo.createdAt <= day + dayMs).length,
    }))

    const usadas = dias.map(({ day, label }) => ({
      label,
      value: photos.filter(
        (photo) => photo.createdAt <= day + dayMs && usedIds.has(photo.id),
      ).length,
    }))

    const semanal = Array.from({ length: 7 }, (_, offset) => {
      const day = today - (6 - offset) * dayMs
      const count = photos.filter(
        (photo) => startOfDay(new Date(photo.createdAt)) === day,
      ).length
      return { label: WEEKDAYS[new Date(day).getDay()], value: count }
    })

    return {
      liberadas,
      usadas,
      addedThisWeek: semanal.reduce((sum, day) => sum + day.value, 0),
      totalBytes: photos.reduce((sum, photo) => sum + photo.size, 0),
      favorites: photos.filter((photo) => photo.favorite).length,
      fromStore: photos.filter((photo) => photo.origin === 'loja').length,
      emUso: usedIds.size,
    }
  }, [photos, usedIds])

  /** Estado do pedido, que alimenta a hero e os próximos passos. */
  const pedido = useMemo(() => {
    const prontos = projects.filter(
      (project) => project.status === 'pronto' || project.status === 'finalizado',
    ).length

    const comPendencia = projects.filter((project) =>
      (project.spreads ?? []).some((spread) =>
        spread.frames.some((frame) => !frame.photoId),
      ),
    ).length

    const emEdicao = projects.find((project) => project.status !== 'finalizado')

    // Três etapas de peso igual: ter fotos, ter álbum, ter álbum pronto.
    const etapas = [
      photos.length > 0,
      projects.length > 0,
      prontos > 0 && prontos === projects.length,
    ]
    const progresso = (etapas.filter(Boolean).length / etapas.length) * 100

    const passos: Step[] = [
      {
        label: 'Receber as fotos da loja',
        detail: `${photos.length} fotos liberadas`,
        to: '/app/fotos',
        done: photos.length > 0,
      },
      {
        label: 'Criar o álbum',
        detail:
          projects.length > 0
            ? `${projects.length} ${projects.length === 1 ? 'álbum criado' : 'álbuns criados'}`
            : 'Escolha produto, formato e fotos',
        to: '/app/albuns/novo',
        done: projects.length > 0,
      },
      {
        label: 'Montar as lâminas',
        detail:
          stats.emUso > 0
            ? `${stats.emUso} de ${photos.length} fotos já usadas`
            : 'Distribua as fotos nas páginas',
        to: emEdicao ? `/app/albuns/${emEdicao.id}/editor` : '/app/albuns/novo',
        done: projects.length > 0 && comPendencia === 0,
      },
      {
        label: 'Revisar e finalizar',
        detail:
          comPendencia > 0
            ? `${comPendencia} ${comPendencia === 1 ? 'álbum com pendência' : 'álbuns com pendência'}`
            : 'Confira e envie para produção',
        to: emEdicao ? `/app/albuns/${emEdicao.id}` : '/app/albuns',
        done: prontos > 0 && prontos === projects.length,
      },
    ]

    return {
      prontos,
      comPendencia,
      progresso,
      passos,
      continuarEm: emEdicao ? `/app/albuns/${emEdicao.id}/editor` : '/app/albuns/novo',
    }
  }, [projects, photos.length, stats.emUso])

  const naoUsadas = photos.length - stats.emUso
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
          readyCount={pedido.prontos}
          pendingCount={pedido.comPendencia}
          progress={pedido.progresso}
          continueTo={pedido.continuarEm}
          seeding={seeding}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Uma seção só, com as duas linhas na mesma escala. */}
        <Card className="flex min-h-[300px] flex-col p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Sua galeria</h2>
              <p className="mt-0.5 text-xs text-ink-faint">
                Quanto do que a loja liberou já virou álbum
              </p>
            </div>
            <LinkButton to="/app/fotos" variant="white" size="sm">
              Ver fotos
            </LinkButton>
          </div>

          <div className="mt-5 min-h-[190px] flex-1">
            <MultiLineChart
              series={[
                { label: 'Fotos liberadas', color: CATEGORICAL[0], points: stats.liberadas },
                { label: 'Já no álbum', color: CATEGORICAL[1], points: stats.usadas },
              ]}
            />
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <MiniStat label="Da loja" value={stats.fromStore} />
            <MiniStat label="Favoritas" value={stats.favorites} />
            <MiniStat label="Espaço" value={formatBytes(stats.totalBytes)} />
          </dl>
        </Card>

        {/* Progresso e próximos passos, no lugar da composição. */}
        <Card className="flex flex-col p-6">
          <h2 className="text-[15px] font-semibold text-ink">Progresso</h2>
          <p className="mt-0.5 text-xs text-ink-faint">Na ordem recomendada</p>

          <div className="mt-4 flex items-center gap-3">
            <ProgressBar
              value={pedido.progresso}
              tone={pedido.progresso >= 100 ? 'success' : 'brand'}
              className="flex-1"
            />
            <span className="numeric text-[13px] font-bold text-ink">
              {Math.round(pedido.progresso)}%
            </span>
          </div>

          <div className="mt-5 flex-1">
            <NextSteps steps={pedido.passos} />
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <AiCallout unusedCount={naoUsadas} />
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-subtle px-4 py-3.5">
      <dt className="text-[11px] font-medium text-ink-faint">{label}</dt>
      <dd className="numeric mt-1 text-xl font-bold text-ink">{value}</dd>
    </div>
  )
}
