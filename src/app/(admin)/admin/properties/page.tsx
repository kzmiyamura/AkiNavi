import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile } from '@/utils/auth'

const MASK = '••••••••'

async function getProperties() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('properties')
    .select('id, name, address, created_at, image_paths, rooms(id, status)')
    .order('created_at', { ascending: false })

  return (data ?? []).map((p) => {
    const paths = (p.image_paths as string[] | null) ?? []
    const thumbUrl = paths.length > 0
      ? supabase.storage.from('property-images').getPublicUrl(paths[0]).data.publicUrl
      : null
    return { ...p, thumbUrl }
  })
}

export default async function AdminPropertiesPage() {
  const [properties, profile] = await Promise.all([getProperties(), getAdminProfile()])
  const isDeveloper = profile.role === 'developer'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">物件管理</h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/export/properties"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 3v13.5m0 0-4.5-4.5M12 16.5l4.5-4.5" />
            </svg>
            CSV出力
          </a>
          <Link
            href="/admin/properties/import"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            CSV取込
          </Link>
          <Link
            href="/admin/properties/new"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            物件追加
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
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4"
              >
                {/* サムネイル */}
                {property.thumbUrl ? (
                  <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={property.thumbUrl}
                      alt={property.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                    </svg>
                  </div>
                )}

                {/* テキスト */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{isDeveloper ? MASK : property.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">{isDeveloper ? MASK : property.address}</p>
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
