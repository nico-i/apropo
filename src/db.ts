import type { Recording } from './recording'

const DB_NAME = 'apropos'
const STORE = 'recordings'

type StoredRecording = Recording & { blob: Blob }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE)
}

export async function getAllRecordings(): Promise<Recording[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = tx(db, 'readonly').getAll()
    request.onsuccess = () => {
      const stored = request.result as StoredRecording[]
      resolve(stored.map((item) => {
        const meta = { ...item }
        delete (meta as Partial<StoredRecording>).blob
        return meta
      }))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function addRecording(recording: Recording, blob: Blob): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = tx(db, 'readwrite').add({ ...recording, blob })
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function removeRecording(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = tx(db, 'readwrite').delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function renameRecording(id: string, name: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const store = tx(db, 'readwrite')
    const getRequest = store.get(id)
    getRequest.onsuccess = () => {
      const existing = getRequest.result as StoredRecording | undefined
      if (!existing) {
        resolve()
        return
      }
      const putRequest = store.put({ ...existing, name })
      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function getRecordingBlob(id: string): Promise<Blob | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = tx(db, 'readonly').get(id)
    request.onsuccess = () => resolve((request.result as StoredRecording | undefined)?.blob)
    request.onerror = () => reject(request.error)
  })
}
