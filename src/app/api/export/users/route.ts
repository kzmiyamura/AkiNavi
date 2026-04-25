import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  // 管理者確認
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ユーザー一覧取得
  const { data: users } = await adminSupabase
    .from('profiles')
    .select('email, full_name, company_name, phone_number, is_approved, created_at, approval_date, last_login_at, admin_notes')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  const header = 'メールアドレス,氏名,会社名,電話番号,承認状態,登録日,承認日,最終ログイン日,管理者メモ'
  const rows: string[] = [header]

  for (const u of users ?? []) {
    rows.push([
      csvCell(u.email),
      csvCell(u.full_name),
      csvCell(u.company_name),
      csvCell(u.phone_number),
      u.is_approved ? '承認済み' : '承認待ち',
      formatDate(u.created_at),
      formatDate(u.approval_date),
      formatDate(u.last_login_at),
      csvCell(u.admin_notes),
    ].join(','))
  }

  const csv = '\uFEFF' + rows.join('\r\n') // BOM付きでExcelで文字化けしない
  const today = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="users_${today}.csv"`,
    },
  })
}

function csvCell(value: string | null | undefined): string {
  const str = value ?? ''
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return new Date(value).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
