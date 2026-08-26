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
import { Icon } from '../components/icons'
import { useFullPhotoUrl, useStore, type Photo } from '../lib/store'
import { formatBytes } from '../lib/images'
import { computeSignature, signatureDistance, similarityScore } from '../lib/similarity'

type Filter =
  | 'todas'
  | 'loja'
  | 'minhas'
  | 'favoritas'
  | 'nao-usadas'
  | 'verticais'
  | 'horizontais'
  | 'quadradas'
  | 'panoramicas'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'loja', label: 'Da loja' },
  { id: 'minhas', label: 'Minhas' },
  { id: 'favoritas', label: 'Favoritas' },
  { id: 'nao-usadas', label: 'Não usadas' },
  { id: 'verticais', label: 'Verticais' },
  { id: 'horizontais', label: 'Horizontais' },
  { id: 'quadradas', label: 'Quadradas' },
  { id: 'panoramicas', label: 'Panorâmicas' },
]

type SortKey = 'recentes' | 'nome' | 'tamanho' | 'resolucao'
type ViewMode = 'grande' | 'pequena' | 'lista'

const ORIENTATION_LABEL: Record<Photo['orientation'], string> = {
  vertical: 'Vertical',
  horizontal: 'Horizontal',
  quadrada: 'Quadrada',
  panoramica: 'Panorâmica',
}

interface Ranked {
  photo: Photo
  score: number
}

