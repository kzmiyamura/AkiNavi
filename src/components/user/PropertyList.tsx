'use client'

import { useMemo, useState } from 'react'
import { PropertyCard } from './PropertyCard'

type Room = {
  id: string
  room_number: string
  rent: number
  common_fee: number
  status: 'vacant' | 'occupied'
}

type Property = {
  id: string
  name: string
  address: string
  image_paths: string[]
  rooms: Room[]
}

const RENT_LIMITS = [
  { label: 'すべて', value: 0 },
  { label: '〜5万', value: 50000 },
  { label: '〜7万', value: 70000 },
  { label: '〜10万', value: 100000 },
]

export function PropertyList({ properties }: { properties: Property[] }) {
  const [query, setQuery] = useState('')
  const [rentLimit, setRentLimit] = useState(0)
  const [vacantOnly, setVacantOnly] = useState(false)

  const filtered = useMemo(() => {
    return properties
      .map((p) => {
        // hidden は RLS で除外済み。status の型を絞る
        const rooms = p.rooms as Room[]

        // 家賃フィルタ（空室のみに適用）
        const filteredRooms = rentLimit
          ? rooms.filter((r) => r.status !== 'vacant' || r.rent <= rentLimit)
          : rooms

        return { ...p, rooms: filteredRooms }
      })
      .filter((p) => {
        const q = query.trim().toLowerCase()
        const matchQuery =
          !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
        const matchVacant =
          !vacantOnly || p.rooms.some((r) => r.status === 'vacant')
        return matchQuery && matchVacant
      })
  }, [properties, query, rentLimit, vacantOnly])

  return (
    <div>
      {/* 検索・フィルタバー */}
      <div className="mb-6 space-y-3">
        {/* テキスト検索 */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="物件名・住所で検索..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm
              bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* クイックフィルタ */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">家賃上限：</span>
          {RENT_LIMITS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRentLimit(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                rentLimit === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setVacantOnly((v) => !v)}
            className={`ml-2 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              vacantOnly
                ? 'bg-green-600 text-white border-green-600'
                : 'border-slate-200 text-slate-500 hover:border-green-300'
            }`}
          >
            空室のみ
          </button>
        </div>
      </div>

      {/* 件数 */}
      <p className="text-xs text-slate-400 mb-4">
        {filtered.length}件 / 全{properties.length}件
      </p>

      {/* 物件グリッド */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-sm">条件に一致する物件が見つかりません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
