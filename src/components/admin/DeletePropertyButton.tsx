'use client'

import { useTransition } from 'react'
import { deleteProperty } from '@/app/actions/properties'

export function DeletePropertyButton({
  propertyId,
  propertyName,
}: {
  propertyId: string
  propertyName: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm(`「${propertyName}」を削除しますか？\nこの操作は取り消せません。`)) return
    const formData = new FormData()
    formData.set('property_id', propertyId)
    startTransition(() => deleteProperty(formData))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200
        rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      )}
      {isPending ? '削除中...' : '物件を削除'}
    </button>
  )
}
