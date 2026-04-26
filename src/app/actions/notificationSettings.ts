'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export type NotificationSettingsState = { error?: string; success?: string } | undefined

export async function saveNotificationSettings(
  _prev: NotificationSettingsState,
  formData: FormData
): Promise<NotificationSettingsState> {
  const profile = await getAdminProfile()
  if (profile.role !== 'admin') return { error: '管理者のみ変更できます' }

  const supabase = createAdminClient()
  const enabled = formData.get('notify_users_on_property_change') === 'true'

  const { error } = await supabase
    .from('system_settings')
    .update({
      notify_users_on_property_change: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)

  if (error) return { error: '設定の保存に失敗しました' }

  revalidatePath('/admin/settings')
  return { success: '通知設定を保存しました' }
}

export async function saveContactSettings(
  _prev: NotificationSettingsState,
  formData: FormData
): Promise<NotificationSettingsState> {
  const profile = await getAdminProfile()
  if (profile.role !== 'admin') return { error: '管理者のみ変更できます' }

  const supabase = createAdminClient()
  const contactEmail = (formData.get('contact_email') as string).trim()
  const contactPhone = (formData.get('contact_phone') as string).trim()

  const { error } = await supabase
    .from('system_settings')
    .update({
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)

  if (error) return { error: '設定の保存に失敗しました' }

  revalidatePath('/admin/settings')
  return { success: 'お問い合わせ先を保存しました' }
}
