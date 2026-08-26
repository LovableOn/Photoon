import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell, PageHeader } from '../components/AppShell'
import {
  Badge,
  Button,
  Card,
  IconButton,
  LinkButton,
  Modal,
  ProgressBar,
  Spinner,
  Toast,
} from '../components/ui'
import { FormField } from '../components/FormField'
import { Icon } from '../components/icons'
import { STATUS_META, formatDate, projectProgress } from '../components/ProjectCard'
import { useStore } from '../lib/store'

export function AlbumDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, photos, thumbUrls, isLoading, updateProject, deleteProject } = useStore()

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? null,
    [projects, projectId],
  )

  const [renameOpen, setRenameOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [picker, setPicker] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function notify(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-primary">
          <Spinner className="size-7" />
        </div>
      </AppShell>
    )
  }

  if (!project) {
    return (
      <AppShell>
        <PageHeader breadcrumb={['Álbuns']} title="Álbum não encontrado" back="/app/albuns" />
        <Card>
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-ink-soft">
              Este álbum não existe ou foi removido.
            </p>
            <LinkButton to="/app/albuns" className="mt-5">
              Voltar aos álbuns
            </LinkButton>
          </div>
        </Card>
      </AppShell>
    )
  }

  const albumPhotos = project.photoIds
    .map((id) => photos.find((photo) => photo.id === id))
    .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo))
  const progress = projectProgress(project)
  const status = STATUS_META[project.status]
  const cover = project.coverPhotoId ? thumbUrls[project.coverPhotoId] : null
  const isFinalized = project.status === 'finalizado'

  async function removePhoto(id: string) {
    if (!project) return
    const photoIds = project.photoIds.filter((photoId) => photoId !== id)
    await updateProject(project.id, {
      photoIds,
      coverPhotoId:
        project.coverPhotoId === id ? (photoIds[0] ?? null) : project.coverPhotoId,
    })
    notify('Foto removida do álbum')
  }

  async function addPickedPhotos() {
    if (!project) return
    const photoIds = [...new Set([...project.photoIds, ...picker])]
    await updateProject(project.id, {
      photoIds,
      coverPhotoId: project.coverPhotoId ?? (photoIds[0] ?? null),
      status: project.status === 'nao-iniciado' ? 'em-edicao' : project.status,
    })
    setPicker(new Set())
    setPhotoPickerOpen(false)
    notify('Fotos adicionadas ao álbum')
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb={['Álbuns', project.name]}
        title={project.name}
        back="/app/albuns"
        actions={
          <>
            <IconButton
              label="Renomear álbum"
              onClick={() => {
                setNewName(project.name)
                setRenameOpen(true)
              }}
            >
              <Icon.Sliders className="size-[18px]" />
            </IconButton>
            <IconButton label="Excluir álbum" tone="danger" onClick={() => setConfirmDelete(true)}>
              <Icon.Trash className="size-[18px]" />
            </IconButton>
            {!isFinalized && (
              <Button
                variant={progress >= 100 ? 'primary' : 'white'}
                onClick={async () => {
                  await updateProject(project.id, {
                    status: project.status === 'pronto' ? 'finalizado' : 'pronto',
                  })
                  notify(
                    project.status === 'pronto'
                      ? 'Álbum finalizado'
                      : 'Álbum marcado como pronto',
                  )
                }}
              >
                {project.status === 'pronto' ? 'Finalizar álbum' : 'Marcar como pronto'}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* painel do álbum */}
        <Card className="h-fit overflow-hidden p-0">
          <div className="aspect-4/3 bg-inset">
            {cover ? (
              <img src={cover} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-ink-faint">
                <Icon.Albums className="size-10" />
              </div>
            )}
          </div>

          <div className="p-6">
            <Badge tone={status.tone}>{status.label}</Badge>

            <dl className="mt-5 space-y-3 text-[13px]">
              <Row label="Produto" value={project.product} />
              <Row label="Formato" value={project.format} />
              <Row label="Páginas" value={`${project.pages}`} />
              <Row label="Fotos" value={`${albumPhotos.length}`} />
              <Row label="Criado em" value={formatDate(project.createdAt)} />
              <Row label="Salvo em" value={formatDate(project.updatedAt)} />
            </dl>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px]">
                <span className="text-ink-faint">Progresso</span>
                <span className="numeric font-semibold text-ink">{progress}%</span>
              </div>
              <ProgressBar value={progress} tone={progress >= 100 ? 'success' : 'brand'} />
              <p className="mt-2 text-[11px] text-ink-faint">
                {albumPhotos.length} de {project.pages} páginas com foto
              </p>
            </div>
          </div>
        </Card>

        {/* fotos do álbum */}
        <Card className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Fotos do álbum</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                {albumPhotos.length === 0
                  ? 'Nenhuma foto neste álbum ainda.'
                  : 'Passe o mouse para definir a capa ou remover.'}
              </p>
            </div>
            {!isFinalized && (
              <Button
                size="sm"
                onClick={() => {
                  setPicker(new Set())
                  setPhotoPickerOpen(true)
                }}
              >
                <Icon.Plus className="size-4" />
                Adicionar fotos
              </Button>
            )}
          </div>

          {albumPhotos.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl bg-subtle px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon.Photos className="size-6" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Álbum vazio</p>
              <p className="mt-1 max-w-xs text-[13px] text-ink-soft">
                Adicione fotos da sua biblioteca para montar as páginas.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {albumPhotos.map((photo) => {
                const isCover = project.coverPhotoId === photo.id
                return (
                  <div
                    key={photo.id}
                    className={`group relative aspect-square overflow-hidden rounded-2xl border-2 ${
                      isCover ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={thumbUrls[photo.id]}
                      alt={photo.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />

                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                        Capa
                      </span>
                    )}

                    {!isFinalized && (
                      <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() =>
                              updateProject(project.id, { coverPhotoId: photo.id })
                            }
                            className="flex-1 rounded-full bg-white/90 py-1 text-[10px] font-semibold text-ink backdrop-blur-sm hover:bg-white"
                          >
                            Capa
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          aria-label="Remover do álbum"
                          className="flex size-6 items-center justify-center rounded-full bg-white/90 text-danger backdrop-blur-sm hover:bg-white"
                        >
                          <Icon.Close className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* renomear */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Renomear álbum"
        footer={
          <>
            <Button variant="white" onClick={() => setRenameOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!newName.trim()) return
                await updateProject(project.id, { name: newName.trim() })
                setRenameOpen(false)
                notify('Nome atualizado')
              }}
            >
              Salvar
            </Button>
          </>
        }
      >
        <FormField
          id="rename"
          label="Nome do álbum"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
      </Modal>

      {/* seletor de fotos */}
      <Modal
        open={photoPickerOpen}
        onClose={() => setPhotoPickerOpen(false)}
        title="Adicionar fotos"
        description="Escolha na sua biblioteca as fotos que entram neste álbum."
        size="xl"
        footer={
          <>
            <Button variant="white" onClick={() => setPhotoPickerOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addPickedPhotos} disabled={picker.size === 0}>
              Adicionar {picker.size > 0 && picker.size}
            </Button>
          </>
        }
      >
        {photos.filter((photo) => !project.photoIds.includes(photo.id)).length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-ink">
              Todas as suas fotos já estão neste álbum
            </p>
            <LinkButton to="/app/fotos" size="sm" variant="white" className="mt-4">
              Enviar mais fotos
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-6">
            {photos
              .filter((photo) => !project.photoIds.includes(photo.id))
              .map((photo) => {
                const isPicked = picker.has(photo.id)
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() =>
                      setPicker((current) => {
                        const next = new Set(current)
                        if (next.has(photo.id)) next.delete(photo.id)
                        else next.add(photo.id)
                        return next
                      })
                    }
                    aria-pressed={isPicked}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      isPicked ? 'border-primary ring-2 ring-primary/25' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={thumbUrls[photo.id]}
                      alt={photo.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    {isPicked && (
                      <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-md bg-primary text-white">
                        <Icon.Check className="size-3" />
                      </span>
                    )}
                  </button>
                )
              })}
          </div>
        )}
      </Modal>

      {/* excluir */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir álbum?"
        description="O álbum será removido. Suas fotos continuam na biblioteca."
        footer={
          <>
            <Button variant="white" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await deleteProject(project.id)
                navigate('/app/albuns', { replace: true })
              }}
            >
              Excluir
            </Button>
          </>
        }
      />

      {toast && <Toast message={toast} />}
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  )
}
