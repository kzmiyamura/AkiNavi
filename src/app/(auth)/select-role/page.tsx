import Link from 'next/link'
import { getCurrentProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'

export default async function SelectRolePage() {
  const profile = await getCurrentProfile()

  if (profile.role !== 'developer') {
    redirect(profile.role === 'admin' ? '/admin' : '/properties')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-indigo-600">AkiNavi</span>
          <p className="mt-2 text-slate-500 text-sm">どちらの画面を使用しますか？</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/properties"
            className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200
              p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center
              group-hover:bg-green-100 transition-colors">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 text-sm">一般ユーザー画面</p>
              <p className="text-xs text-slate-400 mt-0.5">物件一覧を閲覧</p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200
              p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center
              group-hover:bg-indigo-100 transition-colors">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 text-sm">管理画面</p>
              <p className="text-xs text-slate-400 mt-0.5">物件・ユーザー管理</p>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {profile.full_name ?? profile.email} としてログイン中
        </p>
      </div>
    </div>
  )
}
