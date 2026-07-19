import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  createId,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
  type Recording,
} from '../recording'
import Icon from '../components/Icon'
import DownloadableRecordingItem from '../components/DownloadableRecordingItem'
import type { RecordingsContext } from '../App'

export default function SettingsPage() {
  const { add, recordings } = useOutletContext<RecordingsContext>()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [dateTime, setDateTime] = useState(() => toDateTimeLocalValue(Date.now()))
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!file) return
    setSaving(true)
    const createdAt = fromDateTimeLocalValue(dateTime)
    const recording: Recording = {
      id: createId(),
      name: file.name,
      createdAt,
      mimeType: file.type || 'audio/mpeg',
    }
    await add(recording, file)
    setSaving(false)
    navigate('/')
  }

  return (
    <div className="page">
      <h2>Upload a recording</h2>
      <label className="field">
        <span>Audio file</span>
        <input
          type="file"
          accept="audio/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <label className="field">
        <span>Recording date &amp; time</span>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(event) => setDateTime(event.target.value)}
        />
      </label>
      <button type="button" className="primary" disabled={!file || saving} onClick={save}>
        <Icon name="upload" size={20} />
        {saving ? 'Saving…' : 'Save recording'}
      </button>

      <h2>Download recordings</h2>
      {recordings.length === 0 ? (
        <p className="empty">No recordings yet.</p>
      ) : (
        <ul className="recording-list">
          {recordings.map((recording) => (
            <DownloadableRecordingItem key={recording.id} recording={recording} />
          ))}
        </ul>
      )}
    </div>
  )
}
