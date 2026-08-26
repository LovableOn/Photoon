import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, IconButton, Modal, Spinner, Toast } from '../components/ui'
import { Icon } from '../components/icons'
import { LogoMark } from '../components/Logo'
import { SpreadView } from '../components/editor/SpreadView'
import { Inspector } from '../components/editor/Inspector'
import { Storyboard } from '../components/editor/Storyboard'
import {
  AssistPanel,
  BackgroundsPanel,
  ElementsPanel,
  LayoutsPanel,
  PhotosPanel,
  TextPanel,
} from '../components/editor/panels'
import { useStore } from '../lib/store'
import {
  emptyFrames,
  makeElement,
  makeFrame,
  makeSpread,
  pageAspect,
  spreadAspect,
  type ElementItem,
  type Frame,
  type Selection,
  type Spread,
  type TextBox,
} from '../lib/editorTypes'
import { applyLayout, suggestLayout, type Layout } from '../lib/layouts'
import { checkAlbum, checkSpread, spreadWidthMm, type Issue } from '../lib/checks'

type PanelId = 'fotos' | 'layouts' | 'texto' | 'fundos' | 'elementos' | 'assistencia'

const RAIL: { id: PanelId; label: string; icon: React.ReactNode }[] = [
  { id: 'fotos', label: 'Fotos', icon: <Icon.Photos className="size-[18px]" /> },
  { id: 'layouts', label: 'Layouts', icon: <Icon.Elements className="size-[18px]" /> },
  { id: 'texto', label: 'Texto', icon: <TextIcon /> },
  { id: 'fundos', label: 'Fundos', icon: <Icon.Albums className="size-[18px]" /> },
  { id: 'elementos', label: 'Elementos', icon: <Icon.Sparkle className="size-[18px]" /> },
  { id: 'assistencia', label: 'Assistência', icon: <Icon.Sliders className="size-[18px]" /> },
]

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 6h14M12 6v13M9 19h6" />
    </svg>
  )
}

