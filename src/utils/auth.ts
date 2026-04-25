import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone_number: string | null
  role: 'admin' | 'user'
  is_approved: boolean
  created_at: string
  approval_date: string | null
  admin_notes: string | null
  last_login_at: string | null
}

/** 現在のログインユーザーのプロフィールを取得する。未ログインなら /login へリダイレクト。 */
export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS バイパスのため admin client でプロフィールを取得
  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return profile as Profile
}

/** 管理者プロフィールを取得する。admin でなければ /properties へリダイレクト。 */
export async function getAdminProfile(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (profile.role !== 'admin') redirect('/properties')
  return profile
}
