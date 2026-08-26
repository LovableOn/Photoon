import { useMemo, useState } from 'react'
import { AppShell, PageHeader } from '../components/AppShell'
import { Card, Chip, LinkButton, Spinner } from '../components/ui'
import { ProjectCard } from '../components/ProjectCard'
import { Icon } from '../components/icons'
import { useStore, type ProjectStatus } from '../lib/store'

const FILTERS: { id: ProjectStatus | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'nao-iniciado', label: 'Não iniciados' },
  { id: 'em-edicao', label: 'Em edição' },
  { id: 'pronto', label: 'Prontos' },
  { id: 'finalizado', label: 'Finalizados' },
]

export function Albums() {
  const { projects, isLoading } = useStore()
  const [filter, setFilter] = useState<ProjectStatus | 'todos'>('todos')
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return projects.filter((project) => {
      if (filter !== 'todos' && project.status !== filter) return false
      if (term && !project.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [projects, filter, search])

  return (
    <AppShell>
      <PageHeader
        breadcrumb={['Biblioteca', 'Álbuns']}
        title="Meus álbuns"
        actions={
          <>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-faint">
                <Icon.Search className="size-4" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar álbum"
                className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[13px] text-ink shadow-float transition placeholder:text-ink-faint focus:border-primary focus:outline-none sm:w-56"
              />
            </div>
            <LinkButton to="/app/albuns/novo">
              <Icon.Plus className="size-4" />
              Novo álbum
            </LinkButton>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const count =
            item.id === 'todos'
              ? projects.length
              : projects.filter((project) => project.status === item.id).length
          return (
            <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label}
              <span className="numeric opacity-60">{count}</span>
            </Chip>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-primary">
          <Spinner className="size-7" />
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon.Albums className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink">
              {projects.length === 0 ? 'Nenhum álbum ainda' : 'Nenhum álbum encontrado'}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
              {projects.length === 0
                ? 'Crie seu primeiro álbum a partir das fotos da sua biblioteca.'
                : 'Ajuste a busca ou escolha outro filtro.'}
            </p>
            {projects.length === 0 && (
              <LinkButton to="/app/albuns/novo" className="mt-5">
                Criar álbum
              </LinkButton>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
