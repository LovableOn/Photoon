import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { put, putMany, readAll, remove, removeMany, uid } from './db'
import { processImage, type Orientation } from './images'
import { useAuth } from './auth'

export interface Photo {
  id: string
  owner: string
  name: string
  size: number
  width: number
  height: number
  orientation: Orientation
  favorite: boolean
  createdAt: number
  blob: Blob
  thumb: Blob
}

export interface CustomElement {
  id: string
  owner: string
  name: string
  category: string
  tags: string[]
  favorite: boolean
  createdAt: number
  blob: Blob
  mime: string
}

export type ProjectStatus =
  | 'nao-iniciado'
  | 'em-edicao'
  | 'pronto'
  | 'finalizado'

export interface Project {
  id: string
  owner: string
  name: string
  product: string
  format: string
  pages: number
  photoIds: string[]
  elementIds: string[]
  coverPhotoId: string | null
  status: ProjectStatus
  createdAt: number
  updatedAt: number
}

interface StoreValue {
  isLoading: boolean
  photos: Photo[]
  elements: CustomElement[]
  projects: Project[]
  /** URLs de miniatura por id de foto, criadas e revogadas pelo store. */
  thumbUrls: Record<string, string>
  /** URLs de elementos customizados por id. */
  elementUrls: Record<string, string>

  addPhotos: (files: File[]) => Promise<{ added: number; failed: number }>
  togglePhotoFavorite: (id: string) => Promise<void>
  renamePhoto: (id: string, name: string) => Promise<void>
  deletePhotos: (ids: string[]) => Promise<void>

  addElements: (
    files: File[],
    category: string,
  ) => Promise<{ added: number; failed: number }>
  toggleElementFavorite: (id: string) => Promise<void>
  deleteElements: (ids: string[]) => Promise<void>

  createProject: (input: {
    name: string
    product: string
    format: string
    pages: number
    photoIds: string[]
  }) => Promise<Project>
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

const IMAGE_TYPES = /^image\/(jpeg|png|webp|avif|gif)$/
const ELEMENT_TYPES = /^image\/(svg\+xml|png|webp)$/

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const owner = user?.email ?? ''

