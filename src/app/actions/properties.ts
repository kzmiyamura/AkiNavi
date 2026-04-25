'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminProfile } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type RoomInput = {
  id?: string
  room_number: string
  rent: number
  common_fee: number
  status: 'vacant' | 'occupied' | 'hidden'
}

export type PropertyState = { error: string } | undefined

export async function saveProperty(
  _prev: PropertyState,
  formData: FormData
): Promise<PropertyState> {
  await getAdminProfile()
  const supabase = createAdminClient()

  const propertyId = formData.get('property_id') as string | null
  const name = (formData.get('name') as string).trim()
  const address = (formData.get('address') as string).trim()
  const roomsJson = formData.get('rooms') as string
  const imagePathsJson = formData.get('image_paths') as string

  if (!name || !address) {
    return { error: '物件名と所在地は必須です' }
  }

  let rooms: RoomInput[] = []
  try {
    rooms = JSON.parse(roomsJson)
  } catch {
    return { error: '部屋データの形式が正しくありません' }
  }

  let imagePaths: string[] = []
  try {
    imagePaths = JSON.parse(imagePathsJson || '[]')
  } catch {
    imagePaths = []
  }

  // 物件の作成 or 更新
  let pid = propertyId || ''
  if (!propertyId) {
    const { data, error } = await supabase
      .from('properties')
      .insert({ name, address, image_paths: imagePaths })
      .select('id')
      .single()

    if (error || !data) return { error: '物件の登録に失敗しました' }
    pid = data.id
  } else {
    const { error } = await supabase
      .from('properties')
      .update({ name, address, image_paths: imagePaths })
      .eq('id', propertyId)

    if (error) return { error: '物件の更新に失敗しました' }
  }

  // 部屋の一括 upsert
  const toUpsert = rooms.map((r) => ({
    id: r.id ?? crypto.randomUUID(),
    property_id: pid,
    room_number: r.room_number,
    rent: r.rent,
    common_fee: r.common_fee,
    status: r.status,
    updated_at: new Date().toISOString(),
  }))

  if (toUpsert.length > 0) {
    const { error } = await supabase.from('rooms').upsert(toUpsert)
    if (error) return { error: '部屋情報の保存に失敗しました' }
  }

  // 編集時：削除された部屋を DB から消す
  if (propertyId) {
    const keptIds = toUpsert.map((r) => r.id)

    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('property_id', propertyId)

    const toDelete = (existing ?? [])
      .map((r) => r.id)
      .filter((id) => !keptIds.includes(id))

    if (toDelete.length > 0) {
      await supabase.from('rooms').delete().in('id', toDelete)
    }
  }

  revalidatePath('/admin/properties')
  redirect('/admin/properties')
}

export type CsvImportState = { error?: string; imported?: number } | undefined

export async function importCsv(
  _prev: CsvImportState,
  formData: FormData
): Promise<CsvImportState> {
  await getAdminProfile()

  const csvText = (formData.get('csv') as string).trim()
  if (!csvText) return { error: 'CSVデータが空です' }

  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean)
  const header = lines[0].split(',').map((h) => h.trim())

  const required = ['property_name', 'address', 'room_number', 'rent', 'common_fee', 'status']
  for (const col of required) {
    if (!header.includes(col)) return { error: `ヘッダーに "${col}" が見つかりません` }
  }

  const idx = (col: string) => header.indexOf(col)

  // 物件名+住所でグループ化
  const propertyMap = new Map<string, { name: string; address: string; rooms: RoomInput[] }>()
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim())
    const name = cols[idx('property_name')]
    const address = cols[idx('address')]
    const key = `${name}||${address}`
    if (!propertyMap.has(key)) propertyMap.set(key, { name, address, rooms: [] })
    propertyMap.get(key)!.rooms.push({
      room_number: cols[idx('room_number')],
      rent: parseInt(cols[idx('rent')], 10),
      common_fee: parseInt(cols[idx('common_fee')], 10),
      status: cols[idx('status')] as RoomInput['status'],
    })
  }

  const adminSupabase = createAdminClient()
  let importedCount = 0
  for (const { name, address, rooms } of propertyMap.values()) {
    // 同名物件が既存ならそのID、なければ新規作成
    const { data: existing } = await adminSupabase
      .from('properties')
      .select('id')
      .eq('name', name)
      .eq('address', address)
      .maybeSingle()

    let pid: string
    if (existing) {
      pid = existing.id
    } else {
      const { data, error } = await adminSupabase
        .from('properties')
        .insert({ name, address })
        .select('id')
        .single()
      if (error || !data) return { error: `物件「${name}」の登録に失敗しました` }
      pid = data.id
    }

    // 部屋を upsert（room_number + property_id が同じなら上書き）
    const { data: existingRooms } = await adminSupabase
      .from('rooms')
      .select('id, room_number')
      .eq('property_id', pid)

    const toUpsert = rooms.map((r) => {
      const found = existingRooms?.find((e) => e.room_number === r.room_number)
      return {
        id: found?.id ?? crypto.randomUUID(),
        property_id: pid,
        room_number: r.room_number,
        rent: r.rent,
        common_fee: r.common_fee,
        status: r.status,
        updated_at: new Date().toISOString(),
      }
    })

    const { error: roomError } = await adminSupabase.from('rooms').upsert(toUpsert)
    if (roomError) return { error: `物件「${name}」の部屋登録に失敗しました` }
    importedCount += rooms.length
  }

  revalidatePath('/admin/properties')
  return { imported: importedCount }
}

export async function deleteProperty(formData: FormData): Promise<void> {
  await getAdminProfile()
  const supabase = createAdminClient()

  const propertyId = formData.get('property_id') as string

  // Storage の画像を削除
  const { data: property } = await supabase
    .from('properties')
    .select('image_paths')
    .eq('id', propertyId)
    .single()

  if (property?.image_paths?.length) {
    await supabase.storage
      .from('property-images')
      .remove(property.image_paths)
  }

  await supabase.from('rooms').delete().eq('property_id', propertyId)
  await supabase.from('properties').delete().eq('id', propertyId)

  revalidatePath('/admin/properties')
  redirect('/admin/properties')
}
