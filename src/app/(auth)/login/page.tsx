'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormField } from '@/components/ui/FormField'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function LoginPage() {
  const [state, action] = useActionState(login, undefined)

  return (
    <AuthCard title="ログイン" description="メールアドレスとパスワードを入力してください">
      <form action={action} className="space-y-4">
        <FormField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="パスワード"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <ErrorMessage message={state?.error} />

        <SubmitButton label="ログイン" loadingLabel="ログイン中..." />
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link href="/reset-password" className="text-indigo-600 hover:underline">
            パスワードを忘れた方はこちら
          </Link>
        </p>
        <p className="text-slate-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
