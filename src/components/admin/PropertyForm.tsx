'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProperty, type RoomInput } from '@/app/actions/properties'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { ImageUploader } from '@/components/admin/ImageUploader'

type Props = {
  property?: {
    id: string
    name: string
    address: string
    image_paths?: string[]
    notes?: string | null
  }
  initialRooms?: RoomInput[]
  isDeveloper?: boolean
}

const STATUS_OPTIONS: { value: RoomInput['status']; label: string; color: string }[] = [
  { value: 'vacant',   label: '空室',       color: 'text-green-700 bg-green-50' },
  { value: 'occupied', label: '入居者決定', color: 'text-slate-600 bg-slate-100' },
  { value: 'hidden',   label: '非表示',     color: 'text-red-600 bg-red-50' },
]

const AD_MONTHS_OPTIONS = [1, 1.5, 2, 2.5, 3]

function newRow(): RoomInput {
  return { room_number: '', rent: 0, common_fee: 0, water_fee_type: null, water_fee_amount: null, key_money: null, ad_months: null, notes: '', status: 'vacant' }
}

const MASK = '••••••••'

export function PropertyForm({ property, initialRooms = [], isDeveloper = false }: Props) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(saveProperty, undefined)
  const [rows, setRows] = useState<RoomInput[]>(
    initialRooms.length > 0 ? initialRooms : [newRow()]
  )
  // 画像パス管理
  const [imagePaths, setImagePaths] = useState<string[]>(property?.image_paths ?? [])
  // Storage フォルダ（新規: 安定した UUID、編集: property.id）
  const [storageFolder] = useState<string>(
    () => property?.id ?? crypto.randomUUID()
  )

  const addRow = () => setRows((prev) => [...prev, newRow()])

  const removeRow = (index: number) => {
    if (!confirm('この部屋を削除しますか？')) return
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRow = <K extends keyof RoomInput>(
    index: number,
    key: K,
    value: RoomInput[K]
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    )
  }

  return (
    <form action={action} className="space-y-6">
      {/* 物件 ID (編集時) */}
      {property && (
        <input type="hidden" name="property_id" value={property.id} />
      )}

      {/* 部屋データ (JSON) */}
      <input type="hidden" name="rooms" value={JSON.stringify(rows)} />
      {/* 画像パス (JSON) */}
      <input type="hidden" name="image_paths" value={JSON.stringify(imagePaths)} />

      {/* 物件基本情報 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">物件情報</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            物件名 {!isDeveloper && <span className="text-red-500">*</span>}
          </label>
          {isDeveloper ? (
            <>
              <input type="hidden" name="name" value={property?.name ?? ''} />
              <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-base text-slate-400 select-none">
                {MASK}
              </div>
            </>
          ) : (
            <input
              name="name"
              type="text"
              required
              defaultValue={property?.name}
              placeholder="〇〇マンション"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-base text-slate-900
                placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            所在地 {!isDeveloper && <span className="text-red-500">*</span>}
          </label>
          {isDeveloper ? (
            <>
              <input type="hidden" name="address" value={property?.address ?? ''} />
              <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-base text-slate-400 select-none">
                {MASK}
              </div>
            </>
          ) : (
            <input
              name="address"
              type="text"
              required
              defaultValue={property?.address}
              placeholder="〇〇市〇〇町1-1-1"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-base text-slate-900
                placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">物件備考</label>
          <textarea
            name="property_notes"
            defaultValue={property?.notes ?? ''}
            rows={3}
            placeholder="物件全体に関する備考を入力"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-base text-slate-900
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>

      {/* 画像アップロード */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">チラシ・物件画像</h2>
        <ImageUploader
          storageFolder={storageFolder}
          initialPaths={imagePaths}
          onChange={setImagePaths}
        />
      </div>

      {/* 部屋一括編集テーブル */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">
            部屋一覧
            <span className="ml-2 text-sm font-normal text-slate-400">
              {rows.length} 部屋
            </span>
          </h2>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium
              hover:text-indigo-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            部屋を追加
          </button>
        </div>

        {/* デスクトップ: テーブル表示 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left w-24">号室</th>
                <th className="px-4 py-3 text-left w-32">家賃（円）</th>
                <th className="px-4 py-3 text-left w-32">共益費（円）</th>
                <th className="px-4 py-3 text-left w-48">水道代</th>
                <th className="px-4 py-3 text-left w-32">礼金（円）</th>
                <th className="px-4 py-3 text-left w-32">広告料</th>
                <th className="px-4 py-3 text-left w-48">備考</th>
                <th className="px-4 py-3 text-left">状態</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.room_number}
                      onChange={(e) => updateRow(i, 'room_number', e.target.value)}
                      placeholder="101"
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.rent || ''}
                      onChange={(e) => updateRow(i, 'rent', Number(e.target.value))}
                      placeholder="35000"
                      min={0}
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.common_fee || ''}
                      onChange={(e) => updateRow(i, 'common_fee', Number(e.target.value))}
                      placeholder="3000"
                      min={0}
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.water_fee_type ?? ''}
                      onChange={(e) => updateRow(i, 'water_fee_type', (e.target.value || null) as RoomInput['water_fee_type'])}
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900"
                    >
                      <option value="">未設定</option>
                      <option value="fixed">金額固定</option>
                      <option value="meter">メーター検針</option>
                    </select>
                    {row.water_fee_type === 'fixed' && (
                      <input
                        type="number"
                        value={row.water_fee_amount ?? ''}
                        onChange={(e) => updateRow(i, 'water_fee_amount', e.target.value ? Number(e.target.value) : null)}
                        placeholder="2000"
                        min={0}
                        className="mt-1 w-full px-2 py-1.5 rounded border border-slate-200
                          focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.key_money ?? ''}
                      onChange={(e) => updateRow(i, 'key_money', e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      min={0}
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.ad_months ?? ''}
                      onChange={(e) => updateRow(i, 'ad_months', e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900"
                    >
                      <option value="">未設定</option>
                      {AD_MONTHS_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}ヶ月</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => updateRow(i, 'notes', e.target.value)}
                      placeholder="備考"
                      className="w-full px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(i, 'status', e.target.value as RoomInput['status'])}
                      className={`px-2 py-1.5 rounded border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base font-medium
                        ${STATUS_OPTIONS.find((s) => s.value === row.status)?.color}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      aria-label="削除"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* モバイル: カード表示 */}
        <div className="md:hidden divide-y divide-slate-100">
          {rows.map((row, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">部屋 {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">号室</label>
                  <input
                    type="text"
                    value={row.room_number}
                    onChange={(e) => updateRow(i, 'room_number', e.target.value)}
                    placeholder="101"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">家賃（円）</label>
                  <input
                    type="number"
                    value={row.rent || ''}
                    onChange={(e) => updateRow(i, 'rent', Number(e.target.value))}
                    placeholder="35000"
                    min={0}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">共益費（円）</label>
                  <input
                    type="number"
                    value={row.common_fee || ''}
                    onChange={(e) => updateRow(i, 'common_fee', Number(e.target.value))}
                    placeholder="3000"
                    min={0}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">水道代</label>
                  <select
                    value={row.water_fee_type ?? ''}
                    onChange={(e) => updateRow(i, 'water_fee_type', (e.target.value || null) as RoomInput['water_fee_type'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900"
                  >
                    <option value="">未設定</option>
                    <option value="fixed">金額固定</option>
                    <option value="meter">メーター検針</option>
                  </select>
                  {row.water_fee_type === 'fixed' && (
                    <input
                      type="number"
                      value={row.water_fee_amount ?? ''}
                      onChange={(e) => updateRow(i, 'water_fee_amount', e.target.value ? Number(e.target.value) : null)}
                      placeholder="2000"
                      min={0}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200
                        focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">礼金（円）</label>
                  <input
                    type="number"
                    value={row.key_money ?? ''}
                    onChange={(e) => updateRow(i, 'key_money', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                    min={0}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">広告料</label>
                  <select
                    value={row.ad_months ?? ''}
                    onChange={(e) => updateRow(i, 'ad_months', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900"
                  >
                    <option value="">未設定</option>
                    {AD_MONTHS_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}ヶ月</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">状態</label>
                  <select
                    value={row.status}
                    onChange={(e) => updateRow(i, 'status', e.target.value as RoomInput['status'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">備考</label>
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) => updateRow(i, 'notes', e.target.value)}
                    placeholder="備考"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200
                      focus:outline-none focus:ring-1 focus:ring-indigo-500 text-base text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">
            「部屋を追加」ボタンで部屋を登録してください
          </div>
        )}
      </div>

      <ErrorMessage message={state?.error} />

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/properties')}
          className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 text-sm
            font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          キャンセル
        </button>
        <div className="flex-1">
          <SubmitButton
            label={property ? '変更を保存' : '物件を登録'}
            loadingLabel="保存中..."
            isPending={isPending}
          />
        </div>
      </div>
    </form>
  )
}
