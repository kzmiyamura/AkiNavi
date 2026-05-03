'use client'

import { useState, useTransition } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormField } from '@/components/ui/FormField'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function UpdatePasswordPage() {
  const [state, setState] = useState<{ error: string } | undefined>()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updatePassword(undefined, formData)
      setState(result)
    })
  }

  return (
    <AuthCard
      title="新しいパスワードを設定"
      description="新しいパスワードを入力してください"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="新しいパスワード"
          name="password"
          type="password"
          placeholder="8文字以上"
          autoComplete="new-password"
        />

        <ErrorMessage message={state?.error} />

        <SubmitButton label="パスワードを更新" loadingLabel="更新中..." isPending={isPending} />
      </form>
    </AuthCard>
  )
}
