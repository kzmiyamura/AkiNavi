import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { DeletePropertyButton } from '@/components/admin/DeletePropertyButton'
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

        <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
      </div>

      <PropertyForm property={property} initialRooms={rooms} />
    </div>
  )
}
