import { Link } from 'react-router-dom'
import { Badge, ProgressBar } from './ui'
import { Icon } from './icons'
import type { Project, ProjectStatus } from '../lib/store'
import { useStore } from '../lib/store'

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' }
> = {
  'nao-iniciado': { label: 'Não iniciado', tone: 'neutral' },
  'em-edicao': { label: 'Em edição', tone: 'brand' },
  pronto: { label: 'Pronto para finalizar', tone: 'success' },
  finalizado: { label: 'Finalizado', tone: 'neutral' },
}

export function projectProgress(project: Project): number {
  if (!project.pages) return 0
  return Math.min(100, Math.round((project.photoIds.length / project.pages) * 100))
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ProjectCard({ project }: { project: Project }) {
  const { thumbUrls } = useStore()
  const cover = project.coverPhotoId ? thumbUrls[project.coverPhotoId] : null
  const status = STATUS_META[project.status]
  const progress = projectProgress(project)

  return (
    <Link
      to={`/app/albuns/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-line/70 bg-surface shadow-float transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-inset">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand/10 text-primary">
            <Icon.Albums className="size-8" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate text-[15px] font-semibold text-ink">{project.name}</h3>
        <p className="mt-0.5 truncate text-xs text-ink-faint">
          {project.product} · {project.format}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
          <span className="numeric">{project.photoIds.length} fotos</span>
          <span className="numeric">{project.pages} páginas</span>
        </div>

        <div className="mt-2.5">
          <ProgressBar value={progress} tone={progress >= 100 ? 'success' : 'brand'} />
        </div>

        <p className="mt-3 text-[11px] text-ink-faint">
          Salvo em {formatDate(project.updatedAt)}
        </p>
      </div>
    </Link>
  )
}
