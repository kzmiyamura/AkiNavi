import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">AkiNavi</h1>
          <p className="text-slate-500 text-sm mt-1">不動産空室状況管理</p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mb-6">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
