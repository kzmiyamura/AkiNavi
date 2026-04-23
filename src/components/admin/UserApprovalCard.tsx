'use client'

import { useActionState } from 'react'
import { approveUser, rejectUser, type UserActionState } from '@/app/actions/users'

type User = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
  admin_notes: string | null
  is_approved: boolean
}

export function UserApprovalCard({ user }: { user: User }) {
  const [approveState, approveAction] = useActionState(approveUser, undefined)
  const [rejectState, rejectAction] = useActionState(rejectUser, undefined)

  const registeredAt = new Date(user.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (approveState?.success || rejectState?.success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 text-sm">
          {approveState?.success ? (
            <span className="text-green-600 font-medium">✓ {approveState.success}</span>
          ) : (
            <span className="text-red-500 font-medium">✕ {rejectState?.success}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* ユーザー情報 */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">
                {user.full_name ?? '（氏名未設定）'}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                user.is_approved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {user.is_approved ? '承認済み' : '承認待ち'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{user.company_name}</p>
            <p className="text-xs text-slate-400 mt-1">
              {user.email} · 登録日: {registeredAt}
            </p>
          </div>
        </div>

        {/* 管理者メモ（承認・メモフォーム共用） */}
        {!user.is_approved && (
          <div className="mt-4 space-y-3">
            {/* 承認フォーム */}
            <form action={approveAction} className="space-y-3">
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

              {(approveState?.error || rejectState?.error) && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {approveState?.error ?? rejectState?.error}
                </p>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2">
                <ApproveButton />
                <RejectButton userId={user.id} action={rejectAction} />
              </div>
            </form>
          </div>
        )}

        {/* 承認済みユーザーのメモ表示 */}
        {user.is_approved && user.admin_notes && (
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
            メモ: {user.admin_notes}
          </div>
        )}
      </div>
    </div>
  )
}

function ApproveButton() {
  return (
    <button
      type="submit"
      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4
        bg-green-600 hover:bg-green-700 text-white text-sm font-semibold
        rounded-lg transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
      承認する
    </button>
  )
}

function RejectButton({
  userId,
  action,
}: {
  userId: string
  action: (payload: FormData) => void
}) {
  const handleReject = () => {
    if (!confirm('このユーザーを拒否しますか？この操作は取り消せません。')) return
    const fd = new FormData()
    fd.append('user_id', userId)
    action(fd)
  }

  return (
    <button
      type="button"
      onClick={handleReject}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4
        border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold
        rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
      拒否する
    </button>
  )
}
