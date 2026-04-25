import { createAdminClient } from '@/lib/supabase/admin'
import { ViewTrendChart, PropertyRankingChart } from '@/components/admin/DashboardCharts'

async function getStats() {
  const supabase = createAdminClient()

  const todayJst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayFilter = `${todayJst}T00:00:00+09:00`
  console.log('[dashboard] todayJst:', todayJst, '| filter:', todayFilter)

  const [
    { count: pendingUsers },
    { count: vacantRooms },
    { count: todayViews, error: viewError },
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
      .gte('viewed_at', todayFilter),
  ])

  console.log('[dashboard] todayViews:', todayViews, '| error:', viewError?.message)

  // view_logs の最新5件を確認
  const { data: recentLogs } = await supabase
    .from('view_logs')
    .select('id, viewed_at, user_id, room_id')
    .order('viewed_at', { ascending: false })
    .limit(5)
  console.log('[dashboard] recent view_logs:', JSON.stringify(recentLogs))

  return {
    pendingUsers: pendingUsers ?? 0,
    vacantRooms: vacantRooms ?? 0,
    todayViews: todayViews ?? 0,
  }
}

async function getChartData() {
  const supabase = createAdminClient()

  // 過去14日分の日別閲覧数
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
  const { data: logs } = await supabase
    .from('view_logs')
    .select('viewed_at')
    .gte('viewed_at', since)
    .order('viewed_at')

  // 日別に集計
  const countByDate: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    countByDate[key] = 0
  }
  for (const log of logs ?? []) {
    const d = new Date(log.viewed_at)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    if (key in countByDate) countByDate[key]++
  }
  const trendData = Object.entries(countByDate).map(([date, count]) => ({ date, count }))

  // 物件別閲覧ランキング（上位5件）
  const { data: rankLogs } = await supabase
    .from('view_logs')
    .select('room_id, rooms(property_id, properties(name))')
    .gte('viewed_at', since)

  const propertyCount: Record<string, { name: string; count: number }> = {}
  for (const log of rankLogs ?? []) {
    const room = (log.rooms as unknown) as { property_id: string; properties: { name: string } | null } | null
    const propertyId = room?.property_id
    const name = room?.properties?.name
    if (!propertyId || !name) continue
    if (!propertyCount[propertyId]) propertyCount[propertyId] = { name, count: 0 }
    propertyCount[propertyId].count++
  }
  const rankingData = Object.values(propertyCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(({ name, count }) => ({ name, count }))

  return { trendData, rankingData }
}

export default async function AdminDashboardPage() {
  const [stats, { trendData, rankingData }] = await Promise.all([
    getStats(),
    getChartData(),
  ])

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

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">日別閲覧数推移（過去14日）</h2>
          <ViewTrendChart data={trendData} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">人気物件ランキング（過去14日）</h2>
          <PropertyRankingChart data={rankingData} />
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
