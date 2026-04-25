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
            <span className="hidden sm:block text-sm text-slate-500 truncate max-w-[180px]">
              {profile.company_name ?? profile.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
