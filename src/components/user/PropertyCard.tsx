'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatRent } from '@/utils/format'

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`
}

export function PropertyCard({ property }: { property: Property }) {
  const [open, setOpen] = useState(false)

  const vacantRooms = property.rooms.filter((r) => r.status === 'vacant')
  const hasImages = property.image_paths.length > 0
  const coverUrl = hasImages ? getImageUrl(property.image_paths[0]) : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden
      shadow-sm hover:shadow-md transition-shadow">

      {/* サムネイル */}
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative w-full h-40 bg-slate-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
          )}

          {/* 空室バッジ */}
          <div className="absolute top-2 left-2">
            {vacantRooms.length > 0 ? (
              <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                {vacantRooms.length}部屋空き
              </span>
            ) : (
              <span className="bg-slate-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                満室
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 物件情報 */}
      <div className="p-4">
        <Link href={`/properties/${property.id}`} className="block group">
          <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
            {property.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {property.address}
          </p>
        </Link>

        {/* アコーディオントグル */}
        {property.rooms.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 w-full flex items-center justify-between text-sm
              text-slate-500 hover:text-slate-700 transition-colors py-1"
          >
            <span>部屋一覧（{property.rooms.length}件）</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}

        {/* アコーディオン本体 */}
        {open && (
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">号室</th>
                  <th className="px-3 py-2 text-right">家賃</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">共益費</th>
                  <th className="px-3 py-2 text-center">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {property.rooms.map((room) => (
                  <tr key={room.id} className={room.status === 'vacant' ? 'bg-green-50/40' : ''}>
                    <td className="px-3 py-2.5 font-medium text-slate-700">{room.room_number}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatRent(room.rent)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-400 text-xs hidden sm:table-cell">
                      {formatRent(room.common_fee)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {room.status === 'vacant' ? (
                        <span className="inline-block bg-green-100 text-green-700 text-xs
                          font-semibold px-2 py-0.5 rounded-full">
                          空室
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-100 text-slate-400 text-xs
                          font-semibold px-2 py-0.5 rounded-full">
                          決定済
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
