'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  paths: string[]
  propertyName: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`
}

export function ImageSlider({ paths, propertyName }: Props) {
  const [current, setCurrent] = useState(0)

  if (paths.length === 0) {
    return (
      <div className="w-full h-56 sm:h-72 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + paths.length) % paths.length)
  const next = () => setCurrent((c) => (c + 1) % paths.length)

  return (
    <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-100">
      <Image
        src={getImageUrl(paths[current])}
        alt={`${propertyName} - 画像 ${current + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 896px"
        priority
      />

      {/* 前後ボタン（複数画像の場合のみ） */}
      {paths.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
              bg-black/40 hover:bg-black/60 text-white flex items-center justify-center
              transition-colors"
            aria-label="前の画像"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
              bg-black/40 hover:bg-black/60 text-white flex items-center justify-center
              transition-colors"
            aria-label="次の画像"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* ドットインジケーター */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {paths.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`画像 ${i + 1}`}
              />
            ))}
          </div>

          {/* 枚数カウンター */}
          <div className="absolute top-3 right-3 bg-black/40 text-white text-xs
            px-2 py-1 rounded-full">
            {current + 1} / {paths.length}
          </div>
        </>
      )}
    </div>
  )
}
