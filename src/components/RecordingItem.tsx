import { Link } from 'react-router-dom'
import { formatDate, formatDuration, type Recording } from '../recording'
import Icon from './Icon'

export default function RecordingItem({
  recording,
  onDelete,
}: {
  recording: Recording
  onDelete: (id: string) => void
}) {
  return (
    <li className="recording-item">
      <Link
        to={`/recordings/${recording.id}`}
        className="recording-link"
        aria-label={`Open ${recording.name}`}
      >
        <span className="recording-meta">
          <span className="recording-name">{recording.name}</span>
          <span className="recording-sub">
            {formatDate(recording.createdAt)}
            {recording.durationMs ? ` · ${formatDuration(recording.durationMs)}` : ''}
          </span>
        </span>
      </Link>
      <button
        type="button"
        className="icon-button danger"
        onClick={() => onDelete(recording.id)}
        aria-label="Delete recording"
      >
        <Icon name="trash" />
      </button>
    </li>
  )
}
