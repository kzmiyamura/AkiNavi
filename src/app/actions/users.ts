'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { userApprovedEmail, userRejectedEmail } from '@/lib/email/templates'

export type UserActionState = { error?: string; success?: string } | undefined

export async function approveUser(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await getAdminProfile()
  const supabase = createAdminClient()

  const userId = formData.get('user_id') as string
  const adminNotes = (formData.get('admin_notes') as string).trim()
  const role = (formData.get('role') as string) === 'developer' ? 'developer' : 'user'

  // プロフィールを取得（通知メール用）
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({
      is_approved: true,
      role,
      approval_date: new Date().toISOString(),
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: '承認処理に失敗しました' }

  // 承認完了メールをユーザーへ送信（失敗しても承認は成功扱い）
  if (profile) {
    const { subject, html } = userApprovedEmail({
      fullName: profile.full_name ?? 'お客様',
    })
    await resend.emails
      .send({ from: EMAIL_FROM, to: profile.email, subject, html })
      .catch(console.error)
  }

  revalidatePath('/admin/users')
  return { success: role === 'developer' ? '開発者として承認しました' : 'ユーザーを承認しました' }
}

export async function rejectUser(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await getAdminProfile()
  const supabase = createAdminClient()
  const adminClient = supabase

  const userId = formData.get('user_id') as string

  // プロフィールを取得（通知メール用）
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  // 拒否通知メールを送信（削除前に実行）
  if (profile) {
    const { subject, html } = userRejectedEmail({
      fullName: profile.full_name ?? 'お客様',
    })
    await resend.emails
      .send({ from: EMAIL_FROM, to: profile.email, subject, html })
      .catch(console.error)
  }

  // auth.users から削除（profiles は CASCADE で連動削除）
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { error: '拒否処理に失敗しました' }

  revalidatePath('/admin/users')
  return { success: 'ユーザーを拒否しました' }
}

export async function updateAdminNotes(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await getAdminProfile()
  const supabase = createAdminClient()

  const userId = formData.get('user_id') as string
  const adminNotes = (formData.get('admin_notes') as string).trim()

  const { error } = await supabase
    .from('profiles')
    .update({ admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: 'メモの保存に失敗しました' }

  revalidatePath('/admin/users')
  return { success: 'メモを保存しました' }
}
