import { useOutletContext } from 'react-router-dom'
import { useRecorder } from '../hooks/useRecorder'
import { createId, defaultName, formatDuration, type Recording } from '../recording'
import RecordButton from '../components/RecordButton'
import RecordingList from '../components/RecordingList'
import type { RecordingsContext } from '../App'

export default function HomePage() {
  const { recordings, add, remove } = useOutletContext<RecordingsContext>()
  const { isRecording, elapsedMs, error, start, stop } = useRecorder()

  async function toggle() {
    if (!isRecording) {
      await start()
      return
    }
    const result = await stop()
    if (!result) return
    const createdAt = Date.now()
    const recording: Recording = {
      id: createId(),
      name: defaultName(createdAt),
      createdAt,
      mimeType: result.mimeType,
      durationMs: result.durationMs,
    }
    await add(recording, result.blob)
  }

  return (
    <div className="page home">
      <RecordingList recordings={recordings} onDelete={remove} />
      <div className="recorder">
        {error && <p className="error">{error}</p>}
        {isRecording && (
          <p className="recording-timer" role="timer" aria-live="off">
            {formatDuration(elapsedMs) || '0:00'}
          </p>
        )}
        <RecordButton isRecording={isRecording} onClick={toggle} />
      </div>
    </div>
  )
}