export function Photos() {
  const navigate = useNavigate()
  const {
    photos,
    projects,
    thumbUrls,
    isLoading,
    seeding,
    addPhotos,
    togglePhotoFavorite,
    deletePhotos,
  } = useStore()

  const [filter, setFilter] = useState<Filter>('todas')
  const [moment, setMoment] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('recentes')
  const [view, setView] = useState<ViewMode>('grande')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<Photo | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null)
  const [dragging, setDragging] = useState(false)

  // busca por semelhança
  const [reference, setReference] = useState<{ url: string; name: string } | null>(null)
  const [ranked, setRanked] = useState<Ranked[] | null>(null)
  const [searching, setSearching] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const referenceInputRef = useRef<HTMLInputElement | null>(null)

  /** Fotos já usadas em alguma lâmina de algum álbum. */
  const usedIds = useMemo(() => {
    const used = new Set<string>()
    for (const project of projects) {
      for (const spread of project.spreads ?? []) {
        for (const frame of spread.frames) if (frame.photoId) used.add(frame.photoId)
      }
    }
    return used
  }, [projects])

  const moments = useMemo(() => {
    const lista = new Set<string>()
    for (const photo of photos) if (photo.moment) lista.add(photo.moment)
    return [...lista]
  }, [photos])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    const filtered = photos.filter((photo) => {
      if (term && !photo.name.toLowerCase().includes(term)) return false
      if (moment && photo.moment !== moment) return false
      switch (filter) {
        case 'loja':
          return photo.origin === 'loja'
        case 'minhas':
          return photo.origin === 'propria'
        case 'favoritas':
          return photo.favorite
        case 'nao-usadas':
          return !usedIds.has(photo.id)
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

    // Com uma referência na mão, a ordem é a afinidade — o resto é ignorado.
    if (ranked) {
      const posicao = new Map(ranked.map((item, index) => [item.photo.id, index]))
      return [...filtered].sort(
        (a, b) => (posicao.get(a.id) ?? 1e9) - (posicao.get(b.id) ?? 1e9),
      )
    }

    return [...filtered].sort((a, b) => {
      if (sort === 'nome') return a.name.localeCompare(b.name, 'pt-BR')
      if (sort === 'tamanho') return b.size - a.size
      if (sort === 'resolucao') return b.width * b.height - a.width * a.height
      return b.createdAt - a.createdAt
    })
  }, [photos, filter, moment, sort, search, usedIds, ranked])

  const scoreOf = useMemo(() => {
    if (!ranked) return null
    return new Map(ranked.map((item) => [item.photo.id, item.score]))
  }, [ranked])

  function notify(message: string, tone: 'success' | 'danger' = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3200)
  }

  async function handleFiles(files: File[]) {
    setUploading(true)
    try {
      const { added, failed } = await addPhotos(files)
      if (added) notify(`${added} ${added === 1 ? 'foto enviada' : 'fotos enviadas'}`)
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

  /** Busca por semelhança: assina a referência e ranqueia a biblioteca. */
  async function handleReference(file: File) {
    setSearching(true)
    try {
      const assinatura = await computeSignature(file)
      const resultado: Ranked[] = photos
        .filter((photo) => photo.signature?.length)
        .map((photo) => ({
          photo,
          score: similarityScore(signatureDistance(assinatura, photo.signature)),
        }))
        .sort((a, b) => b.score - a.score)

      if (reference) URL.revokeObjectURL(reference.url)
      setReference({ url: URL.createObjectURL(file), name: file.name })
      setRanked(resultado)
      setFilter('todas')
      setMoment(null)
      notify(`${resultado.length} fotos ordenadas por semelhança`)
    } catch {
      notify('Não foi possível ler a foto de referência.', 'danger')
    } finally {
      setSearching(false)
    }
  }

  function clearReference() {
    if (reference) URL.revokeObjectURL(reference.url)
    setReference(null)
    setRanked(null)
  }

  function toggleSelection(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /**
   * O cliente só apaga o que ele mesmo enviou. Foto da loja é arquivo do
   * lojista — some do álbum, não da galeria.
   */
  const selectedOwn = useMemo(
    () =>
      [...selected].filter(
        (id) => photos.find((photo) => photo.id === id)?.origin === 'propria',
      ),
    [selected, photos],
  )

  async function handleDelete() {
    await deletePhotos(selectedOwn)
    setSelected(new Set())
    setConfirmDelete(false)
    notify(
      `${selectedOwn.length} ${selectedOwn.length === 1 ? 'foto removida' : 'fotos removidas'}`,
    )
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
                className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[13px] text-ink transition placeholder:text-ink-faint focus:border-primary focus:outline-none sm:w-52"
              />
            </div>

            <ViewSwitch view={view} onChange={setView} />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              disabled={Boolean(ranked)}
              className="h-10 rounded-full border border-line bg-surface px-4 text-[13px] font-medium text-ink-soft focus:border-primary focus:outline-none disabled:opacity-50"
              aria-label="Ordenar fotos"
            >
              <option value="recentes">Mais recentes</option>
              <option value="nome">Nome</option>
              <option value="tamanho">Tamanho</option>
              <option value="resolucao">Resolução</option>
            </select>

            <Button loading={uploading} onClick={() => fileInputRef.current?.click()}>
              <Icon.Upload className="size-4" />
              Enviar minhas fotos
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
      <input
        ref={referenceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleReference(file)
          event.target.value = ''
        }}
      />

      {/* busca por semelhança */}
      <SimilarityBar
        reference={reference}
        searching={searching}
        resultCount={ranked?.length ?? 0}
        onPick={() => referenceInputRef.current?.click()}
        onClear={clearReference}
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-primary">
          <Spinner className="size-7" />
        </div>
      ) : photos.length === 0 && !seeding ? (
        <Card>
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon.Photos className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink">
              Nenhuma foto liberada ainda
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
              Assim que a loja liberar sua galeria, as fotos aparecem aqui. Você
              também pode enviar fotos suas para completar o álbum.
            </p>
            <Button className="mt-5" onClick={() => fileInputRef.current?.click()}>
              <Icon.Upload className="size-4" />
              Enviar minhas fotos
            </Button>
          </div>
        </Card>
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
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => {
              const count =
                item.id === 'todas'
                  ? photos.length
                  : item.id === 'loja'
                    ? photos.filter((photo) => photo.origin === 'loja').length
                    : item.id === 'minhas'
                      ? photos.filter((photo) => photo.origin === 'propria').length
                      : undefined
              return (
                <Chip
                  key={item.id}
                  active={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                  {count !== undefined && <span className="numeric opacity-60">{count}</span>}
                </Chip>
              )
            })}
          </div>

          {moments.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-medium text-ink-faint">Momento</span>
              <Chip
                active={moment === null}
                onClick={() => setMoment(null)}
                className="h-8 px-3 text-[12px]"
              >
                Todos
              </Chip>
              {moments.map((item) => (
                <Chip
                  key={item}
                  active={moment === item}
                  onClick={() => setMoment(item)}
                  className="h-8 px-3 text-[12px]"
                >
                  {item}
                </Chip>
              ))}
            </div>
          )}

          {seeding && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3.5">
              <Spinner className="size-4 text-primary" />
              <p className="text-[13px] text-ink-soft">
                A loja está liberando sua galeria — {seeding.done} de {seeding.total}{' '}
                fotos prontas.
              </p>
            </div>
          )}

          {dragging && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[24px] border-2 border-dashed border-primary bg-primary-soft/80 backdrop-blur-sm">
              <div className="text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-white">
                  <Icon.Upload className="size-6" />
                </span>
                <p className="mt-3 text-base font-semibold text-ink">Solte para enviar</p>
              </div>
            </div>
          )}

          {visible.length === 0 ? (
            <Card>
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-ink">Nenhuma foto encontrada</p>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Ajuste a busca ou escolha outro filtro.
                </p>
              </div>
            </Card>
          ) : view === 'lista' ? (
            <PhotoList
              photos={visible}
              thumbUrls={thumbUrls}
              selected={selected}
              usedIds={usedIds}
              scoreOf={scoreOf}
              onToggle={toggleSelection}
              onOpen={setPreview}
              onFavorite={togglePhotoFavorite}
            />
          ) : (
            <PhotoGrid
              photos={visible}
              thumbUrls={thumbUrls}
              selected={selected}
              scoreOf={scoreOf}
              dense={view === 'pequena'}
              onToggle={toggleSelection}
              onOpen={setPreview}
              onFavorite={togglePhotoFavorite}
            />
          )}
        </div>
      )}

      {/* barra de seleção múltipla */}
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
            <Button
              size="sm"
              variant="danger"
              disabled={selectedOwn.length === 0}
              title={
                selectedOwn.length === 0
                  ? 'Fotos da loja não podem ser excluídas por aqui'
                  : undefined
              }
              onClick={() => setConfirmDelete(true)}
            >
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
        description={`${selectedOwn.length} ${
          selectedOwn.length === 1 ? 'foto enviada por você será removida' : 'fotos enviadas por você serão removidas'
        }. Fotos da loja não são apagadas por aqui.`}
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

