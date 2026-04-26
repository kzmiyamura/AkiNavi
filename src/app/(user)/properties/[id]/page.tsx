import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ImageSlider } from '@/components/user/ImageSlider'
import { ViewLogger } from '@/components/user/ViewLogger'
import { formatRent } from '@/utils/format'

async function getProperty(id: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('properties')
    .select(`
      id, name, address, image_paths,
      rooms(id, room_number, rent, common_fee, status)
    `)
    .eq('id', id)
    .single()

  return data
}

async function getAdminContact() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('email, phone_number')
    .eq('role', 'admin')
    .order('approval_date', { ascending: true })
    .limit(1)
    .maybeSingle()
  return { email: data?.email ?? '', phone: (data as Record<string, unknown>)?.phone_number as string ?? '' }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [property, adminContact] = await Promise.all([getProperty(id), getAdminContact()])
  if (!property) notFound()

  const CONTACT_EMAIL = adminContact.email
  const CONTACT_PHONE = adminContact.phone

  const imagePaths: string[] = property.image_paths ?? []
  const rooms = (property.rooms ?? []).filter(
    (r) => r.status === 'vacant' || r.status === 'occupied'
  )
  const vacantCount = rooms.filter((r) => r.status === 'vacant').length

  return (
    <div className="max-w-2xl mx-auto">
      <ViewLogger roomIds={rooms.map((r) => r.id!)} />
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/properties" className="hover:text-slate-600 transition-colors">
          物件一覧
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{property.name}</span>
      </nav>

      {/* 画像スライダー */}
      <ImageSlider paths={imagePaths} propertyName={property.name} />

      {/* 物件情報 */}
      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{property.name}</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {property.address}
            </p>
          </div>

          {/* 空室バッジ */}
          {vacantCount > 0 ? (
            <span className="shrink-0 bg-green-100 text-green-700 text-sm font-bold
              px-3 py-1.5 rounded-full">
              {vacantCount}部屋空き
            </span>
          ) : (
            <span className="shrink-0 bg-slate-100 text-slate-400 text-sm font-bold
              px-3 py-1.5 rounded-full">
              満室
            </span>
          )}
        </div>

        {/* 部屋一覧テーブル */}
        {rooms.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-600">部屋一覧</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left">号室</th>
                  <th className="px-5 py-3 text-right">家賃</th>
                  <th className="px-5 py-3 text-right hidden sm:table-cell">共益費</th>
                  <th className="px-5 py-3 text-center">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rooms.map((room) => (
                  <tr key={room.id} className={room.status === 'vacant' ? 'bg-green-50/30' : ''}>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {room.room_number}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600 font-medium">
                      {formatRent(room.rent)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-xs hidden sm:table-cell">
                      {formatRent(room.common_fee)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {room.status === 'vacant' ? (
                        <span className="inline-block bg-green-100 text-green-700 text-xs
                          font-bold px-2.5 py-1 rounded-full">
                          空室
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-100 text-slate-400 text-xs
                          font-bold px-2.5 py-1 rounded-full">
                          決定済
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 問い合わせボタン */}
        <div className="mt-6 space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">お問い合わせ</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {CONTACT_PHONE && (
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5
                  bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm
                  rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                電話で問い合わせ
              </a>
            )}
            {CONTACT_EMAIL && (
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`【AkiNavi】${property.name}について`)}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5
                  border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold text-sm
                  rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                メールで問い合わせ
              </a>
            )}
            {!CONTACT_PHONE && !CONTACT_EMAIL && (
              <p className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4 text-center">
                お問い合わせ先は管理者にご確認ください
              </p>
            )}
          </div>
        </div>

        {/* 戻るリンク */}
        <div className="mt-8">
          <Link
            href="/properties"
            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            物件一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
