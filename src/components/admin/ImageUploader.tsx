'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'property-images'
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

type Props = {
  storageFolder: string   // property_id or temp UUID
  initialPaths?: string[]
  onChange: (paths: string[]) => void
}

type UploadItem = {
  path: string
  publicUrl: string
}

function getPublicUrl(path: string): string {
  const supabase = createClient()
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export function ImageUploader({ storageFolder, initialPaths = [], onChange }: Props) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    initialPaths.map((path) => ({ path, publicUrl: getPublicUrl(path) }))
  )
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setError(null)
      const supabase = createClient()
      const newItems: UploadItem[] = []

      for (const file of files) {
        if (!ACCEPTED.includes(file.type)) {
          setError('JPEG / PNG / WebP / GIF のみアップロード可能です')
          continue
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`1ファイル ${MAX_SIZE_MB}MB 以下にしてください`)
          continue
        }

        const ext = file.name.split('.').pop() ?? 'jpg'
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const path = `${storageFolder}/${filename}`

        setUploading(true)
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          setError(`アップロードに失敗しました: ${uploadError.message}`)
        } else {
          newItems.push({ path, publicUrl: getPublicUrl(path) })
        }
      }

      setUploading(false)

      if (newItems.length > 0) {
        setItems((prev) => {
          const updated = [...prev, ...newItems]
          onChange(updated.map((i) => i.path))
          return updated
        })
      }
    },
    [storageFolder, onChange]
  )

  const removeItem = useCallback(
    async (path: string) => {
      const supabase = createClient()
      await supabase.storage.from(BUCKET).remove([path])
      setItems((prev) => {
        const updated = prev.filter((i) => i.path !== path)
        onChange(updated.map((i) => i.path))
        return updated
      })
    },
    [onChange]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      uploadFiles(files)
    },
    [uploadFiles]
  )

  return (
    <div className="space-y-3">
      {/* ドロップゾーン */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          p-8 text-center cursor-pointer transition-colors
          ${dragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">アップロード中...</p>
          </>
        ) : (
          <>
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">
                クリックまたはファイルをドロップ
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                JPEG / PNG / WebP · 最大 {MAX_SIZE_MB}MB
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) uploadFiles(files)
            e.target.value = ''
          }}
        />
      </div>

      {/* エラー */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* サムネイル一覧 */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div key={item.path} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
              <Image
                src={item.publicUrl}
                alt={`物件画像 ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {/* 削除ボタン */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeItem(item.path) }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-red-600"
                aria-label="削除"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              {/* 1枚目に「表紙」バッジ */}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold
                  bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                  表紙
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
