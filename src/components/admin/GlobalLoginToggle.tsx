'use client'

import { useTransition } from 'react'
import { toggleAllUsersLogin } from '@/app/actions/users'

export function GlobalLoginToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const next = !enabled
    const msg = next
      ? '全ユーザーのログインを再開しますか？'
      : '全ユーザーのログインを停止しますか？\n停止中は一般ユーザー全員がログインできなくなります。'
    if (!confirm(msg)) return

    const fd = new FormData()
    fd.set('enabled', String(next))
    startTransition(async () => { await toggleAllUsersLogin(undefined, fd) })
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
      enabled ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-sm font-medium ${enabled ? 'text-slate-700' : 'text-red-700'}`}>
          全ユーザーのログイン: {enabled ? '許可中' : '停止中'}
        </span>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
          enabled
            ? 'border border-red-200 text-red-600 hover:bg-red-50'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isPending ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : enabled ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 12.728M5.636 5.636 12 12m0 0 6.364 6.364" />
          </svg>
        )}
        {isPending ? '処理中...' : enabled ? '全員を停止' : '全員を再開'}
      </button>
    </div>
  )
}
