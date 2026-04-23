import { getAdminProfile } from '@/utils/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminMobileNav } from '@/components/admin/AdminMobileNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // サーバーサイドで管理者チェック（middleware の二重防護）
  const profile = await getAdminProfile()

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* デスクトップ: 左サイドバー */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* モバイル: トップヘッダー */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <span className="text-lg font-bold text-indigo-400">AkiNavi</span>
          <span className="text-xs text-slate-400">管理画面</span>
        </header>

        {/* ページコンテンツ */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {/* 管理者名表示 */}
          <div className="mb-6 text-right text-sm text-slate-500">
            {profile.full_name ?? profile.email} でログイン中
          </div>
          {children}
        </main>
      </div>

      {/* モバイル: ボトムナビ */}
      <AdminMobileNav />
    </div>
  )
}
