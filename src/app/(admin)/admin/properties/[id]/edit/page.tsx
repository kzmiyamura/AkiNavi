import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile } from '@/utils/auth'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { DeletePropertyButton } from '@/components/admin/DeletePropertyButton'
import type { RoomInput } from '@/app/actions/properties'

const MASK = '••••••••'

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
  const [data, profile] = await Promise.all([getProperty(id), getAdminProfile()])

  if (!data) notFound()

  const { property, rooms } = data
  const isDeveloper = profile.role === 'developer'
  const displayName = isDeveloper ? MASK : property.name

  return (
    <div className="max-w-3xl mx-auto">
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/properties" className="hover:text-slate-600 transition-colors">
          物件管理
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{displayName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 min-w-0">
          <span className="block truncate">{displayName}</span>
          <span className="text-lg text-slate-500 font-medium">を編集</span>
        </h1>
        {!isDeveloper && (
          <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
        )}
      </div>

      <PropertyForm property={property} initialRooms={rooms} isDeveloper={isDeveloper} />
    </div>
  )
}
