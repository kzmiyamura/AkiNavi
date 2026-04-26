import { getAdminProfile } from '@/utils/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { NotificationSettingsForm } from '@/components/admin/NotificationSettingsForm'
import { ContactSettingsForm } from '@/components/admin/ContactSettingsForm'

async function getSystemSettings() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('system_settings')
    .select('notify_users_on_property_change, contact_email, contact_phone')
    .eq('id', 1)
    .single()
  return {
    notifyOnPropertyChange: data?.notify_users_on_property_change ?? false,
    contactEmail: (data as Record<string, unknown>)?.contact_email as string | null ?? null,
    contactPhone: (data as Record<string, unknown>)?.contact_phone as string | null ?? null,
  }
}

export default async function AdminSettingsPage() {
  const [profile, systemSettings] = await Promise.all([
    getAdminProfile(),
    getSystemSettings(),
  ])
  const isReadOnly = profile.role === 'developer'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">設定</h1>
      <div className="space-y-6">
        <SettingsForm profile={profile} isReadOnly={isReadOnly} />
        <ContactSettingsForm
          contactEmail={systemSettings.contactEmail}
          contactPhone={systemSettings.contactPhone}
          isReadOnly={isReadOnly}
        />
        <NotificationSettingsForm
          notifyOnPropertyChange={systemSettings.notifyOnPropertyChange}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  )
}
