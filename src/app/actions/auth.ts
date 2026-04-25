'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { adminApprovalRequestEmail } from '@/lib/email/templates'

type AuthState = { error: string } | undefined

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  // --- DEBUG START ---
  const allEntries: Record<string, string> = {}
  formData.forEach((value, key) => { allEntries[key] = String(value) })
  console.log('[login] formData entries:', JSON.stringify(allEntries))
  // --- DEBUG END ---

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  console.log('[login] email:', email, '| password length:', password?.length ?? 0)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.log('[login] Supabase error:', error.message, '| status:', error.status)
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  console.log('[login] success → redirecting to /properties')
  redirect('/properties')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const companyName = formData.get('company_name') as string

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'このメールアドレスはすでに登録されています' }
    }
    return { error: '登録に失敗しました。もう一度お試しください' }
  }

  if (!data.user) {
    return { error: 'ユーザー作成に失敗しました' }
  }

  const adminSupabase = createAdminClient()

  // メール確認をスキップ（管理者承認フローで代替するため）
  await adminSupabase.auth.admin.updateUserById(data.user.id, { email_confirm: true })

  // profiles テーブルへ登録（RLS バイパスのため admin client を使用）
  const { error: profileError } = await adminSupabase.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    company_name: companyName,
    role: 'user',
    is_approved: false,
  })

  if (profileError) {
    return { error: 'プロフィールの作成に失敗しました' }
  }

  // メール確認後にサインインしてセッションを確立
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    return { error: 'アカウント作成は完了しましたが、自動ログインに失敗しました。ログイン画面からお試しください' }
  }

  // 管理者への承認依頼メール（失敗してもサインアップは成功扱い）
  await sendAdminNotification({ fullName, companyName, email }).catch(console.error)

  redirect('/pending')
}

async function sendAdminNotification({
  fullName,
  companyName,
  email,
}: {
  fullName: string
  companyName: string
  email: string
}) {
  const supabase = createAdminClient()

  // 管理者のメールアドレスを全件取得
  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin')

  if (!admins?.length) return

  const registeredAt = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const { subject, html } = adminApprovalRequestEmail({
    fullName,
    companyName,
    email,
    registeredAt,
  })

  await resend.emails.send({
    from: EMAIL_FROM,
    to: admins.map((a) => a.email),
    subject,
    html,
  })
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password` }
  )

  if (error) {
    return { error: 'メール送信に失敗しました。メールアドレスを確認してください' }
  }

  return { error: '' }
}
