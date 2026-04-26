'use client'

import { useActionState, useState } from 'react'
import { saveAdminSettings } from '@/app/actions/settings'
import { SubmitButton } from '@/components/ui/SubmitButton'

type Props = {
  user: {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
    role: string
    is_active: boolean
  }
  isDeveloper: boolean
}

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  admin:     { label: '管理者',   className: 'bg-red-100 text-red-700' },
  developer: { label: '開発者',   className: 'bg-indigo-100 text-indigo-700' },
  user:      { label: '承認済み', className: 'bg-green-100 text-green-700' },
}

export function SelfProfileCard({ user, isDeveloper }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(saveAdminSettings, undefined)

  const badge = ROLE_BADGE[user.role] ?? ROLE_BADGE.user

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const readOnlyClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-base text-slate-400 cursor-not-allowed'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* カードヘッダー */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-800">
                {user.full_name ?? '（氏名未設定）'}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{user.company_name}</p>
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
            <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            {open ? '閉じる' : '編集'}
          </div>
        </div>
      </button>

      {/* 編集フォーム */}
      {open && (
        <div className="border-t border-slate-100 p-5">
          <form action={action} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">氏名</label>
                <input name="full_name" type="text" defaultValue={user.full_name ?? ''} placeholder="〇〇 〇〇" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">会社名</label>
                <input name="company_name" type="text" defaultValue={user.company_name ?? ''} placeholder="株式会社〇〇" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">メールアドレス</label>
              {isDeveloper ? (
                <div className={readOnlyClass}>{user.email}</div>
              ) : (
                <input name="email" type="email" defaultValue={user.email} required className={inputClass} />
              )}
              {isDeveloper && (
                <p className="text-xs text-slate-400 mt-1">メールアドレスの変更は管理者へお問い合わせください</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">新しいパスワード</label>
                <input name="new_password" type="password" placeholder="8文字以上" autoComplete="new-password" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">パスワード（確認）</label>
                <input name="confirm_password" type="password" placeholder="8文字以上" autoComplete="new-password" className={inputClass} />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
            )}
            {state?.success && (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>
            )}

            <SubmitButton label="保存する" loadingLabel="保存中..." isPending={isPending} />
          </form>
        </div>
      )}
    </div>
  )
}
