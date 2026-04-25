import { createAdminClient } from '@/lib/supabase/admin'
import { UserApprovalCard } from '@/components/admin/UserApprovalCard'

async function getUsers() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, company_name, created_at, admin_notes, is_approved, role')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function AdminUsersPage() {
  const users = await getUsers()
  const pending = users.filter((u) => !u.is_approved)
  const approved = users.filter((u) => u.is_approved)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">ユーザー管理</h1>
          {pending.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
              承認待ち {pending.length}件
            </span>
          )}
        </div>
        <a
          href="/api/export/users"
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 3v13.5m0 0-4.5-4.5M12 16.5l4.5-4.5" />
          </svg>
          CSVエクスポート
        </a>
      </div>

      {/* 承認待ちセクション */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          承認待ち
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            承認待ちのユーザーはいません
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((user) => (
              <UserApprovalCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </section>

      {/* 承認済みセクション */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          承認済み（{approved.length}件）
        </h2>
        {approved.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
            承認済みユーザーはいません
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map((user) => (
              <UserApprovalCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
