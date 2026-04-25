'use client'

import { useRef, useState, useTransition } from 'react'
import { approveUser, rejectUser } from '@/app/actions/users'

type User = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
  admin_notes: string | null
  is_approved: boolean
  role: string
}

const MASK = '••••••••'

export function UserApprovalCard({ user, isReadOnly = false }: { user: User; isReadOnly?: boolean }) {
  const [result, setResult] = useState<{ error?: string; success?: string }>()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const registeredAt = new Date(user.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleApprove = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('role', 'user')
    startTransition(async () => {
      const res = await approveUser(undefined, formData)
      if (res) setResult(res)
    })
  }

  const handleApproveDeveloper = () => {
    const fd = new FormData(formRef.current ?? undefined)
    fd.set('role', 'developer')
    startTransition(async () => {
      const res = await approveUser(undefined, fd)
      if (res) setResult(res)
    })
  }

  const handleReject = () => {
    if (!confirm('このユーザーを拒否しますか？この操作は取り消せません。')) return
    const fd = new FormData()
    fd.append('user_id', user.id)
    startTransition(async () => {
      const res = await rejectUser(undefined, fd)
      if (res) setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 text-sm">
          <span className={result.success.includes('承認') ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {result.success.includes('承認') ? '✓' : '✕'} {result.success}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">
                {isReadOnly ? MASK : (user.full_name ?? '（氏名未設定）')}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                !user.is_approved
                  ? 'bg-amber-100 text-amber-700'
                  : user.role === 'developer'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {!user.is_approved ? '承認待ち' : user.role === 'developer' ? '開発者' : '承認済み'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{isReadOnly ? MASK : user.company_name}</p>
            <p className="text-xs text-slate-400 mt-1">
              {isReadOnly ? MASK : user.email} · 登録日: {registeredAt}
            </p>
          </div>
        </div>

        {!user.is_approved && !isReadOnly && (
          <div className="mt-4 space-y-3">
            <form ref={formRef} onSubmit={handleApprove} className="space-y-3">
              <input type="hidden" name="user_id" value={user.id} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  管理者メモ（任意）
                </label>
                <textarea
                  name="admin_notes"
                  defaultValue={user.admin_notes ?? ''}
                  rows={2}
                  placeholder="承認理由や確認事項など..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {result?.error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {result.error}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {/* ユーザーとして承認 */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3
                      bg-green-600 hover:bg-green-700 disabled:bg-green-400
                      text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {isPending ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                    {isPending ? '処理中...' : 'ユーザー承認'}
                  </button>

                  {/* 開発者として承認 */}
                  <button
                    type="button"
                    onClick={handleApproveDeveloper}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3
                      bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                      text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {isPending ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                      </svg>
                    )}
                    {isPending ? '処理中...' : '開発者承認'}
                  </button>

                  {/* 拒否ボタン */}
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isPending}
                    className="flex items-center justify-center gap-1.5 py-2 px-3
                      border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50
                      text-sm font-semibold rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    拒否
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {user.is_approved && user.admin_notes && (
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
            メモ: {user.admin_notes}
          </div>
        )}
      </div>
    </div>
  )
}
