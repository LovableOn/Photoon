/**
 * Camada de persistência sobre IndexedDB.
 *
 * Fotos e elementos guardam blobs, que não cabem no localStorage — por isso
 * tudo (metadados inclusive) vive no IndexedDB, numa store por entidade.
 */

const DB_NAME = 'photoon'
const DB_VERSION = 1

export const STORES = ['photos', 'elements', 'projects'] as const
export type StoreName = (typeof STORES)[number]

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

async function transact<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  run: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode)
    const request = run(tx.objectStore(store))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function readAll<T>(store: StoreName): Promise<T[]> {
  return transact<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>)
}

export async function put<T extends { id: string }>(
  store: StoreName,
  record: T,
): Promise<T> {
  await transact(store, 'readwrite', (s) => s.put(record))
  return record
}

export async function putMany<T extends { id: string }>(
  store: StoreName,
  records: T[],
): Promise<T[]> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const objectStore = tx.objectStore(store)
    for (const record of records) objectStore.put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  return records
}

export async function remove(store: StoreName, id: string): Promise<void> {
  await transact(store, 'readwrite', (s) => s.delete(id))
}

export async function removeMany(store: StoreName, ids: string[]): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const objectStore = tx.objectStore(store)
    for (const id of ids) objectStore.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
