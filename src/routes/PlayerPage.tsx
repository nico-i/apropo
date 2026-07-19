import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import type { RecordingsContext } from '../App'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { formatDate, formatTime, resolveName } from '../recording'
import Waveform from '../components/Waveform'
import Icon from '../components/Icon'

export default function PlayerPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { recordings, rename } = useOutletContext<RecordingsContext>()
  const recording = useMemo(
    () => recordings.find((r) => r.id === id),
    [recordings, id],
  )

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const player = useAudioPlayer(id)
  const binCount = player.frequencyBinCount()

  if (!recording) {
    return (
      <div className="page player">
        <p className="empty">Recording not found.</p>
      </div>
    )
  }

  const total = player.duration || (recording.durationMs ?? 0) / 1000

  function startEditing() {
    setDraft(recording!.name)
    setEditing(true)
  }

  async function commitEditing() {
    const name = resolveName(draft, recording!.createdAt)
    setEditing(false)
    if (name !== recording!.name) {
      await rename(recording!.id, name)
    }
  }

  return (
    <div className="page player">
      <div className="player-head">
        <button
          type="button"
          className="icon-button player-close"
          onClick={() => navigate('/')}
          aria-label="Close player"
        >
          <Icon name="close" />
        </button>
        <span className="player-name-row">
          {editing ? (
            <input
              type="text"
              className="player-name-input"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => void commitEditing()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void commitEditing()
                if (e.key === 'Escape') setEditing(false)
              }}
              aria-label="Recording name"
            />
          ) : (
            <>
              <span className="player-name">{recording.name}</span>
              <button
                type="button"
                className="icon-button player-edit"
                onClick={startEditing}
                aria-label="Rename recording"
              >
                <Icon name="edit" size={18} />
              </button>
            </>
          )}
        </span>
        <span className="player-date">{formatDate(recording.createdAt)}</span>
      </div>

      <div className="player-visual">
        <Waveform
          playing={player.playing}
          getFrequencyData={player.getFrequencyData}
          binCount={binCount}
        />
      </div>

      {player.error && <p className="error">{player.error}</p>}

      <div className="player-controls">
        <div className="player-scrub">
          <span className="player-time">{formatTime(player.currentTime)}</span>
          <input
            type="range"
            className="seek"
            min={0}
            max={total || 0}
            step={0.01}
            value={player.currentTime}
            onChange={(e) => player.seek(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="player-time">{formatTime(total)}</span>
        </div>

        <div className="player-buttons">
          <button
            type="button"
            className="player-play"
            onClick={() => void player.toggle()}
            disabled={!player.ready}
            aria-label={player.playing ? 'Pause' : 'Play'}
          >
            <Icon name={player.playing ? 'pause' : 'play'} size={36} />
          </button>
        </div>
      </div>
    </div>
  )
}
