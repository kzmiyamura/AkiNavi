import { logout } from '@/app/actions/auth'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800">ログインが停止されています</h1>
        <p className="text-sm text-slate-500">
          現在このアカウントのログインは一時停止されています。<br />
          詳細は管理者にお問い合わせください。
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="mt-2 text-sm text-slate-400 hover:text-slate-600 underline"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  )
}
