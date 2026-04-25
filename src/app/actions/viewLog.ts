'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function recordViewLog(roomId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const adminSupabase = createAdminClient()
  await adminSupabase.from('view_logs').insert({
    user_id: user.id,
    room_id: roomId,
  })
}
