import Icon from './Icon'

export default function RecordButton({
  isRecording,
  onClick,
}: {
  isRecording: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`record-button${isRecording ? ' recording' : ''}`}
      onClick={onClick}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <Icon name={isRecording ? 'stop' : 'mic'} size={40} />
    </button>
  )
}
