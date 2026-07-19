import { useState } from 'react'
import { saveRecording } from '../download'
import { formatDate, formatDuration, type Recording } from '../recording'
import Icon from './Icon'

export default function DownloadableRecordingItem({ recording }: { recording: Recording }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function download() {
    setBusy(true)
    setError(null)
    try {
      await saveRecording(recording)
    } catch {
      setError('Could not download this recording.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="recording-item">
      <span className="recording-meta">
        <span className="recording-name">{recording.name}</span>
        <span className="recording-sub">
          {formatDate(recording.createdAt)}
          {recording.durationMs ? ` · ${formatDuration(recording.durationMs)}` : ''}
          {error ? ` · ${error}` : ''}
        </span>
      </span>
      <button
        type="button"
        className="icon-button"
        onClick={download}
        disabled={busy}
        aria-label={`Download ${recording.name}`}
      >
        <Icon name="download" />
      </button>
    </li>
  )
}
