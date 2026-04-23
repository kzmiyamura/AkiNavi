import { logout } from '@/app/actions/auth'

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* ロゴ */}
        <h1 className="text-3xl font-bold text-indigo-600 tracking-tight mb-8">AkiNavi</h1>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
          {/* アイコン */}
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-3">承認待ちです</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            現在、管理者がアカウントを確認中です。
            <br />
            承認まで <span className="font-medium text-slate-700">1〜2営業日</span> お待ちください。
            <br />
            承認完了後、メールにてお知らせします。
          </p>

          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
