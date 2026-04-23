'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormField } from '@/components/ui/FormField'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function SignUpPage() {
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signUp(undefined, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <AuthCard
      title="新規登録"
      description="登録後、管理者の承認をもってご利用いただけます"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="会社名"
          name="company_name"
          placeholder="株式会社〇〇不動産"
          autoComplete="organization"
        />
        <FormField
          label="氏名"
          name="full_name"
          placeholder="山田 太郎"
          autoComplete="name"
        />
        <FormField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="パスワード（8文字以上）"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <ErrorMessage message={error} />

        <SubmitButton label="登録する" loadingLabel="登録中..." isPending={isPending} />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          ログイン
        </Link>
      </p>
    </AuthCard>
  )
}
