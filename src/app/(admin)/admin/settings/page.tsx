import { getAdminProfile } from '@/utils/auth'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const profile = await getAdminProfile()
  const isReadOnly = profile.role === 'developer'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">設定</h1>
      <SettingsForm profile={profile} isReadOnly={isReadOnly} />
    </div>
  )
}
