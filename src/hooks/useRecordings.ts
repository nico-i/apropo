import { useCallback, useEffect, useState } from 'react'
import { addRecording, getAllRecordings, removeRecording, renameRecording } from '../db'
import { sortByNewest, type Recording } from '../recording'

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await getAllRecordings()
    setRecordings(sortByNewest(all))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (recording: Recording, blob: Blob) => {
      await addRecording(recording, blob)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await removeRecording(id)
      await refresh()
    },
    [refresh],
  )

  const rename = useCallback(
    async (id: string, name: string) => {
      await renameRecording(id, name)
      await refresh()
    },
    [refresh],
  )

  return { recordings, loading, add, remove, rename }
}
