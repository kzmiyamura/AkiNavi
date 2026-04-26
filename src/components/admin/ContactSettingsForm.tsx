'use client'

import { useActionState } from 'react'
import { saveContactSettings } from '@/app/actions/notificationSettings'
import { SubmitButton } from '@/components/ui/SubmitButton'

export function ContactSettingsForm({
  contactEmail,
  contactPhone,
  isReadOnly = false,
}: {
  contactEmail: string | null
  contactPhone: string | null
  isReadOnly?: boolean
}) {
  const [state, action, isPending] = useActionState(saveContactSettings, undefined)

  const inputClass = `w-full px-4 py-2.5 rounded-lg border text-base focus:outline-none
    ${isReadOnly
      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
      : 'border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500'}`

  return (
    <form action={action}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">お問い合わせ先（共通設定）</h2>
        <p className="text-xs text-slate-400">物件詳細ページに表示される連絡先です</p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
          <input
            name="contact_email"
            type="email"
            readOnly={isReadOnly}
            defaultValue={contactEmail ?? ''}
            placeholder="info@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
          <input
            name="contact_phone"
            type="tel"
            readOnly={isReadOnly}
            defaultValue={contactPhone ?? ''}
            placeholder="000-0000-0000"
            className={inputClass}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>
        )}

        {!isReadOnly && (
          <SubmitButton label="保存する" loadingLabel="保存中..." isPending={isPending} />
        )}
      </div>
    </form>
  )
}
