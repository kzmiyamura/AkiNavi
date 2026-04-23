/** 家賃を「¥35,000」形式にフォーマットする */
export function formatRent(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

/** 部屋のステータスを日本語ラベルに変換する */
export function getRoomStatusLabel(status: 'vacant' | 'occupied' | 'hidden'): string {
  const labels = {
    vacant: '空室',
    occupied: '入居者決定',
    hidden: '非表示',
  }
  return labels[status]
}

/** 物件の空室数を集計する */
export function countVacantRooms(rooms: { status: string }[]): number {
  return rooms.filter((r) => r.status === 'vacant').length
}