/* ------------------------------------------------------- modo de exibição */

function ViewSwitch({
  view,
  onChange,
}: {
  view: ViewMode
  onChange: (view: ViewMode) => void
}) {
  const options: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'grande',
      label: 'Miniaturas grandes',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" />
          <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'pequena',
      label: 'Miniaturas pequenas',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
          {[2.5, 7.5, 12.5].map((x) =>
            [2.5, 7.5, 12.5].map((y) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" />
            )),
          )}
        </svg>
      ),
    },
    {
      id: 'lista',
      label: 'Lista',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <rect x="2.5" y="3.5" width="15" height="2.6" rx="1.3" />
          <rect x="2.5" y="8.7" width="15" height="2.6" rx="1.3" />
          <rect x="2.5" y="13.9" width="15" height="2.6" rx="1.3" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-subtle p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          title={option.label}
          aria-label={option.label}
          aria-pressed={view === option.id}
          className={`flex size-8 items-center justify-center rounded-full transition ${
            view === option.id
              ? 'bg-ink text-white'
              : 'text-ink-faint hover:bg-white hover:text-ink'
          }`}
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}

/* --------------------------------------------------- busca por semelhança */

function SimilarityBar({
  reference,
  searching,
  resultCount,
  onPick,
  onClear,
}: {
  reference: { url: string; name: string } | null
  searching: boolean
  resultCount: number
  onPick: () => void
  onClear: () => void
}) {
  if (!reference) {
    return (
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon.Search className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">Procurar por uma pessoa</p>
          <p className="text-[12px] text-ink-soft">
            Envie uma foto de referência e a galeria se reordena pelas mais
            parecidas — mesma cena, mesma luz, mesmo momento.
          </p>
        </div>
        <Button size="sm" variant="white" loading={searching} onClick={onPick}>
          Enviar referência
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/25 bg-primary-soft/40 px-4 py-3">
      <img
        src={reference.url}
        alt=""
        className="size-12 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">
          Ordenado por semelhança com {reference.name}
        </p>
        <p className="text-[12px] text-ink-soft">
          {resultCount} fotos comparadas · as mais parecidas vêm primeiro
        </p>
      </div>
      <Button size="sm" variant="white" onClick={onPick}>
        Trocar referência
      </Button>
      <IconButton label="Limpar busca" size="sm" onClick={onClear}>
        <Icon.Close className="size-4" />
      </IconButton>
    </div>
  )
}

/* -------------------------------------------------------------- grade */

interface ListProps {
  photos: Photo[]
  thumbUrls: Record<string, string>
  selected: Set<string>
  scoreOf: Map<string, number> | null
  onToggle: (id: string) => void
  onOpen: (photo: Photo) => void
  onFavorite: (id: string) => void
}

function PhotoGrid({
  photos,
  thumbUrls,
  selected,
  scoreOf,
  dense,
  onToggle,
  onOpen,
  onFavorite,
}: ListProps & { dense?: boolean }) {
  return (
    <div
      className={`grid gap-2.5 ${
        dense
          ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}
    >
      {photos.map((photo) => {
        const isSelected = selected.has(photo.id)
        const score = scoreOf?.get(photo.id)
        return (
          <div
            key={photo.id}
            className={`group relative overflow-hidden rounded-2xl border bg-surface transition ${
              isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-line/70'
            }`}
          >
            <button
              type="button"
              onClick={() => onOpen(photo)}
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

            <button
              type="button"
              onClick={() => onToggle(photo.id)}
              aria-label={isSelected ? 'Desmarcar foto' : 'Selecionar foto'}
              className={`absolute top-2 left-2 flex size-6 items-center justify-center rounded-lg border-2 transition ${
                isSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-white/80 bg-black/20 text-transparent opacity-0 backdrop-blur-sm group-hover:opacity-100'
              }`}
            >
              <Icon.Check className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onFavorite(photo.id)}
              aria-label={photo.favorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
              className={`absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition ${
                photo.favorite
                  ? 'bg-white/90 text-danger'
                  : 'bg-black/25 text-white opacity-0 group-hover:opacity-100'
              }`}
            >
              <Icon.Heart className="size-4" filled={photo.favorite} />
            </button>

            {score !== undefined && (
              <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                {score}% parecida
              </span>
            )}

            {!dense && (
              <div className="px-3 py-2.5">
                <p className="truncate text-[13px] font-medium text-ink">{photo.name}</p>
                <p className="numeric mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
                  {photo.origin === 'loja' ? 'Da loja' : 'Minha'} ·{' '}
                  {photo.width}×{photo.height}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------- lista */

function PhotoList({
  photos,
  thumbUrls,
  selected,
  usedIds,
  scoreOf,
  onToggle,
  onOpen,
  onFavorite,
}: ListProps & { usedIds: Set<string> }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="divide-y divide-line">
        {photos.map((photo) => {
          const isSelected = selected.has(photo.id)
          const score = scoreOf?.get(photo.id)
          return (
            <div
              key={photo.id}
              className={`flex items-center gap-3 px-3 py-2.5 transition sm:px-4 ${
                isSelected ? 'bg-primary-soft/40' : 'hover:bg-subtle'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(photo.id)}
                aria-label={isSelected ? 'Desmarcar foto' : 'Selecionar foto'}
                className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-line text-transparent hover:border-primary'
                }`}
              >
                <Icon.Check className="size-3" />
              </button>

              <button
                type="button"
                onClick={() => onOpen(photo)}
                className="size-11 shrink-0 overflow-hidden rounded-lg bg-inset"
                aria-label={`Ver ${photo.name}`}
              >
                <img
                  src={thumbUrls[photo.id]}
                  alt={photo.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{photo.name}</p>
                <p className="numeric truncate text-[11px] text-ink-faint">
                  {photo.width}×{photo.height} · {formatBytes(photo.size)}
                  {photo.moment ? ` · ${photo.moment}` : ''}
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                {score !== undefined && <Badge tone="brand">{score}%</Badge>}
                <Badge tone={photo.origin === 'loja' ? 'neutral' : 'brand'}>
                  {photo.origin === 'loja' ? 'Da loja' : 'Minha'}
                </Badge>
                <Badge tone="neutral">{ORIENTATION_LABEL[photo.orientation]}</Badge>
                {usedIds.has(photo.id) && <Badge tone="success">Em uso</Badge>}
              </div>

              <button
                type="button"
                onClick={() => onFavorite(photo.id)}
                aria-label={photo.favorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
                className={`flex size-8 shrink-0 items-center justify-center rounded-full transition ${
                  photo.favorite ? 'text-danger' : 'text-ink-faint hover:text-ink'
                }`}
              >
                <Icon.Heart className="size-4" filled={photo.favorite} />
              </button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------ preview */

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
            <Meta label="Origem" value={photo.origin === 'loja' ? 'Liberada pela loja' : 'Enviada por você'} />
            {photo.gallery && <Meta label="Galeria" value={photo.gallery} />}
            {photo.moment && <Meta label="Momento" value={photo.moment} />}
            <Meta label="Dimensões" value={`${photo.width} × ${photo.height} px`} />
            <Meta label="Orientação" value={ORIENTATION_LABEL[photo.orientation]} />
            <Meta label="Tamanho" value={formatBytes(photo.size)} />
          </dl>

          <Button
            variant="white"
            block
            className="mt-5"
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
