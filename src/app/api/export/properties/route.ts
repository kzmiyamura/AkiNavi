import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  // 管理者かどうか確認
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 全物件・部屋を取得
  const { data: properties } = await adminSupabase
    .from('properties')
    .select('name, address, rooms(room_number, rent, common_fee, status)')
    .order('name')

  // CSV 生成
  const header = 'property_name,address,room_number,rent,common_fee,status'
  const rows: string[] = [header]

  for (const property of properties ?? []) {
    const rooms = (property.rooms as {
      room_number: string
      rent: number
      common_fee: number
      status: string
    }[]) ?? []

    if (rooms.length === 0) {
      rows.push(`${csvCell(property.name)},${csvCell(property.address)},,,, `)
    } else {
      for (const room of rooms) {
        rows.push([
          csvCell(property.name),
          csvCell(property.address),
          csvCell(room.room_number),
          room.rent,
          room.common_fee,
          csvCell(room.status),
        ].join(','))
      }
    }
  }

  const csv = rows.join('\r\n')
  const today = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="properties_${today}.csv"`,
    },
  })
}

function csvCell(value: string | null | undefined): string {
  const str = value ?? ''
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
