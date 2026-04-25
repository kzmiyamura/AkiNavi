'use client'

import { useEffect } from 'react'
import { recordViewLog } from '@/app/actions/viewLog'

// 物件詳細1ページビュー = 1件のログ（最初の部屋IDで代表記録）
export function ViewLogger({ roomIds }: { roomIds: string[] }) {
  useEffect(() => {
    if (roomIds.length > 0) recordViewLog(roomIds[0])
  }, [])

  return null
}
