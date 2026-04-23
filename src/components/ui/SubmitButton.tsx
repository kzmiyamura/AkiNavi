'use client'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
  isPending?: boolean
}

export function SubmitButton({ label, loadingLabel = '処理中...', isPending = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
        text-white text-sm font-semibold rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {isPending ? loadingLabel : label}
    </button>
  )
}
