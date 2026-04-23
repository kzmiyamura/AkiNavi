import Link from 'next/link'
import { PropertyForm } from '@/components/admin/PropertyForm'

export default function NewPropertyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/properties" className="hover:text-slate-600 transition-colors">
          物件管理
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">新規登録</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">物件を登録</h1>

      <PropertyForm />
    </div>
  )
}
