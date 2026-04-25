'use client'

import { useActionState } from 'react'
import { saveAdminSettings } from '@/app/actions/settings'
import { SubmitButton } from '@/components/ui/SubmitButton'
import type { Profile } from '@/utils/auth'

export function SettingsForm({ profile }: { profile: Profile }) {
  const [state, action, isPending] = useActionState(saveAdminSettings, undefined)

  return (
    <div className="space-y-6">
      {/* プロフィール */}
      <form action={action} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">プロフィール</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">氏名</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile.full_name ?? ''}
              placeholder="山田 太郎"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">会社名</label>
            <input
              name="company_name"
              type="text"
              defaultValue={profile.company_name ?? ''}
              placeholder="株式会社〇〇"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
            <input
              name="phone_number"
              type="tel"
              defaultValue={profile.phone_number ?? ''}
              placeholder="06-1234-5678"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* メールアドレス */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">メールアドレス</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
            <input
              name="email"
              type="email"
              defaultValue={profile.email}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">パスワード変更</h2>
          <p className="text-xs text-slate-400">変更しない場合は空欄のままにしてください</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">新しいパスワード</label>
            <input
              name="new_password"
              type="password"
              placeholder="8文字以上"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">新しいパスワード（確認）</label>
            <input
              name="confirm_password"
              type="password"
              placeholder="8文字以上"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* メッセージ */}
        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">{state.success}</p>
        )}

        <SubmitButton label="設定を保存" loadingLabel="保存中..." isPending={isPending} />
      </form>
    </div>
  )
}
