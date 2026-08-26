import { useMemo, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, PageHeader } from '../components/AppShell'
import {
  Badge,
  Button,
  Card,
  Chip,
  IconButton,
  Modal,
  Spinner,
  Toast,
} from '../components/ui'
import { Dropzone } from '../components/Dropzone'
import { Icon } from '../components/icons'
import { useFullPhotoUrl, useStore, type Photo } from '../lib/store'
import { formatBytes } from '../lib/images'

type Filter =
  | 'todas'
  | 'favoritas'
  | 'verticais'
  | 'horizontais'
  | 'quadradas'
  | 'panoramicas'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'favoritas', label: 'Favoritas' },
  { id: 'verticais', label: 'Verticais' },
  { id: 'horizontais', label: 'Horizontais' },
  { id: 'quadradas', label: 'Quadradas' },
  { id: 'panoramicas', label: 'Panorâmicas' },
]

type SortKey = 'recentes' | 'nome' | 'tamanho'

const ORIENTATION_LABEL: Record<Photo['orientation'], string> = {
  vertical: 'Vertical',
  horizontal: 'Horizontal',
  quadrada: 'Quadrada',
  panoramica: 'Panorâmica',
}

export function Photos() {
  const navigate = useNavigate()
  const {
    photos,
    thumbUrls,
    isLoading,
    addPhotos,
    togglePhotoFavorite,
    deletePhotos,
  } = useStore()

  const [filter, setFilter] = useState<Filter>('todas')
  const [sort, setSort] = useState<SortKey>('recentes')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<Photo | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = photos.filter((photo) => {
      if (term && !photo.name.toLowerCase().includes(term)) return false
      switch (filter) {
        case 'favoritas':
          return photo.favorite
        case 'verticais':
          return photo.orientation === 'vertical'
        case 'horizontais':
          return photo.orientation === 'horizontal'
        case 'quadradas':
          return photo.orientation === 'quadrada'
        case 'panoramicas':
          return photo.orientation === 'panoramica'
        default:
          return true
      }
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'nome') return a.name.localeCompare(b.name, 'pt-BR')
      if (sort === 'tamanho') return b.size - a.size
      return b.createdAt - a.createdAt
    })
  }, [photos, filter, sort, search])

  function notify(message: string, tone: 'success' | 'danger' = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleFiles(files: File[]) {
    setUploading(true)
    try {
      const { added, failed } = await addPhotos(files)
      if (added) {
        notify(`${added} ${added === 1 ? 'foto adicionada' : 'fotos adicionadas'}`)
      }
      if (failed) {
        notify(
          `${failed} ${failed === 1 ? 'arquivo ignorado' : 'arquivos ignorados'} — envie apenas imagens`,
          'danger',
        )
      }
    } finally {
      setUploading(false)
    }
  }

  function toggleSelection(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDelete() {
    const ids = [...selected]
    await deletePhotos(ids)
    setSelected(new Set())
    setConfirmDelete(false)
    notify(`${ids.length} ${ids.length === 1 ? 'foto removida' : 'fotos removidas'}`)
  }

  async function favoriteSelected() {
    for (const id of selected) await togglePhotoFavorite(id)
    notify('Favoritas atualizadas')
    setSelected(new Set())
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length) handleFiles(files)
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb={['Biblioteca', 'Fotos']}
        title="Minhas fotos"
        actions={
          <>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-faint">
                <Icon.Search className="size-4" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome"
                className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[13px] text-ink shadow-float transition placeholder:text-ink-faint focus:border-primary focus:outline-none sm:w-56"
              />
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="h-10 rounded-full border border-line bg-surface px-4 text-[13px] font-medium text-ink-soft shadow-float focus:border-primary focus:outline-none"
              aria-label="Ordenar fotos"
            >
              <option value="recentes">Mais recentes</option>
              <option value="nome">Nome</option>
              <option value="tamanho">Tamanho</option>
            </select>
            <Button loading={uploading} onClick={() => fileInputRef.current?.click()}>
              <Icon.Upload className="size-4" />
              Enviar fotos
            </Button>
          </>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) handleFiles(files)
          event.target.value = ''
        }}
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-primary">
          <Spinner className="size-7" />
        </div>
      ) : photos.length === 0 ? (
        <Dropzone
          onFiles={handleFiles}
          busy={uploading}
          accept="image/*"
          icon={<Icon.Upload className="size-6" />}
          title="Arraste suas fotos aqui"
          description="Ou clique para escolher os arquivos. Aceitamos JPG, PNG, WebP e AVIF."
        />
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false)
            }
          }}
          onDrop={handleDrop}
          className="relative"
        >
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => (
              <Chip
                key={item.id}
                active={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                {item.id === 'todas' && (
                  <span className="numeric opacity-60">{photos.length}</span>
                )}
              </Chip>
            ))}
            <p className="ml-auto hidden text-[13px] text-ink-faint sm:block">
              Arraste fotos para qualquer lugar desta área para enviar
            </p>
          </div>

          {/* sobreposição durante o arraste */}
          {dragging && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[24px] border-2 border-dashed border-primary bg-primary-soft/80 backdrop-blur-sm">
              <div className="text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-white">
                  <Icon.Upload className="size-6" />
                </span>
                <p className="mt-3 text-base font-semibold text-ink">
                  Solte para enviar
                </p>
              </div>
            </div>
          )}

          {visible.length === 0 ? (
            <Card>
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-ink">
                  Nenhuma foto encontrada
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Ajuste a busca ou escolha outro filtro.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((photo) => {
                const isSelected = selected.has(photo.id)
                return (
                  <div
                    key={photo.id}
                    className={`group relative overflow-hidden rounded-[20px] border bg-surface shadow-float transition ${
                      isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-line/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPreview(photo)}
                      className="block aspect-square w-full overflow-hidden bg-inset"
                      aria-label={`Ver ${photo.name}`}
                    >
                      <img
                        src={thumbUrls[photo.id]}
                        alt={photo.name}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-[1.05]"
                      />
                    </button>

                    {/* seleção */}
                    <button
                      type="button"
                      onClick={() => toggleSelection(photo.id)}
                      aria-label={isSelected ? 'Desmarcar foto' : 'Selecionar foto'}
                      className={`absolute top-2.5 left-2.5 flex size-6 items-center justify-center rounded-lg border-2 transition ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-white/80 bg-black/20 text-transparent opacity-0 backdrop-blur-sm group-hover:opacity-100'
                      }`}
                    >
                      <Icon.Check className="size-3.5" />
                    </button>

                    {/* favorita */}
                    <button
                      type="button"
                      onClick={() => togglePhotoFavorite(photo.id)}
                      aria-label={photo.favorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
                      className={`absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition ${
                        photo.favorite
                          ? 'bg-white/90 text-danger'
                          : 'bg-black/25 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Icon.Heart className="size-4" filled={photo.favorite} />
                    </button>

                    <div className="px-3 py-2.5">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {photo.name}
                      </p>
                      <p className="numeric mt-0.5 text-[11px] text-ink-faint">
                        {photo.width}×{photo.height} · {formatBytes(photo.size)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* barra fixa de seleção múltipla */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-2 pl-5 shadow-lift">
            <span className="numeric text-[13px] font-semibold text-ink">
              {selected.size} {selected.size === 1 ? 'selecionada' : 'selecionadas'}
            </span>
            <span className="mx-1 h-5 w-px bg-line" />
            <Button size="sm" variant="ghost" onClick={favoriteSelected}>
              <Icon.Heart className="size-4" />
              Favoritar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                navigate('/app/albuns/novo', { state: { photoIds: [...selected] } })
              }
            >
              <Icon.Albums className="size-4" />
              Criar álbum
            </Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
              <Icon.Trash className="size-4" />
              Excluir
            </Button>
            <IconButton label="Limpar seleção" size="sm" onClick={() => setSelected(new Set())}>
              <Icon.Close className="size-4" />
            </IconButton>
          </div>
        </div>
      )}

      <PhotoPreview photo={preview} onClose={() => setPreview(null)} />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir fotos?"
        description={`${selected.size} ${selected.size === 1 ? 'foto será removida' : 'fotos serão removidas'} da sua biblioteca e dos álbuns que as usam. Esta ação não pode ser desfeita.`}
        footer={
          <>
            <Button variant="white" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </>
        }
      />

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </AppShell>
  )
}

function PhotoPreview({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  const url = useFullPhotoUrl(photo)
  const { togglePhotoFavorite } = useStore()

  if (!photo) return null

  return (
    <Modal open onClose={onClose} title={photo.name} size="xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-inset">
          {url ? (
            <img src={url} alt={photo.name} className="max-h-[62vh] w-auto object-contain" />
          ) : (
            <div className="flex h-64 items-center justify-center text-primary">
              <Spinner />
            </div>
          )}
        </div>

        <div>
          <dl className="space-y-3 text-sm">
            <Meta label="Dimensões" value={`${photo.width} × ${photo.height} px`} />
            <Meta label="Orientação" value={ORIENTATION_LABEL[photo.orientation]} />
            <Meta label="Tamanho" value={formatBytes(photo.size)} />
            <Meta
              label="Adicionada em"
              value={new Date(photo.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            />
          </dl>

          <div className="mt-5">
            <Badge tone={photo.favorite ? 'danger' : 'neutral'}>
              {photo.favorite ? 'Favorita' : 'Não favoritada'}
            </Badge>
          </div>

          <Button
            variant="white"
            block
            className="mt-4"
            onClick={() => togglePhotoFavorite(photo.id)}
          >
            <Icon.Heart className="size-4" filled={photo.favorite} />
            {photo.favorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
      <dt className="text-[13px] text-ink-faint">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-ink">{value}</dd>
    </div>
  )
}
