import { getRecordingBlob } from './db'
import { toMp3 } from './mp3'
import { downloadFileName, type Recording } from './recording'

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function saveRecording(recording: Recording): Promise<void> {
  const stored = await getRecordingBlob(recording.id)
  if (!stored) throw new Error('Recording data is unavailable.')

  const blob = await toMp3(stored)
  const fileName = downloadFileName({ name: recording.name, mimeType: 'audio/mpeg' })
  const file = new File([blob], fileName, { type: 'audio/mpeg' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: recording.name })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  triggerBrowserDownload(blob, fileName)
}
