import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()

  const [
    { count: pendingUsers },
    { count: vacantRooms },
    { count: todayViews },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false)
      .eq('role', 'user'),
    supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'vacant'),
    supabase
      .from('view_logs')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', new Date().toISOString().split('T')[0]),
  ])

  return {
    pendingUsers: pendingUsers ?? 0,
    vacantRooms: vacantRooms ?? 0,
    todayViews: todayViews ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="今日の閲覧数"
          value={stats.todayViews}
          icon="👁"
          color="indigo"
        />
        <StatCard
          label="承認待ちユーザー"
          value={stats.pendingUsers}
          icon="⏳"
          color={stats.pendingUsers > 0 ? 'amber' : 'slate'}
          href="/admin/users"
        />
        <StatCard
          label="現在の空室数"
          value={stats.vacantRooms}
          icon="🏠"
          color="green"
        />
      </div>

      {/* グラフエリア（Day 22-23 で Recharts 実装予定） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">日別閲覧数推移</h2>
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            グラフは Day 22-23 で実装予定
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">人気物件ランキング</h2>
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            グラフは Day 22-23 で実装予定
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string
  value: number
  icon: string
  color: 'indigo' | 'amber' | 'green' | 'slate'
  href?: string
}) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    slate: 'bg-slate-50 text-slate-500',
  }

  const card = (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block hover:shadow-md transition-shadow rounded-2xl">
        {card}
      </a>
    )
  }

  return card
}
