export type Recording = {
  id: string
  name: string
  createdAt: number
  mimeType: string
  durationMs?: number
}

export function createId(): string {
  return crypto.randomUUID()
}

function browserLocale(): string | string[] | undefined {
  if (typeof navigator === 'undefined') return undefined
  if (navigator.languages && navigator.languages.length > 0) {
    return [...navigator.languages]
  }
  return navigator.language || undefined
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(browserLocale(), {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatDuration(ms?: number): string {
  if (!ms || ms < 0) return ''
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function sortByNewest(recordings: Recording[]): Recording[] {
  return [...recordings].sort((a, b) => b.createdAt - a.createdAt)
}

const MIME_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
}

function extensionForMimeType(mimeType: string): string {
  const base = mimeType.split(';')[0].trim().toLowerCase()
  return MIME_EXTENSIONS[base] ?? 'audio'
}

export function downloadFileName(recording: Pick<Recording, 'name' | 'mimeType'>): string {
  const extension = extensionForMimeType(recording.mimeType)
  const trimmed = recording.name.trim() || 'recording'
  const knownExtensions = new Set(Object.values(MIME_EXTENSIONS))
  const base = trimmed.replace(/\.([a-z0-9]+)$/i, (match, ext: string) =>
    knownExtensions.has(ext.toLowerCase()) ? '' : match,
  )
  const name = base || 'recording'
  return `${name}.${extension}`
}

export function toDateTimeLocalValue(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function fromDateTimeLocalValue(value: string): number {
  return new Date(value).getTime()
}

export function defaultName(timestamp: number): string {
  return `Recording ${new Date(timestamp).toLocaleString(browserLocale(), {
    dateStyle: 'short',
    timeStyle: 'short',
  })}`
}

export function resolveName(input: string, timestamp: number): string {
  const trimmed = input.trim()
  return trimmed || defaultName(timestamp)
}
