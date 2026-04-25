'use client'

import { useTransition } from 'react'
import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(() => logout())
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200
        rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 flex items-center gap-1.5"
    >
      {isPending && (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {isPending ? 'ログアウト中...' : 'ログアウト'}
    </button>
  )
}
