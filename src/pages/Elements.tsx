import { useMemo, useState } from 'react'
import { AppShell, PageHeader } from '../components/AppShell'
import { Button, Card, Chip, IconButton, Modal, Spinner, Toast } from '../components/ui'
import { Dropzone } from '../components/Dropzone'
import { Icon } from '../components/icons'
import { useStore } from '../lib/store'
import {
  BUILTIN_ELEMENTS,
  ELEMENT_CATEGORIES,
  type ElementCategory,
} from '../lib/builtinElements'

const SWATCHES = [
  { name: 'Azul', value: '#2563eb' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Violeta', value: '#7c3aed' },
  { name: 'Grafite', value: '#0b1220' },
  { name: 'Cinza', value: '#8593a8' },
]

type Tab = 'biblioteca' | 'meus'

export function Elements() {
  const {
    elements,
    elementUrls,
    isLoading,
    addElements,
    toggleElementFavorite,
    deleteElements,
  } = useStore()

  const [tab, setTab] = useState<Tab>('biblioteca')
  const [category, setCategory] = useState<ElementCategory | 'todos'>('todos')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState(SWATCHES[0].value)
  const [uploading, setUploading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<string>(ELEMENT_CATEGORIES[0])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null)

  const builtins = useMemo(() => {
    const term = search.trim().toLowerCase()
    return BUILTIN_ELEMENTS.filter((element) => {
      if (category !== 'todos' && element.category !== category) return false
      if (!term) return true
      return (
        element.name.toLowerCase().includes(term) ||
        element.tags.some((tag) => tag.includes(term))
      )
    })
  }, [category, search])

  const customs = useMemo(() => {
    const term = search.trim().toLowerCase()
    return elements.filter((element) => {
      if (category !== 'todos' && element.category !== category) return false
      if (!term) return true
      return element.name.toLowerCase().includes(term)
    })
  }, [elements, category, search])

  function notify(message: string, tone: 'success' | 'danger' = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleFiles(files: File[]) {
    setUploading(true)
    try {
      const { added, failed } = await addElements(files, uploadCategory)
      if (added) {
        notify(`${added} ${added === 1 ? 'elemento adicionado' : 'elementos adicionados'}`)
        setUploadOpen(false)
        setTab('meus')
      }
      if (failed) {
        notify(
          `${failed} ${failed === 1 ? 'arquivo ignorado' : 'arquivos ignorados'} — use SVG, PNG ou WebP`,
          'danger',
        )
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    await deleteElements([confirmDelete])
    setConfirmDelete(null)
    notify('Elemento removido')
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb={['Biblioteca', 'Elementos']}
        title="Elementos"
        actions={
          <>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-faint">
                <Icon.Search className="size-4" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar elementos"
                className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[13px] text-ink shadow-float transition placeholder:text-ink-faint focus:border-primary focus:outline-none sm:w-56"
              />
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Icon.Plus className="size-4" />
              Novo elemento
            </Button>
          </>
        }
      />

      {/* abas */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-line/70 bg-surface p-1 shadow-float">
          <button
            type="button"
            onClick={() => setTab('biblioteca')}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              tab === 'biblioteca' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Biblioteca Photoon
            <span className="numeric ml-1.5 opacity-60">{BUILTIN_ELEMENTS.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('meus')}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              tab === 'meus' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Meus elementos
            <span className="numeric ml-1.5 opacity-60">{elements.length}</span>
          </button>
        </div>

        {tab === 'biblioteca' && (
          <div className="flex items-center gap-2 rounded-full border border-line/70 bg-surface px-3 py-1.5 shadow-float">
            <span className="text-[12px] font-medium text-ink-faint">Cor</span>
            {SWATCHES.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                onClick={() => setColor(swatch.value)}
                aria-label={swatch.name}
                title={swatch.name}
                className={`size-5 rounded-full transition ${
                  color === swatch.value
                    ? 'ring-2 ring-ink ring-offset-2 ring-offset-white'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: swatch.value }}
              />
            ))}
          </div>
        )}
      </div>

      {/* categorias */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={category === 'todos'} onClick={() => setCategory('todos')}>
          Todos
        </Chip>
        {ELEMENT_CATEGORIES.map((item) => (
          <Chip key={item} active={category === item} onClick={() => setCategory(item)}>
            {item}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-primary">
          <Spinner className="size-7" />
        </div>
      ) : tab === 'biblioteca' ? (
        builtins.length === 0 ? (
          <EmptyResult />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {builtins.map((element) => (
              <div
                key={element.id}
                className="group flex flex-col items-center rounded-[20px] border border-line/70 bg-surface p-4 shadow-float transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div
                  className="flex aspect-square w-full items-center justify-center rounded-2xl bg-subtle p-4"
                  style={{ color }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="size-full"
                    dangerouslySetInnerHTML={{ __html: element.svg }}
                    aria-label={element.name}
                    role="img"
                  />
                </div>
                <p className="mt-3 truncate text-center text-[12px] font-medium text-ink">
                  {element.name}
                </p>
                <p className="truncate text-[11px] text-ink-faint">{element.category}</p>
              </div>
            ))}
          </div>
        )
      ) : customs.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon.Elements className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink">
              Nenhum elemento seu ainda
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
              Envie seus próprios SVGs ou PNGs para usar nos álbuns junto com a
              biblioteca da Photoon.
            </p>
            <Button className="mt-5" onClick={() => setUploadOpen(true)}>
              <Icon.Upload className="size-4" />
              Enviar elemento
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {customs.map((element) => (
            <div
              key={element.id}
              className="group relative flex flex-col items-center rounded-[20px] border border-line/70 bg-surface p-4 shadow-float transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-subtle p-3">
                <img
                  src={elementUrls[element.id]}
                  alt={element.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <IconButton
                  label={element.favorite ? 'Remover dos favoritos' : 'Favoritar'}
                  size="sm"
                  onClick={() => toggleElementFavorite(element.id)}
                  className={element.favorite ? 'text-danger' : ''}
                >
                  <Icon.Heart className="size-3.5" filled={element.favorite} />
                </IconButton>
                <IconButton
                  label="Excluir elemento"
                  size="sm"
                  tone="danger"
                  onClick={() => setConfirmDelete(element.id)}
                >
                  <Icon.Trash className="size-3.5" />
                </IconButton>
              </div>

              <p className="mt-3 w-full truncate text-center text-[12px] font-medium text-ink">
                {element.name}
              </p>
              <p className="truncate text-[11px] text-ink-faint">{element.category}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Novo elemento"
        description="Envie arquivos SVG, PNG ou WebP para a sua biblioteca."
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="uploadCategory"
              className="mb-2 block text-[13px] font-semibold text-ink"
            >
              Categoria
            </label>
            <select
              id="uploadCategory"
              value={uploadCategory}
              onChange={(event) => setUploadCategory(event.target.value)}
              className="h-12 w-full rounded-2xl border border-line bg-subtle px-4 text-sm text-ink focus:border-primary focus:bg-surface focus:outline-none"
            >
              {ELEMENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Dropzone
            onFiles={handleFiles}
            busy={uploading}
            accept="image/svg+xml,image/png,image/webp"
            compact
            icon={<Icon.Upload className="size-5" />}
            title="Arraste os arquivos"
            description="SVG, PNG ou WebP"
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Excluir elemento?"
        description="Ele será removido da sua biblioteca. Esta ação não pode ser desfeita."
        footer={
          <>
            <Button variant="white" onClick={() => setConfirmDelete(null)}>
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

function EmptyResult() {
  return (
    <Card>
      <div className="px-6 py-16 text-center">
        <p className="text-base font-semibold text-ink">Nenhum elemento encontrado</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          Ajuste a busca ou escolha outra categoria.
        </p>
      </div>
    </Card>
  )
}