  const [isLoading, setIsLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [elements, setElements] = useState<CustomElement[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  const [elementUrls, setElementUrls] = useState<Record<string, string>>({})

  // Guarda todas as URLs criadas para revogá-las ao desmontar ou trocar de conta.
  const urlsRef = useRef<string[]>([])

  const releaseUrls = useCallback(() => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url)
    urlsRef.current = []
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      releaseUrls()

      if (!owner) {
        setPhotos([])
        setElements([])
        setProjects([])
        setThumbUrls({})
        setElementUrls({})
        setIsLoading(false)
        return
      }

      const [allPhotos, allElements, allProjects] = await Promise.all([
        readAll<Photo>('photos'),
        readAll<CustomElement>('elements'),
        readAll<Project>('projects'),
      ])
      if (cancelled) return

      const mine = allPhotos
        .filter((photo) => photo.owner === owner)
        .sort((a, b) => b.createdAt - a.createdAt)
      const myElements = allElements
        .filter((element) => element.owner === owner)
        .sort((a, b) => b.createdAt - a.createdAt)
      const myProjects = allProjects
        .filter((project) => project.owner === owner)
        .sort((a, b) => b.updatedAt - a.updatedAt)

      const nextThumbs: Record<string, string> = {}
      for (const photo of mine) {
        const url = URL.createObjectURL(photo.thumb)
        urlsRef.current.push(url)
        nextThumbs[photo.id] = url
      }

      const nextElements: Record<string, string> = {}
      for (const element of myElements) {
        const url = URL.createObjectURL(element.blob)
        urlsRef.current.push(url)
        nextElements[element.id] = url
      }

      setPhotos(mine)
      setElements(myElements)
      setProjects(myProjects)
      setThumbUrls(nextThumbs)
      setElementUrls(nextElements)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [owner, releaseUrls])

  useEffect(() => releaseUrls, [releaseUrls])

  const addPhotos = useCallback<StoreValue['addPhotos']>(
    async (files) => {
      const accepted = files.filter((file) => IMAGE_TYPES.test(file.type))
      let failed = files.length - accepted.length

      const created: Photo[] = []
      for (const file of accepted) {
        try {
          const processed = await processImage(file)
          created.push({
            id: uid('pho'),
            owner,
            name: file.name.replace(/\.[^.]+$/, ''),
            size: file.size,
            width: processed.width,
            height: processed.height,
            orientation: processed.orientation,
            favorite: false,
            createdAt: Date.now(),
            blob: processed.blob,
            thumb: processed.thumb,
          })
        } catch {
          failed += 1
        }
      }

      if (created.length) {
        await putMany('photos', created)
        const nextUrls: Record<string, string> = {}
        for (const photo of created) {
          const url = URL.createObjectURL(photo.thumb)
          urlsRef.current.push(url)
          nextUrls[photo.id] = url
        }
        setThumbUrls((current) => ({ ...current, ...nextUrls }))
        setPhotos((current) => [...created, ...current])
      }

      return { added: created.length, failed }
    },
    [owner],
  )

  const togglePhotoFavorite = useCallback<StoreValue['togglePhotoFavorite']>(
    async (id) => {
      const target = photos.find((photo) => photo.id === id)
      if (!target) return
      const updated = { ...target, favorite: !target.favorite }
      await put('photos', updated)
      setPhotos((current) =>
        current.map((photo) => (photo.id === id ? updated : photo)),
      )
    },
    [photos],
  )

  const renamePhoto = useCallback<StoreValue['renamePhoto']>(
    async (id, name) => {
      const target = photos.find((photo) => photo.id === id)
      if (!target) return
      const updated = { ...target, name }
      await put('photos', updated)
      setPhotos((current) =>
        current.map((photo) => (photo.id === id ? updated : photo)),
      )
    },
    [photos],
  )

  const deletePhotos = useCallback<StoreValue['deletePhotos']>(
    async (ids) => {
      await removeMany('photos', ids)
      const removed = new Set(ids)

      // Projetos que usavam essas fotos precisam esquecê-las.
      const touched = projects
        .filter(
          (project) =>
            project.photoIds.some((photoId) => removed.has(photoId)) ||
            (project.coverPhotoId && removed.has(project.coverPhotoId)),
        )
        .map((project) => {
          const photoIds = project.photoIds.filter((id) => !removed.has(id))
          return {
            ...project,
            photoIds,
            coverPhotoId:
              project.coverPhotoId && removed.has(project.coverPhotoId)
                ? (photoIds[0] ?? null)
                : project.coverPhotoId,
            updatedAt: Date.now(),
          }
        })

      if (touched.length) {
        await putMany('projects', touched)
        const byId = new Map(touched.map((project) => [project.id, project]))
        setProjects((current) =>
          current.map((project) => byId.get(project.id) ?? project),
        )
      }

      setPhotos((current) => current.filter((photo) => !removed.has(photo.id)))
      setThumbUrls((current) => {
        const next = { ...current }
        for (const id of ids) {
          const url = next[id]
          if (url) {
            URL.revokeObjectURL(url)
            urlsRef.current = urlsRef.current.filter((item) => item !== url)
          }
          delete next[id]
        }
        return next
      })
    },
    [projects],
  )

  const addElements = useCallback<StoreValue['addElements']>(
    async (files, category) => {
      const accepted = files.filter((file) => ELEMENT_TYPES.test(file.type))
      const failed = files.length - accepted.length

      const created: CustomElement[] = accepted.map((file) => ({
        id: uid('ele'),
        owner,
        name: file.name.replace(/\.[^.]+$/, ''),
        category,
        tags: [],
        favorite: false,
        createdAt: Date.now(),
        blob: file,
        mime: file.type,
      }))

      if (created.length) {
        await putMany('elements', created)
        const nextUrls: Record<string, string> = {}
        for (const element of created) {
          const url = URL.createObjectURL(element.blob)
          urlsRef.current.push(url)
          nextUrls[element.id] = url
        }
        setElementUrls((current) => ({ ...current, ...nextUrls }))
        setElements((current) => [...created, ...current])
      }

      return { added: created.length, failed }
    },
    [owner],
  )

  const toggleElementFavorite = useCallback<StoreValue['toggleElementFavorite']>(
    async (id) => {
      const target = elements.find((element) => element.id === id)
      if (!target) return
      const updated = { ...target, favorite: !target.favorite }
      await put('elements', updated)
      setElements((current) =>
        current.map((element) => (element.id === id ? updated : element)),
      )
    },
    [elements],
  )

  const deleteElements = useCallback<StoreValue['deleteElements']>(async (ids) => {
    await removeMany('elements', ids)
    const removed = new Set(ids)
    setElements((current) => current.filter((element) => !removed.has(element.id)))
    setElementUrls((current) => {
      const next = { ...current }
      for (const id of ids) {
        const url = next[id]
        if (url) {
          URL.revokeObjectURL(url)
          urlsRef.current = urlsRef.current.filter((item) => item !== url)
        }
        delete next[id]
      }
      return next
    })
  }, [])

  const createProject = useCallback<StoreValue['createProject']>(
    async (input) => {
      const now = Date.now()
      const project: Project = {
        id: uid('prj'),
        owner,
        name: input.name,
        product: input.product,
        format: input.format,
        pages: input.pages,
        photoIds: input.photoIds,
        elementIds: [],
        coverPhotoId: input.photoIds[0] ?? null,
        status: input.photoIds.length ? 'em-edicao' : 'nao-iniciado',
        createdAt: now,
        updatedAt: now,
      }
      await put('projects', project)
      setProjects((current) => [project, ...current])
      return project
    },
    [owner],
  )

  const updateProject = useCallback<StoreValue['updateProject']>(
    async (id, patch) => {
      const target = projects.find((project) => project.id === id)
      if (!target) return
      const updated = { ...target, ...patch, updatedAt: Date.now() }
      await put('projects', updated)
      setProjects((current) =>
        current
          .map((project) => (project.id === id ? updated : project))
          .sort((a, b) => b.updatedAt - a.updatedAt),
      )
    },
    [projects],
  )

  const deleteProject = useCallback<StoreValue['deleteProject']>(async (id) => {
    await remove('projects', id)
    setProjects((current) => current.filter((project) => project.id !== id))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      isLoading,
      photos,
      elements,
      projects,
      thumbUrls,
      elementUrls,
      addPhotos,
      togglePhotoFavorite,
      renamePhoto,
      deletePhotos,
      addElements,
      toggleElementFavorite,
      deleteElements,
      createProject,
      updateProject,
      deleteProject,
    }),
    [
      isLoading,
      photos,
      elements,
      projects,
      thumbUrls,
      elementUrls,
      addPhotos,
      togglePhotoFavorite,
      renamePhoto,
      deletePhotos,
      addElements,
      toggleElementFavorite,
      deleteElements,
      createProject,
      updateProject,
      deleteProject,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return context
}

/** URL temporária para o arquivo original de uma foto (preview em tela cheia). */
export function useFullPhotoUrl(photo: Photo | null): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!photo) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(photo.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  return url
}
