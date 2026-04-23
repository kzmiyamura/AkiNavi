import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PropertyList } from '@/components/user/PropertyList'

async function PropertiesData() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('properties')
    .select(`
      id, name, address, image_paths,
      rooms(id, room_number, rent, common_fee, status)
    `)
    .order('name')

  const properties = (data ?? []).map((p) => ({
    ...p,
    image_paths: p.image_paths ?? [],
    // hidden は RLS で除外済みだが型を保証
    rooms: (p.rooms ?? []).filter(
      (r): r is typeof r & { status: 'vacant' | 'occupied' } =>
        r.status === 'vacant' || r.status === 'occupied'
    ),
  }))

  return <PropertyList properties={properties} />
}

function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="h-40 bg-slate-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">物件一覧</h1>
      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertiesData />
      </Suspense>
    </div>
  )
}
