import { getCurrentProfile } from '@/utils/auth'
import { LogoutButton } from '@/components/user/LogoutButton'
import Link from 'next/link'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600 tracking-tight">AkiNavi</span>

          <div className="flex items-center gap-3">
            {profile.role === 'admin' && (
              <>
                <span className="text-xs font-semibold text-white bg-indigo-500 rounded-full px-2 py-0.5">
                  管理者
                </span>
                <Link
                  href="/admin"
                  className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200
                    rounded-lg px-3 py-1.5 transition-colors"
                >
                  管理画面
                </Link>
              </>
            )}
            <Link
              href="/profile"
              className="hidden sm:block text-sm text-slate-500 truncate max-w-[180px] hover:text-indigo-600 transition-colors"
            >
              {profile.company_name ?? profile.email}
            </Link>
            <Link
              href="/profile"
              className="sm:hidden text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="プロフィール"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
