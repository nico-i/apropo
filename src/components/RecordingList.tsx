import { type Recording } from '../recording'
import RecordingItem from './RecordingItem'

export default function RecordingList({
  recordings,
  onDelete,
}: {
  recordings: Recording[]
  onDelete: (id: string) => void
}) {
  if (recordings.length === 0) {
    return <p className="empty">No recordings yet.</p>
  }

  return (
    <ul className="recording-list">
      {recordings.map((recording) => (
        <RecordingItem key={recording.id} recording={recording} onDelete={onDelete} />
      ))}
    </ul>
  )
}
