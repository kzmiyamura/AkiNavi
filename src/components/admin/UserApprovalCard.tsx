'use client'

import { useRef, useState, useTransition } from 'react'
import { approveUser, rejectUser, toggleUserActive, deleteUser } from '@/app/actions/users'

type User = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
  admin_notes: string | null
  is_approved: boolean
  is_active: boolean
  role: string
}

const MASK = '••••••••'

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  admin:     { label: '管理者',   className: 'bg-red-100 text-red-700' },
  developer: { label: '開発者',   className: 'bg-indigo-100 text-indigo-700' },
  user:      { label: '承認済み', className: 'bg-green-100 text-green-700' },
}

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

  const handleApproveAs = (role: 'admin' | 'developer') => {
    const fd = new FormData(formRef.current ?? undefined)
    fd.set('role', role)
    startTransition(async () => {
      const res = await approveUser(undefined, fd)
      if (res) setResult(res)
    })
  }

  const handleToggleActive = () => {
    const next = !user.is_active
    if (!confirm(next ? 'このユーザーのログインを再開しますか？' : 'このユーザーのログインを停止しますか？')) return
    const fd = new FormData()
    fd.set('user_id', user.id)
    fd.set('is_active', String(next))
    startTransition(async () => {
      const res = await toggleUserActive(undefined, fd)
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

  const handleDelete = () => {
    if (!confirm(`「${user.full_name ?? user.email}」を削除しますか？この操作は取り消せません。`)) return
    const fd = new FormData()
    fd.append('user_id', user.id)
    startTransition(async () => {
      const res = await deleteUser(undefined, fd)
      if (res) setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 text-sm">
          <span className={result.success.includes('承認') ? 'text-green-600 font-medium' : 'text-slate-600 font-medium'}>
            ✓ {result.success}
          </span>
        </div>
      </div>
    )
  }

  const badge = user.is_approved ? (ROLE_BADGE[user.role] ?? ROLE_BADGE.user) : null

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-800">
                {isReadOnly ? MASK : (user.full_name ?? '（氏名未設定）')}
              </p>
              {!user.is_approved ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  承認待ち
                </span>
              ) : (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge!.className}`}>
                  {badge!.label}
                </span>
              )}
              {user.is_approved && !user.is_active && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  停止中
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{isReadOnly ? MASK : user.company_name}</p>
            <p className="text-xs text-slate-400 mt-1">
              {isReadOnly ? MASK : user.email} · 登録日: {registeredAt}
            </p>
          </div>
          {/* 停止・削除ボタン（承認済みかつ管理者のみ） */}
          {user.is_approved && !isReadOnly && (
            <div className="shrink-0 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                  user.is_active
                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                    : 'border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                {user.is_active ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    停止
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    再開
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                削除
              </button>
            </div>
          )}
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

              <div className="flex gap-2 flex-wrap">
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
                  {isPending ? '処理中...' : 'ユーザー'}
                </button>

                {/* 開発者として承認 */}
                <button
                  type="button"
                  onClick={() => handleApproveAs('developer')}
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
                  {isPending ? '処理中...' : '開発者'}
                </button>

                {/* 管理者として承認 */}
                <button
                  type="button"
                  onClick={() => handleApproveAs('admin')}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3
                    bg-red-600 hover:bg-red-700 disabled:bg-red-400
                    text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {isPending ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  )}
                  {isPending ? '処理中...' : '管理者'}
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
