'use client'

import { useActionState } from 'react'
import { saveUserProfile } from '@/app/actions/settings'
import { SubmitButton } from '@/components/ui/SubmitButton'
import type { Profile } from '@/utils/auth'

export function UserProfileForm({ profile }: { profile: Profile }) {
  const [state, action, isPending] = useActionState(saveUserProfile, undefined)

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-slate-300 text-base text-slate-900 ' +
    'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <form action={action} className="space-y-6">
      {/* プロフィール */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">プロフィール</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">氏名</label>
          <input
            name="full_name"
            type="text"
            defaultValue={profile.full_name ?? ''}
            placeholder="〇〇 〇〇"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">会社名</label>
          <input
            name="company_name"
            type="text"
            defaultValue={profile.company_name ?? ''}
            placeholder="株式会社〇〇"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
          <input
            name="phone_number"
            type="tel"
            defaultValue={profile.phone_number ?? ''}
            placeholder="000-0000-0000"
            className={inputClass}
          />
        </div>
      </div>

      {/* メールアドレス（読み取り専用） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">メールアドレス</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
          <input
            type="text"
            readOnly
            value={profile.email}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-base text-slate-400 cursor-not-allowed select-none"
          />
          <p className="text-xs text-slate-400 mt-1">メールアドレスの変更は管理者へお問い合わせください</p>
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
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">新しいパスワード（確認）</label>
          <input
            name="confirm_password"
            type="password"
            placeholder="8文字以上"
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">{state.success}</p>
      )}

      <SubmitButton label="保存する" loadingLabel="保存中..." isPending={isPending} />
    </form>
  )
}
