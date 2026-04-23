import { describe, it, expect } from 'vitest'
import { formatRent, getRoomStatusLabel, countVacantRooms } from './format'

describe('formatRent', () => {
  it('家賃を ¥ 付きのカンマ区切りにフォーマットする', () => {
    expect(formatRent(35000)).toBe('¥35,000')
    expect(formatRent(100000)).toBe('¥100,000')
    expect(formatRent(0)).toBe('¥0')
  })
})

describe('getRoomStatusLabel', () => {
  it('vacant → 空室', () => expect(getRoomStatusLabel('vacant')).toBe('空室'))
  it('occupied → 入居者決定', () => expect(getRoomStatusLabel('occupied')).toBe('入居者決定'))
  it('hidden → 非表示', () => expect(getRoomStatusLabel('hidden')).toBe('非表示'))
})

describe('countVacantRooms', () => {
  it('空室の部屋数を返す', () => {
    const rooms = [
      { status: 'vacant' },
      { status: 'occupied' },
      { status: 'vacant' },
      { status: 'hidden' },
    ]
    expect(countVacantRooms(rooms)).toBe(2)
  })

  it('空室がない場合は 0 を返す', () => {
    expect(countVacantRooms([{ status: 'occupied' }])).toBe(0)
  })

  it('空配列の場合は 0 を返す', () => {
    expect(countVacantRooms([])).toBe(0)
  })
})
