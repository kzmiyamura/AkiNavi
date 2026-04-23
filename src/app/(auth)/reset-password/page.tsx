'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormField } from '@/components/ui/FormField'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function ResetPasswordPage() {
  const [state, action] = useActionState(resetPassword, undefined)

  // error: '' は送信成功を意味する
  const isSent = state !== undefined && state.error === ''

  if (isSent) {
    return (
      <AuthCard title="メールを送信しました">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-7 h-7 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            パスワードリセット用のリンクをメールに送信しました。
            <br />
            メールをご確認ください。
          </p>
          <Link href="/login" className="block text-sm text-indigo-600 hover:underline">
            ログインに戻る
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="パスワードリセット"
      description="登録済みのメールアドレスにリセット用リンクを送信します"
    >
      <form action={action} className="space-y-4">
        <FormField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />

        <ErrorMessage message={state?.error} />

        <SubmitButton label="リセットメールを送信" loadingLabel="送信中..." />
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-indigo-600 hover:underline">
          ログインに戻る
        </Link>
      </p>
    </AuthCard>
  )
}
