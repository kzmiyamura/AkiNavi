import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { deleteProperty } from '@/app/actions/properties'
import type { RoomInput } from '@/app/actions/properties'

async function getProperty(id: string) {
  const supabase = createAdminClient()

  const { data: property } = await supabase
    .from('properties')
    .select('id, name, address, image_paths')
    .eq('id', id)
    .single()

  if (!property) return null

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, room_number, rent, common_fee, status')
    .eq('property_id', id)
    .order('room_number')

  return { property, rooms: (rooms ?? []) as RoomInput[] }
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getProperty(id)

  if (!data) notFound()

  const { property, rooms } = data

  return (
    <div className="max-w-3xl mx-auto">
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/properties" className="hover:text-slate-600 transition-colors">
          物件管理
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{property.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{property.name} を編集</h1>

        {/* 物件削除フォーム */}
        <form action={deleteProperty}>
          <input type="hidden" name="property_id" value={property.id} />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200
              rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            物件を削除
          </button>
        </form>
      </div>

      <PropertyForm property={property} initialRooms={rooms} />
    </div>
  )
}
