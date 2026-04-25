'use client'

import { useActionState } from 'react'
import { saveAdminSettings } from '@/app/actions/settings'
import { SubmitButton } from '@/components/ui/SubmitButton'
import type { Profile } from '@/utils/auth'

const MASK = '••••••••'

export function SettingsForm({ profile, isReadOnly = false }: { profile: Profile; isReadOnly?: boolean }) {
  const [state, action, isPending] = useActionState(saveAdminSettings, undefined)

  const inputClass = `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none
    ${isReadOnly
      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed select-none'
      : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          開発者アカウントでは設定の閲覧のみ可能です
        </div>
      )}

      <form action={action} className="space-y-6">
        {/* プロフィール */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">プロフィール</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">氏名</label>
            <input
              name="full_name"
              type="text"
              readOnly={isReadOnly}
              defaultValue={isReadOnly ? (profile.full_name ? MASK : '') : (profile.full_name ?? '')}
              placeholder={isReadOnly ? '' : '〇〇 〇〇'}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">会社名</label>
            <input
              name="company_name"
              type="text"
              readOnly={isReadOnly}
              defaultValue={isReadOnly ? (profile.company_name ? MASK : '') : (profile.company_name ?? '')}
              placeholder={isReadOnly ? '' : '株式会社〇〇'}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
            <input
              name="phone_number"
              type="tel"
              readOnly={isReadOnly}
              defaultValue={isReadOnly ? (profile.phone_number ? MASK : '') : (profile.phone_number ?? '')}
              placeholder={isReadOnly ? '' : '000-0000-0000'}
              className={inputClass}
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
              type="text"
              readOnly={isReadOnly}
              defaultValue={isReadOnly ? MASK : profile.email}
              required={!isReadOnly}
              className={inputClass}
            />
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">パスワード変更</h2>
          {isReadOnly ? (
            <p className="text-sm text-slate-400">パスワードは表示できません</p>
          ) : (
            <>
              <p className="text-xs text-slate-400">変更しない場合は空欄のままにしてください</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">新しいパスワード</label>
                <input
                  name="new_password"
                  type="password"
                  placeholder="8文字以上"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">新しいパスワード（確認）</label>
                <input
                  name="confirm_password"
                  type="password"
                  placeholder="8文字以上"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>

        {!isReadOnly && (
          <>
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{state.error}</p>
            )}
            {state?.success && (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">{state.success}</p>
            )}
            <SubmitButton label="設定を保存" loadingLabel="保存中..." isPending={isPending} />
          </>
        )}
      </form>
    </div>
  )
}