export function Editor() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, photos, thumbUrls, elements, elementUrls, isLoading, updateProject } =
    useStore()

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? null,
    [projects, projectId],
  )

  const [spreads, setSpreads] = useState<Spread[]>([])
  const [current, setCurrent] = useState(0)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [panel, setPanel] = useState<PanelId | null>('fotos')
  const [zoom, setZoom] = useState(100)
  const [past, setPast] = useState<Spread[][]>([])
  const [future, setFuture] = useState<Spread[][]>([])
  const [saveState, setSaveState] = useState<'salvo' | 'salvando'>('salvo')
  const [storyOpen, setStoryOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [allPagesOpen, setAllPagesOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [area, setArea] = useState({ width: 0, height: 0 })
  const loadedFor = useRef<string | null>(null)
  const areaObserver = useRef<ResizeObserver | null>(null)

  /**
   * Ref por callback, não por efeito: enquanto o store carrega, a tela mostra
   * só o spinner e o elemento do canvas nem existe. Um efeito de montagem
   * rodaria cedo demais e nunca observaria nada — o canvas ficava em branco
   * depois de recarregar a página.
   */
  const areaRef = useCallback((node: HTMLDivElement | null) => {
    areaObserver.current?.disconnect()
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setArea({ width, height })
    })
    observer.observe(node)
    areaObserver.current = observer
    const bounds = node.getBoundingClientRect()
    setArea({ width: bounds.width, height: bounds.height })
  }, [])

  /* ------------------------------------------------------- carregar */

  useEffect(() => {
    if (!project || loadedFor.current === project.id) return
    loadedFor.current = project.id
    setSpreads(project.spreads ?? [])
    setName(project.name)
  }, [project])

  useEffect(() => () => areaObserver.current?.disconnect(), [])

  // Selecionar um objeto abre o inspetor: é ali que estão as propriedades dele.
  useEffect(() => {
    if (selection) setInspectorOpen(true)
  }, [selection])

  /* --------------------------------------------------------- salvar */

  const dirty = useRef(false)

  useEffect(() => {
    if (!project || !dirty.current) return
    setSaveState('salvando')
    const timer = setTimeout(() => {
      const cover = spreads[0]?.frames[0]?.photoId ?? project.coverPhotoId
      const usadas = new Set<string>()
      for (const spread of spreads) {
        for (const frame of spread.frames) if (frame.photoId) usadas.add(frame.photoId)
      }
      void updateProject(project.id, {
        spreads,
        coverPhotoId: cover,
        photoIds: [...new Set([...project.photoIds, ...usadas])],
        status: project.status === 'nao-iniciado' ? 'em-edicao' : project.status,
      }).then(() => setSaveState('salvo'))
      dirty.current = false
    }, 700)
    return () => clearTimeout(timer)
  }, [spreads, project, updateProject])

  /* ------------------------------------------------------- histórico */

  const commit = useCallback(
    (next: Spread[]) => {
      setPast((stack) => [...stack.slice(-49), spreads])
      setFuture([])
      setSpreads(next)
      dirty.current = true
    },
    [spreads],
  )

  const undo = useCallback(() => {
    setPast((stack) => {
      if (!stack.length) return stack
      const previous = stack[stack.length - 1]
      setFuture((f) => [spreads, ...f])
      setSpreads(previous)
      dirty.current = true
      return stack.slice(0, -1)
    })
  }, [spreads])

  const redo = useCallback(() => {
    setFuture((stack) => {
      if (!stack.length) return stack
      const [next, ...rest] = stack
      setPast((p) => [...p, spreads])
      setSpreads(next)
      dirty.current = true
      return rest
    })
  }, [spreads])

  /* ----------------------------------------------------- derivados */

  const spread = spreads[current] ?? null
  const photoMap = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos])

  const usage = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of spreads) {
      for (const frame of item.frames) {
        if (frame.photoId) map.set(frame.photoId, (map.get(frame.photoId) ?? 0) + 1)
      }
    }
    return map
  }, [spreads])

  const unusedPhotos = useMemo(
    () => photos.filter((photo) => !usage.get(photo.id)),
    [photos, usage],
  )

  const format = project?.format ?? '20×20 quadrado'
  const aspect = spreadAspect(format)
  const coverAspect = pageAspect(format)

  const gapFor = useCallback(
    (item: Spread) => {
      const larguraMm = spreadWidthMm(format)
      const alturaMm = larguraMm / spreadAspect(format)
      return {
        gapX: (item.gapH / larguraMm) * 100,
        gapY: (item.gapV / alturaMm) * 100,
      }
    },
    [format],
  )

  const spreadIssues = useMemo(
    () => (spread ? checkSpread(spread, current, photoMap, format) : []),
    [spread, current, photoMap, format],
  )

  const albumIssues = useMemo(
    () => checkAlbum(spreads, photoMap, format),
    [spreads, photoMap, format],
  )

  const blockers = albumIssues.filter((issue) => issue.level === 'bloqueador')

  /* ------------------------------------------------------- edições */

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2600)
  }

  const updateCurrent = useCallback(
    (update: (item: Spread) => Spread) => {
      if (!spread) return
      commit(spreads.map((item, index) => (index === current ? update(item) : item)))
    },
    [commit, current, spread, spreads],
  )

  const updateFrame = useCallback(
    (id: string, patch: Partial<Frame>) => {
      updateCurrent((item) => ({
        ...item,
        frames: item.frames.map((frame) => (frame.id === id ? { ...frame, ...patch } : frame)),
      }))
    },
    [updateCurrent],
  )

  const updateText = useCallback(
    (id: string, patch: Partial<TextBox>) => {
      updateCurrent((item) => ({
        ...item,
        texts: item.texts.map((text) => (text.id === id ? { ...text, ...patch } : text)),
      }))
    },
    [updateCurrent],
  )

  const updateElement = useCallback(
    (id: string, patch: Partial<ElementItem>) => {
      updateCurrent((item) => ({
        ...item,
        elements: item.elements.map((element) =>
          element.id === id ? { ...element, ...patch } : element,
        ),
      }))
    },
    [updateCurrent],
  )

  function placePhoto(photoId: string) {
    if (!spread) return
    const alvo =
      (selection?.kind === 'frame' && spread.frames.find((f) => f.id === selection.id)) ||
      spread.frames.find((frame) => !frame.photoId)

    if (!alvo) {
      notify('Nenhum quadro livre nesta lâmina — escolha um layout com mais fotos.')
      return
    }
    updateFrame(alvo.id, { photoId, zoom: 100, offsetX: 0, offsetY: 0 })
    setSelection({ kind: 'frame', id: alvo.id })
  }

  function removeSelected() {
    if (!spread || !selection) return
    if (selection.kind === 'frame') {
      const frame = spread.frames.find((item) => item.id === selection.id)
      if (frame?.photoId) {
        updateFrame(frame.id, { photoId: null, zoom: 100, offsetX: 0, offsetY: 0 })
        return
      }
      updateCurrent((item) => ({
        ...item,
        frames: item.frames.filter((f) => f.id !== selection.id),
      }))
    } else if (selection.kind === 'text') {
      updateCurrent((item) => ({ ...item, texts: item.texts.filter((t) => t.id !== selection.id) }))
    } else {
      updateCurrent((item) => ({
        ...item,
        elements: item.elements.filter((e) => e.id !== selection.id),
      }))
    }
    setSelection(null)
  }

  function fillEmptyFrames() {
    if (!spread) return
    const livres = spread.frames.filter((frame) => !frame.photoId)
    if (!livres.length) return notify('Nenhum quadro vazio nesta lâmina.')
    if (!unusedPhotos.length) return notify('Não há fotos não usadas disponíveis.')

    let cursor = 0
    updateCurrent((item) => ({
      ...item,
      frames: item.frames.map((frame) => {
        if (frame.photoId) return frame
        const photo = unusedPhotos[cursor]
        cursor += 1
        return photo ? { ...frame, photoId: photo.id } : frame
      }),
    }))
    notify(`${Math.min(livres.length, unusedPhotos.length)} quadro(s) preenchido(s).`)
  }

  function applyLayoutToCurrent(layout: Layout) {
    if (!spread) return
    const { spread: next, dropped } = applyLayout(spread, layout)
    commit(spreads.map((item, index) => (index === current ? next : item)))
    setSelection(null)
    if (dropped.length) notify(`${dropped.length} foto(s) saíram da lâmina.`)
  }

  function addSpread(frames = 2) {
    const layout = suggestLayout(frames)
    const novo = makeSpread({
      frames: layout.cells.map((cell) => makeFrame(cell)),
      gapH: spread?.gapH ?? 4,
      gapV: spread?.gapV ?? 4,
    })
    commit([...spreads, novo])
    setCurrent(spreads.length)
    setSelection(null)
  }

  function createSpreadWith(photoIds: string[]) {
    const layout = suggestLayout(photoIds.length)
    const novo = makeSpread({
      frames: layout.cells.map((cell, index) =>
        makeFrame({ ...cell, photoId: photoIds[index] ?? null }),
      ),
      gapH: spread?.gapH ?? 4,
      gapV: spread?.gapV ?? 4,
    })
    commit([...spreads, novo])
    setCurrent(spreads.length)
    notify('Lâmina criada com as fotos escolhidas.')
  }

  function applyFix(issue: Issue) {
    if (!spread) return

    if (issue.fix === 'preencher' && issue.target?.kind === 'frame') {
      const photo = unusedPhotos[0]
      if (!photo) return notify('Não há fotos não usadas para preencher.')
      updateFrame(issue.target.id, { photoId: photo.id })
      return notify('Quadro preenchido.')
    }

    if (issue.fix === 'reenquadrar' && issue.target?.kind === 'frame') {
      updateFrame(issue.target.id, { zoom: 100, offsetX: 0, offsetY: 0 })
      return notify('Zoom reduzido para recuperar resolução.')
    }

    if (issue.fix === 'afastar-do-vinco' && issue.target?.kind === 'frame') {
      const frame = spread.frames.find((item) => item.id === issue.target?.id)
      if (!frame) return
      const centro = frame.x + frame.w / 2
      const x = centro < 50 ? Math.min(frame.x, 50 - frame.w - 1) : Math.max(frame.x, 51)
      updateFrame(frame.id, { x: Math.max(1, Math.min(99 - frame.w, x)) })
      return notify('Quadro afastado do vinco.')
    }

    if (issue.fix === 'trazer-para-area-segura' && issue.target?.kind === 'text') {
      const text = spread.texts.find((item) => item.id === issue.target?.id)
      if (!text) return
      updateText(text.id, {
        x: Math.max(5, Math.min(95 - text.w, text.x)),
        y: Math.max(5, Math.min(90, text.y)),
      })
      return notify('Texto trazido para a área segura.')
    }
  }

  /* ------------------------------------------------------- teclado */

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selection) {
        event.preventDefault()
        removeSelected()
        return
      }
      if (event.key === 'Escape') setSelection(null)
      if (event.key === 'ArrowRight' && current < spreads.length - 1) setCurrent(current + 1)
      if (event.key === 'ArrowLeft' && current > 0) setCurrent(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* -------------------------------------------------------- render */

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <p className="text-lg font-semibold text-ink">Álbum não encontrado</p>
        <Link to="/app/albuns">
          <Button>Voltar aos álbuns</Button>
        </Link>
      </div>
    )
  }

  const isCover = spread?.kind === 'cover'
  const currentAspect = isCover ? coverAspect : aspect
  // A legenda em cima e a navegação embaixo dividem a altura com a lâmina.
  const CHROME_HEIGHT = 80
  const usableHeight = Math.max(120, area.height - CHROME_HEIGHT)
  const fitWidth = area.width ? Math.min(area.width, usableHeight * currentAspect) : 0
  const displayWidth = fitWidth * (zoom / 100)
  const { gapX, gapY } = spread ? gapFor(spread) : { gapX: 0, gapY: 0 }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-canvas">
      {/* ------------------------------------------------------ topbar */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/app/albuns">
            <Button variant="white" size="sm">
              <Icon.ArrowLeft className="size-4" />
              Álbuns
            </Button>
          </Link>
          <LogoMark className="ml-1 size-7 shrink-0" />

          <button
            type="button"
            onClick={() => setRenaming(true)}
            className="truncate rounded-lg px-2 py-1 text-[15px] font-semibold text-ink transition hover:bg-subtle"
            title="Renomear álbum"
          >
            {project.name}
          </button>

          <Badge tone={saveState === 'salvo' ? 'success' : 'neutral'}>
            {saveState === 'salvo' ? (
              <>
                <Icon.Check className="size-3" />
                Salvo agora
              </>
            ) : (
              'Salvando...'
            )}
          </Badge>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full border border-line p-1">
            <IconButton label="Desfazer" size="sm" onClick={undo} disabled={!past.length}>
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9h11a5 5 0 0 1 0 10h-5M4 9l4-4M4 9l4 4" />
              </svg>
            </IconButton>
            <IconButton label="Refazer" size="sm" onClick={redo} disabled={!future.length}>
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 9H9a5 5 0 0 0 0 10h5M20 9l-4-4M20 9l-4 4" />
              </svg>
            </IconButton>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-line p-1 sm:flex">
            <IconButton label="Diminuir zoom" size="sm" onClick={() => setZoom((z) => Math.max(40, z - 15))}>
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M8.5 11h5M16 16l4 4" />
              </svg>
            </IconButton>
            <span className="numeric w-11 text-center text-[12px] font-semibold text-ink">
              {zoom}%
            </span>
            <IconButton label="Aumentar zoom" size="sm" onClick={() => setZoom((z) => Math.min(220, z + 15))}>
              <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M11 8.5v5M8.5 11h5M16 16l4 4" />
              </svg>
            </IconButton>
          </div>

          <Button variant="white" size="sm" onClick={() => setPreviewOpen(true)}>
            <Icon.Photos className="size-4" />
            Prévia
          </Button>

          <Button size="sm" onClick={() => setReviewOpen(true)}>
            <Icon.Check className="size-4" />
            Revisar e finalizar
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------------ corpo */}
      <div className="flex min-h-0 flex-1">
        {/* rail */}
        <nav className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-line bg-white py-3">
          {RAIL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPanel(panel === item.id ? null : item.id)}
              className={`flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition ${
                panel === item.id
                  ? 'bg-primary-soft text-primary'
                  : 'text-ink-faint hover:bg-subtle hover:text-ink'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* painel contextual */}
        {panel && spread && (
          <aside className="w-[320px] shrink-0 border-r border-line bg-white">
            {panel === 'fotos' && (
              <PhotosPanel
                photos={photos}
                thumbUrls={thumbUrls}
                usage={usage}
                onPlacePhoto={placePhoto}
                onCreateSpreadWith={createSpreadWith}
                onFillEmpty={fillEmptyFrames}
              />
            )}
            {panel === 'layouts' && (
              <LayoutsPanel
                spread={spread}
                onApply={applyLayoutToCurrent}
                onSuggest={() => {
                  const usadas = spread.frames.filter((frame) => frame.photoId).length
                  applyLayoutToCurrent(suggestLayout(usadas || 2))
                }}
              />
            )}
            {panel === 'texto' && (
              <TextPanel
                onInsert={(text) => {
                  updateCurrent((item) => ({ ...item, texts: [...item.texts, text] }))
                  setSelection({ kind: 'text', id: text.id })
                }}
              />
            )}
            {panel === 'fundos' && (
              <BackgroundsPanel
                current={spread.background}
                onApply={(background) => updateCurrent((item) => ({ ...item, background }))}
                onApplyAll={(background) =>
                  commit(spreads.map((item) => ({ ...item, background })))
                }
              />
            )}
            {panel === 'elementos' && (
              <ElementsPanel
                customElements={elements}
                elementUrls={elementUrls}
                onInsert={(elementId, color) => {
                  const element = makeElement({ elementId, color })
                  updateCurrent((item) => ({ ...item, elements: [...item.elements, element] }))
                  setSelection({ kind: 'element', id: element.id })
                }}
              />
            )}
            {panel === 'assistencia' && (
              <AssistPanel
                emptyCount={emptyFrames(spread).length}
                unusedCount={unusedPhotos.length}
                onFillEmpty={fillEmptyFrames}
                onSuggestLayout={() => {
                  const usadas = spread.frames.filter((frame) => frame.photoId).length
                  applyLayoutToCurrent(suggestLayout(usadas || 2))
                }}
                onBalanceSpacing={() => {
                  updateCurrent((item) => ({ ...item, gapH: 4, gapV: 4 }))
                  notify('Espaçamento equilibrado.')
                }}
                onHarmonizeBackground={() => {
                  updateCurrent((item) => ({ ...item, background: '#f5f7fb' }))
                  notify('Fundo harmonizado.')
                }}
                onGrayscale={() => {
                  updateCurrent((item) => ({
                    ...item,
                    frames: item.frames.map((frame) => ({ ...frame, grayscale: true })),
                  }))
                  notify('Lâmina em preto e branco.')
                }}
              />
            )}
          </aside>
        )}

        {/* canvas */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={areaRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
            {spread && displayWidth > 0 && (
              <div className="shrink-0" style={{ width: displayWidth }}>
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-ink-soft">
                    {isCover ? 'Capa' : `Lâmina ${current} · páginas ${current * 2 - 1}–${current * 2}`}
                  </span>
                  <span className="flex items-center gap-3 text-ink-faint">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 bg-warning" />
                      margem de corte
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 bg-primary" />
                      área segura
                    </span>
                  </span>
                </div>

                <div
                  className="shadow-lift"
                  style={{ aspectRatio: currentAspect }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <SpreadView
                    spread={spread}
                    gapX={gapX}
                    gapY={gapY}
                    thumbUrls={thumbUrls}
                    elementUrls={elementUrls}
                    guides
                    interactive
                    selection={selection}
                    onSelect={setSelection}
                    onChange={(next) =>
                      commit(spreads.map((item, index) => (index === current ? next : item)))
                    }
                    onDropPhoto={(frameId, photoId) =>
                      updateFrame(frameId, { photoId, zoom: 100, offsetX: 0, offsetY: 0 })
                    }
                    className="size-full"
                  />
                </div>

                {/* navegação entre lâminas */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <IconButton
                    label="Lâmina anterior"
                    size="sm"
                    onClick={() => setCurrent((index) => Math.max(0, index - 1))}
                    disabled={current === 0}
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4 6 10l6 6" />
                    </svg>
                  </IconButton>
                  <span className="text-[12px] font-medium text-ink-soft">
                    {isCover ? 'Capa' : `Lâmina ${current} de ${spreads.length - 1}`}
                  </span>
                  <IconButton
                    label="Próxima lâmina"
                    size="sm"
                    onClick={() => setCurrent((index) => Math.min(spreads.length - 1, index + 1))}
                    disabled={current >= spreads.length - 1}
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m8 4 6 6-6 6" />
                    </svg>
                  </IconButton>
                </div>
              </div>
            )}
          </div>

          <Storyboard
            spreads={spreads}
            current={current}
            thumbUrls={thumbUrls}
            elementUrls={elementUrls}
            gapFor={gapFor}
            aspect={aspect}
            coverAspect={coverAspect}
            open={storyOpen}
            allOpen={allPagesOpen}
            onToggle={() => setStoryOpen((open) => !open)}
            onToggleAll={() => setAllPagesOpen((open) => !open)}
            onSelect={(index) => {
              setCurrent(index)
              setSelection(null)
            }}
            onAdd={() => addSpread()}
            onDuplicate={(index) => {
              const copia = { ...spreads[index], id: makeSpread().id, approved: false }
              const next = [...spreads]
              next.splice(index + 1, 0, copia)
              commit(next)
              setCurrent(index + 1)
            }}
            onDelete={(index) => {
              if (spreads.length <= 2) return notify('O álbum precisa de pelo menos uma lâmina.')
              commit(spreads.filter((_, i) => i !== index))
              setCurrent((value) => Math.max(0, Math.min(value, spreads.length - 2)))
            }}
            onReorder={(from, to) => {
              if (from === 0 || to === 0) return notify('A capa fica sempre no início.')
              const next = [...spreads]
              const [moved] = next.splice(from, 1)
              next.splice(to, 0, moved)
              commit(next)
              setCurrent(to)
            }}
          />
        </main>

        {/* Inspetor recolhível: fechado deixa uma faixa à vista, para o usuário
            saber que existe algo ali. Selecionar um objeto abre sozinho. */}
        {spread && (
          <aside
            className={`relative hidden shrink-0 overflow-hidden border-l border-line bg-white transition-[width] duration-300 ease-out motion-reduce:transition-none xl:block ${
              inspectorOpen ? 'w-[300px]' : 'w-12'
            }`}
          >
            <button
              type="button"
              onClick={() => setInspectorOpen((open) => !open)}
              aria-expanded={inspectorOpen}
              aria-label={inspectorOpen ? 'Recolher o inspetor' : 'Expandir o inspetor'}
              title={inspectorOpen ? 'Recolher' : 'Expandir'}
              className="absolute top-4 left-2 z-10 flex size-8 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition hover:border-primary hover:text-primary"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`size-4 transition-transform duration-300 ${inspectorOpen ? '' : 'rotate-180'}`}
              >
                <path d="M12 4 6 10l6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* faixa da versão recolhida */}
            <div
              className={`absolute inset-0 flex flex-col items-center pt-16 transition-opacity duration-200 ${
                inspectorOpen ? 'pointer-events-none opacity-0' : 'opacity-100 delay-150'
              }`}
            >
              <span
                className="text-[11px] font-semibold tracking-[0.14em] text-ink-faint uppercase"
                style={{ writingMode: 'vertical-rl' }}
              >
                {selection ? 'Editar seleção' : 'Inspetor'}
              </span>
              {selection && (
                <span className="mt-3 size-2 rounded-full bg-primary" aria-hidden="true" />
              )}
            </div>

            {/* conteúdo em largura fixa, para não espremer durante a animação */}
            <div
              className={`h-full w-[300px] transition-opacity duration-200 ${
                inspectorOpen ? 'opacity-100 delay-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <Inspector
                spread={spread}
                selection={selection}
                photos={photoMap}
                issues={spreadIssues}
                onUpdateFrame={updateFrame}
                onUpdateText={updateText}
                onUpdateElement={updateElement}
                onUpdateSpread={(patch) => updateCurrent((item) => ({ ...item, ...patch }))}
                onRemove={removeSelected}
                onApplyFix={applyFix}
              />
            </div>
          </aside>
        )}
      </div>

      {/* ------------------------------------------------------ modais */}
      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Renomear álbum"
        footer={
          <>
            <Button variant="white" onClick={() => setRenaming(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (name.trim()) await updateProject(project.id, { name: name.trim() })
                setRenaming(false)
              }}
            >
              Salvar
            </Button>
          </>
        }
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="Nome do álbum"
          className="h-12 w-full rounded-2xl border border-line bg-subtle px-4 text-sm text-ink focus:border-primary focus:bg-white focus:outline-none"
        />
      </Modal>

      <Preview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        spreads={spreads}
        thumbUrls={thumbUrls}
        elementUrls={elementUrls}
        gapFor={gapFor}
        aspect={aspect}
        coverAspect={coverAspect}
      />

      <Review
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        issues={albumIssues}
        blockers={blockers.length}
        spreadCount={spreads.length}
        onGoTo={(issue) => {
          setCurrent(issue.spreadIndex)
          setSelection(issue.target ?? null)
          setReviewOpen(false)
        }}
        onFix={(issue) => {
          setCurrent(issue.spreadIndex)
          // Aplica na próxima renderização, já com a lâmina certa carregada.
          setTimeout(() => applyFix(issue), 0)
        }}
        onFinish={async () => {
          await updateProject(project.id, { status: 'pronto' })
          setReviewOpen(false)
          notify('Álbum pronto para finalizar.')
          navigate(`/app/albuns/${project.id}`)
        }}
      />

      {toast && <Toast message={toast} />}
    </div>
  )
}

