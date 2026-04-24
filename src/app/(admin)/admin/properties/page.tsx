import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getProperties() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('properties')
    .select('id, name, address, created_at, rooms(id, status)')
    .order('created_at', { ascending: false })

  return data ?? []
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">物件管理</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/properties/import"
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            CSVインポート
          </Link>
          <Link
            href="/admin/properties/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            物件を追加
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">物件がまだ登録されていません</p>
          <Link
            href="/admin/properties/new"
            className="text-indigo-600 text-sm font-medium hover:underline"
          >
            最初の物件を登録する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => {
            const rooms = (property.rooms as { id: string; status: string }[]) ?? []
            const vacantCount = rooms.filter((r) => r.status === 'vacant').length
            const totalCount = rooms.filter((r) => r.status !== 'hidden').length

            return (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{property.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{property.address}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    空室 {vacantCount} / {totalCount} 部屋
                  </p>
                </div>
                <Link
                  href={`/admin/properties/${property.id}/edit`}
                  className="shrink-0 px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  編集
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
