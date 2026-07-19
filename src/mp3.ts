import { Mp3Encoder } from '@breezystack/lamejs'

const KBPS = 128
const SAMPLE_BLOCK = 1152

function floatToInt16(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    output[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }
  return output
}

async function decode(blob: Blob): Promise<AudioBuffer> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const context = new AudioCtx()
  try {
    return await context.decodeAudioData(await blob.arrayBuffer())
  } finally {
    void context.close()
  }
}

function encode(buffer: AudioBuffer): Blob {
  const channels = Math.min(buffer.numberOfChannels, 2)
  const encoder = new Mp3Encoder(channels, buffer.sampleRate, KBPS)
  const left = floatToInt16(buffer.getChannelData(0))
  const right = channels > 1 ? floatToInt16(buffer.getChannelData(1)) : undefined

  const parts: Uint8Array[] = []
  for (let offset = 0; offset < left.length; offset += SAMPLE_BLOCK) {
    const leftChunk = left.subarray(offset, offset + SAMPLE_BLOCK)
    const rightChunk = right?.subarray(offset, offset + SAMPLE_BLOCK)
    const encoded = encoder.encodeBuffer(leftChunk, rightChunk)
    if (encoded.length > 0) parts.push(encoded)
  }
  const flushed = encoder.flush()
  if (flushed.length > 0) parts.push(flushed)

  return new Blob(parts as BlobPart[], { type: 'audio/mpeg' })
}

// Browsers record webm/opus; MP3 requires re-encoding decoded PCM on-device.
export async function toMp3(blob: Blob): Promise<Blob> {
  if (blob.type.split(';')[0].trim() === 'audio/mpeg') return blob
  return encode(await decode(blob))
}