/* --------------------------------------------------------------- prévia */

function Preview({
  open,
  onClose,
  spreads,
  thumbUrls,
  elementUrls,
  gapFor,
  aspect,
  coverAspect,
}: {
  open: boolean
  onClose: () => void
  spreads: Spread[]
  thumbUrls: Record<string, string>
  elementUrls: Record<string, string>
  gapFor: (spread: Spread) => { gapX: number; gapY: number }
  aspect: number
  coverAspect: number
}) {
  const [index, setIndex] = useState(0)
  const spread = spreads[index]

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  if (!open || !spread) return null
  const { gapX, gapY } = gapFor(spread)
  const isCover = spread.kind === 'cover'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-6">
      <div className="flex items-center justify-between text-white">
        <p className="text-sm font-semibold">
          {isCover ? 'Capa' : `Lâmina ${index} · páginas ${index * 2 - 1}–${index * 2}`}
        </p>
        <IconButton label="Fechar prévia" onClick={onClose} className="border-white/25 bg-white/10 text-white hover:text-white">
          <Icon.Close className="size-4" />
        </IconButton>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-6">
        <div
          className="max-h-full shadow-lift"
          style={{ aspectRatio: isCover ? coverAspect : aspect, width: 'min(100%, 1100px)' }}
        >
          <SpreadView
            spread={spread}
            gapX={gapX}
            gapY={gapY}
            thumbUrls={thumbUrls}
            elementUrls={elementUrls}
            className="size-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="white"
          size="sm"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          Anterior
        </Button>
        <span className="numeric text-sm text-white/80">
          {index + 1} / {spreads.length}
        </span>
        <Button
          variant="white"
          size="sm"
          onClick={() => setIndex((value) => Math.min(spreads.length - 1, value + 1))}
          disabled={index >= spreads.length - 1}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- revisão */

function Review({
  open,
  onClose,
  issues,
  blockers,
  spreadCount,
  onGoTo,
  onFix,
  onFinish,
}: {
  open: boolean
  onClose: () => void
  issues: Issue[]
  blockers: number
  spreadCount: number
  onGoTo: (issue: Issue) => void
  onFix: (issue: Issue) => void
  onFinish: () => void
}) {
  const bloqueadores = issues.filter((issue) => issue.level === 'bloqueador')
  const avisos = issues.filter((issue) => issue.level === 'aviso')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Revise seu álbum"
      description={`${spreadCount} lâminas · ${bloqueadores.length} erro(s) e ${avisos.length} recomendação(ões)`}
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            Voltar ao editor
          </Button>
          <Button onClick={onFinish} disabled={blockers > 0}>
            {blockers > 0 ? `${blockers} erro(s) a corrigir` : 'Finalizar álbum'}
          </Button>
        </>
      }
    >
      {issues.length === 0 ? (
        <div className="py-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
            <Icon.Check className="size-7" />
          </span>
          <p className="mt-4 text-base font-semibold text-ink">
            Seu álbum está pronto para finalizar
          </p>
          <p className="mt-1.5 text-sm text-ink-soft">
            Nenhum problema encontrado nas lâminas.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bloqueadores.length > 0 && (
            <IssueGroup
              title="Erros que impedem a finalização"
              tone="danger"
              issues={bloqueadores}
              onGoTo={onGoTo}
              onFix={onFix}
            />
          )}
          {avisos.length > 0 && (
            <IssueGroup
              title="Recomendações"
              tone="warning"
              issues={avisos}
              onGoTo={onGoTo}
              onFix={onFix}
            />
          )}
        </div>
      )}
    </Modal>
  )
}

function IssueGroup({
  title,
  tone,
  issues,
  onGoTo,
  onFix,
}: {
  title: string
  tone: 'danger' | 'warning'
  issues: Issue[]
  onGoTo: (issue: Issue) => void
  onFix: (issue: Issue) => void
}) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-ink">
        {title}
        <Badge tone={tone}>{issues.length}</Badge>
      </h3>
      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-white p-4"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                {issue.title}
                <span className="ml-2 font-normal text-ink-faint">
                  {issue.spreadIndex === 0 ? 'Capa' : `Lâmina ${issue.spreadIndex}`}
                </span>
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{issue.detail}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {issue.fix && (
                <Button size="sm" onClick={() => onFix(issue)}>
                  Corrigir
                </Button>
              )}
              <Button size="sm" variant="white" onClick={() => onGoTo(issue)}>
                Abrir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
