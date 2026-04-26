'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile, getCurrentProfile } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export type SettingsState = { error?: string; success?: string } | undefined

export async function saveAdminSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const profile = await getAdminProfile()
  if (profile.role === 'developer') return { error: '開発者アカウントは設定を変更できません' }
  const supabase = createAdminClient()

  const fullName = (formData.get('full_name') as string).trim()
  const companyName = (formData.get('company_name') as string).trim()
  const phoneNumber = (formData.get('phone_number') as string).trim()
  const newEmail = (formData.get('email') as string).trim()
  const newPassword = (formData.get('new_password') as string).trim()
  const confirmPassword = (formData.get('confirm_password') as string).trim()

  // パスワード変更
  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return { error: '新しいパスワードが一致しません' }
    }
    if (newPassword.length < 8) {
      return { error: 'パスワードは8文字以上で設定してください' }
    }
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    })
    if (error) return { error: 'パスワードの変更に失敗しました' }
  }

  // メールアドレス変更
  if (newEmail && newEmail !== profile.email) {
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      email: newEmail,
    })
    if (error) return { error: 'メールアドレスの変更に失敗しました' }
  }

  // profiles テーブル更新
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName || null,
      company_name: companyName || null,
      phone_number: phoneNumber || null,
      email: newEmail || profile.email,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (profileError) return { error: 'プロフィールの更新に失敗しました' }

  revalidatePath('/admin/settings')
  return { success: '設定を保存しました' }
}

export async function saveUserProfile(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const profile = await getCurrentProfile()
  const supabase = createAdminClient()

  const fullName = (formData.get('full_name') as string).trim()
  const companyName = (formData.get('company_name') as string).trim()
  const phoneNumber = (formData.get('phone_number') as string).trim()
  const newPassword = (formData.get('new_password') as string).trim()
  const confirmPassword = (formData.get('confirm_password') as string).trim()

  console.log('[saveUserProfile] newPassword length:', newPassword.length, '| confirmPassword length:', confirmPassword.length)

  // confirmPassword が空の場合はパスワード変更をスキップ（ブラウザ自動補完対策）
  if (confirmPassword) {
    if (newPassword !== confirmPassword) {
      return { error: '新しいパスワードが一致しません' }
    }
    if (newPassword.length < 8) {
      return { error: 'パスワードは8文字以上で設定してください' }
    }
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    })
    if (error) return { error: 'パスワードの変更に失敗しました' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName || null,
      company_name: companyName || null,
      phone_number: phoneNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) return { error: 'プロフィールの更新に失敗しました' }

  revalidatePath('/profile')
  return { success: 'プロフィールを更新しました' }
}
