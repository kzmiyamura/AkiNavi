'use server'

import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

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
  if (rooms.length > 0) {
    const toUpsert = rooms.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      property_id: pid,
      room_number: r.room_number,
      rent: r.rent,
      common_fee: r.common_fee,
      status: r.status,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('rooms').upsert(toUpsert)
    if (error) return { error: '部屋情報の保存に失敗しました' }
  }

  // 編集時：削除された部屋を DB から消す
  if (propertyId) {
    const keptIds = rooms.filter((r) => r.id).map((r) => r.id!)

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

export async function deleteProperty(formData: FormData): Promise<void> {
  await getAdminProfile()
  const supabase = await createClient()

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
