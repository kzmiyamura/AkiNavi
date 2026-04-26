import { getCurrentProfile } from '@/utils/auth'
import { UserProfileForm } from '@/components/user/UserProfileForm'
import Link from 'next/link'

export default async function ProfilePage() {
  const profile = await getCurrentProfile()

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/properties"
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="戻る"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">プロフィール</h1>
      </div>

      <UserProfileForm profile={profile} />
    </div>
  )
}
