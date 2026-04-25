'use client'

import { useEffect } from 'react'
import { recordViewLog } from '@/app/actions/viewLog'

export function ViewLogger({ roomIds }: { roomIds: string[] }) {
  useEffect(() => {
    roomIds.forEach((id) => recordViewLog(id))
  }, [])

  return null
}
