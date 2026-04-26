import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile } from '@/utils/auth'
import { ViewTrendChart } from '@/components/admin/DashboardCharts'
import { RankingTabs } from '@/components/admin/RankingTabs'

async function getStats() {
  const supabase = createAdminClient()

  const todayJst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayFilter = `${todayJst}T00:00:00+09:00`

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
      .gte('viewed_at', todayFilter),
  ])

  return {
    pendingUsers: pendingUsers ?? 0,
    vacantRooms: vacantRooms ?? 0,
    todayViews: todayViews ?? 0,
  }
}

async function getChartData() {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()

  // 日別閲覧数
  const { data: logs } = await supabase
    .from('view_logs')
    .select('viewed_at')
    .gte('viewed_at', since)

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

  // 物件別・個人別・会社別ランキング用に一括取得
  const { data: rankLogs } = await supabase
    .from('view_logs')
    .select(`
      room_id,
      user_id,
      rooms(property_id, properties(name)),
      profiles(full_name, email, company_name)
    `)
    .gte('viewed_at', since)

  type RankMap = Record<string, { name: string; count: number }>
  const propertyMap: RankMap = {}
  const userMap: RankMap = {}
  const companyMap: RankMap = {}

  for (const log of rankLogs ?? []) {
    const room = (log.rooms as unknown) as { property_id: string; properties: { name: string } | null } | null
    const profile = (log.profiles as unknown) as { full_name: string | null; email: string; company_name: string | null } | null

    // 物件別
    const propertyId = room?.property_id
    const propertyName = room?.properties?.name
    if (propertyId && propertyName) {
      if (!propertyMap[propertyId]) propertyMap[propertyId] = { name: propertyName, count: 0 }
      propertyMap[propertyId].count++
    }

    // 個人別
    const userId = log.user_id as string
    const userName = profile?.full_name ?? profile?.email ?? userId
    if (userId) {
      if (!userMap[userId]) userMap[userId] = { name: userName, count: 0 }
      userMap[userId].count++
    }

    // 会社別
    const company = profile?.company_name
    if (company) {
      if (!companyMap[company]) companyMap[company] = { name: company, count: 0 }
      companyMap[company].count++
    }
  }

  const toRanking = (map: RankMap) =>
    Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ name, count }) => ({ name, count }))

  return {
    trendData,
    propertyRanking: toRanking(propertyMap),
    userRanking: toRanking(userMap),
    companyRanking: toRanking(companyMap),
  }
}

export default async function AdminDashboardPage() {
  const [stats, chartData, profile] = await Promise.all([getStats(), getChartData(), getAdminProfile()])
  const isDeveloper = profile.role === 'developer'

  const propertyRanking = isDeveloper
    ? chartData.propertyRanking.map((item, i) => ({ ...item, name: `物件 ${i + 1}` }))
    : chartData.propertyRanking

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="今日の閲覧数" value={stats.todayViews} icon="👁" color="indigo" />
        <StatCard
          label="承認待ちユーザー"
          value={stats.pendingUsers}
          icon="⏳"
          color={stats.pendingUsers > 0 ? 'amber' : 'slate'}
          href="/admin/users"
        />
        <StatCard label="現在の空室数" value={stats.vacantRooms} icon="🏠" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 min-w-0 overflow-hidden">
          <h2 className="text-base font-semibold text-slate-700 mb-4">日別閲覧数推移（過去14日）</h2>
          <ViewTrendChart data={chartData.trendData} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 min-w-0 overflow-hidden">
          <h2 className="text-base font-semibold text-slate-700 mb-4">閲覧ランキング（過去14日）</h2>
          <RankingTabs
            propertyData={propertyRanking}
            userData={chartData.userRanking}
            companyData={chartData.companyRanking}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, color, href,
}: {
  label: string; value: number; icon: string
  color: 'indigo' | 'amber' | 'green' | 'slate'; href?: string
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
  if (href) return <a href={href} className="block hover:shadow-md transition-shadow rounded-2xl">{card}</a>
  return card
}
