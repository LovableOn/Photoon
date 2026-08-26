/**
 * Camada de persistência sobre IndexedDB.
 *
 * Fotos e elementos guardam blobs, que não cabem no localStorage — por isso
 * tudo (metadados inclusive) vive no IndexedDB, numa store por entidade.
 *
 * Alguns contextos bloqueiam armazenamento (janela anônima, iframe de terceiro,
 * navegador com dados de site desativados). Nesses casos caímos para um espelho
 * em memória: o app continua funcionando na sessão atual e só perde os dados ao
 * recarregar, em vez de quebrar.
 */

const DB_NAME = 'photoon'
const DB_VERSION = 1

export const STORES = ['photos', 'elements', 'projects'] as const
export type StoreName = (typeof STORES)[number]

let dbPromise: Promise<IDBDatabase | null> | null = null

const memory = new Map<StoreName, Map<string, unknown>>()

function memoryStore(store: StoreName) {
  let bucket = memory.get(store)
  if (!bucket) {
    bucket = new Map()
    memory.set(store, bucket)
  }
  return bucket
}

/** Resolve com `null` quando o navegador não permite IndexedDB aqui. */
function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve) => {
    let request: IDBOpenDBRequest
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      request = indexedDB.open(DB_NAME, DB_VERSION)
    } catch {
      return resolve(null)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
    request.onblocked = () => resolve(null)
  })

  return dbPromise
}

/** Executa `run` numa transação; devolve `null` se o IndexedDB não está disponível. */
async function transact<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  run: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<{ value: T } | null> {
  const db = await openDb()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, mode)
      const request = run(tx.objectStore(store))
      request.onsuccess = () => resolve({ value: request.result })
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function readAll<T>(store: StoreName): Promise<T[]> {
  const result = await transact<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>)
  if (result) return result.value
  return [...memoryStore(store).values()] as T[]
}

export async function put<T extends { id: string }>(
  store: StoreName,
  record: T,
): Promise<T> {
  const result = await transact(store, 'readwrite', (s) => s.put(record))
  if (!result) memoryStore(store).set(record.id, record)
  return record
}

export async function putMany<T extends { id: string }>(
  store: StoreName,
  records: T[],
): Promise<T[]> {
  const db = await openDb()

  if (db) {
    const ok = await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(store, 'readwrite')
        const objectStore = tx.objectStore(store)
        for (const record of records) objectStore.put(record)
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => resolve(false)
        tx.onabort = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
    if (ok) return records
  }

  const bucket = memoryStore(store)
  for (const record of records) bucket.set(record.id, record)
  return records
}

export async function remove(store: StoreName, id: string): Promise<void> {
  const result = await transact(store, 'readwrite', (s) => s.delete(id))
  if (!result) memoryStore(store).delete(id)
}

export async function removeMany(store: StoreName, ids: string[]): Promise<void> {
  const db = await openDb()

  if (db) {
    const ok = await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(store, 'readwrite')
        const objectStore = tx.objectStore(store)
        for (const id of ids) objectStore.delete(id)
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => resolve(false)
        tx.onabort = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
    if (ok) return
  }

  const bucket = memoryStore(store)
  for (const id of ids) bucket.delete(id)
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
