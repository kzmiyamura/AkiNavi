import { getAdminProfile } from '@/utils/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { NotificationSettingsForm } from '@/components/admin/NotificationSettingsForm'

async function getNotificationSettings() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('system_settings')
    .select('notify_users_on_property_change')
    .eq('id', 1)
    .single()
  return data?.notify_users_on_property_change ?? false
}

export default async function AdminSettingsPage() {
  const [profile, notifyOnPropertyChange] = await Promise.all([
    getAdminProfile(),
    getNotificationSettings(),
  ])
  const isReadOnly = profile.role === 'developer'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">設定</h1>
      <div className="space-y-6">
        <SettingsForm profile={profile} isReadOnly={isReadOnly} />
        <NotificationSettingsForm
          notifyOnPropertyChange={notifyOnPropertyChange}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  )
}
