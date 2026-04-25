'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { importCsv } from '@/app/actions/properties'

const EXAMPLE_CSV = `property_name,address,room_number,rent,common_fee,status
〇〇マンション,〇〇市〇〇町1-1,205,35000,3000,occupied
〇〇マンション,〇〇市〇〇町1-1,301,38000,3000,vacant`

type PreviewRow = {
  property_name: string
  address: string
  room_number: string
  rent: string
  common_fee: string
  status: string
}

function parseCsv(text: string): { headers: string[]; rows: PreviewRow[] } | null {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    return headers.reduce((acc, h, i) => ({ ...acc, [h]: cols[i] ?? '' }), {} as PreviewRow)
  })
  return { headers, rows }
}

const STATUS_LABEL: Record<string, string> = {
  vacant: '空室',
  occupied: '入居中',
  hidden: '非表示',
}

export default function CsvImportPage() {
  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof parseCsv>>(null)
  const [parseError, setParseError] = useState('')
  const [result, setResult] = useState<{ error?: string; imported?: number }>()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setCsvText(text)
      updatePreview(text)
    }
    reader.readAsText(file, 'utf-8')
  }

  const updatePreview = (text: string) => {
    setResult(undefined)
    const parsed = parseCsv(text)
    if (!parsed) {
      setParseError('CSVの形式が正しくありません（ヘッダー行 + 1行以上のデータが必要です）')
      setPreview(null)
    } else {
      setParseError('')
      setPreview(parsed)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value)
    updatePreview(e.target.value)
  }

  const handleImport = () => {
    if (!csvText) return
    const formData = new FormData()
    formData.set('csv', csvText)
    startTransition(async () => {
      const res = await importCsv(undefined, formData)
      setResult(res)
      if (res?.imported !== undefined) {
        setTimeout(() => router.push('/admin/properties'), 1500)
      }
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/properties" className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">CSVインポート</h1>
      </div>

      {/* 形式説明 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-600">
        <p className="font-semibold mb-1">CSVフォーマット</p>
        <p className="mb-2">1行目はヘッダー行（必須列）: <code className="bg-white px-1 rounded border border-slate-200">property_name, address, room_number, rent, common_fee, status</code></p>
        <p className="mb-1">status の値: <code className="bg-white px-1 rounded border border-slate-200">vacant</code>（空室）/ <code className="bg-white px-1 rounded border border-slate-200">occupied</code>（入居中）/ <code className="bg-white px-1 rounded border border-slate-200">hidden</code>（非表示）</p>
        <p className="text-xs text-slate-400 mt-2">同じ物件名+住所の場合は既存物件に統合されます。同じ号室は上書きされます。</p>
      </div>

      {/* ファイル選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">CSVファイルを選択</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      {/* テキスト貼り付け */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">または直接貼り付け</label>
        <textarea
          value={csvText}
          onChange={handleTextChange}
          placeholder={EXAMPLE_CSV}
          rows={6}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono
            focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>

      {parseError && (
        <p className="text-sm text-red-500 mb-4">{parseError}</p>
      )}

      {/* プレビュー */}
      {preview && (
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">
            プレビュー（{preview.rows.length} 行）
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {preview.headers.map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2 text-slate-800">{row.property_name}</td>
                    <td className="px-3 py-2 text-slate-500">{row.address}</td>
                    <td className="px-3 py-2">{row.room_number}</td>
                    <td className="px-3 py-2">{Number(row.rent).toLocaleString()}円</td>
                    <td className="px-3 py-2">{Number(row.common_fee).toLocaleString()}円</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.status === 'vacant' ? 'bg-green-100 text-green-700' :
                        row.status === 'occupied' ? 'bg-slate-100 text-slate-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 結果メッセージ */}
      {result?.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {result.error}
        </div>
      )}
      {result?.imported !== undefined && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          {result.imported} 件の部屋データをインポートしました。物件一覧に戻ります...
        </div>
      )}

      {/* インポートボタン */}
      <button
        onClick={handleImport}
        disabled={!preview || isPending}
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg
          hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
      >
        {isPending ? 'インポート中...' : 'インポート実行'}
      </button>
    </div>
  )
}
