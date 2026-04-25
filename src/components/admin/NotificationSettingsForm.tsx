'use client'

import { useActionState, useEffect, useRef } from 'react'
import { saveNotificationSettings } from '@/app/actions/notificationSettings'

export function NotificationSettingsForm({
  notifyOnPropertyChange,
  isReadOnly = false,
}: {
  notifyOnPropertyChange: boolean
  isReadOnly?: boolean
}) {
  const [state, action, isPending] = useActionState(saveNotificationSettings, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  // トグル変更時に自動送信
  const handleChange = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <form ref={formRef} action={action}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">通知設定</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">物件変更・追加通知</p>
            <p className="text-xs text-slate-400 mt-0.5">
              物件が登録・更新された際に承認済みユーザー全員へメールを送信します
            </p>
          </div>

          {isReadOnly ? (
            <div className={`w-11 h-6 rounded-full ${notifyOnPropertyChange ? 'bg-indigo-600' : 'bg-slate-200'} opacity-50 cursor-not-allowed`} />
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notify_users_on_property_change"
                value="true"
                defaultChecked={notifyOnPropertyChange}
                disabled={isPending}
                onChange={handleChange}
                className="sr-only peer"
              />
              {/* ON のとき value=true を送信するための hidden input */}
              <input type="hidden" name="notify_users_on_property_change" value="false" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2
                peer-focus:ring-indigo-500 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:border-slate-300 after:border after:rounded-full
                after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600
                peer-disabled:opacity-50" />
            </label>
          )}
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>
        )}
      </div>
    </form>
  )
}
