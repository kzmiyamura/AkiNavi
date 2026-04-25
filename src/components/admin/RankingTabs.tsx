'use client'

import { useState } from 'react'
import { PropertyRankingChart } from './DashboardCharts'

type RankingData = { name: string; count: number }

const TABS = [
  { key: 'property', label: '物件別' },
  { key: 'user',     label: '個人別' },
  { key: 'company',  label: '会社別' },
] as const

type TabKey = typeof TABS[number]['key']

export function RankingTabs({
  propertyData,
  userData,
  companyData,
}: {
  propertyData: RankingData[]
  userData: RankingData[]
  companyData: RankingData[]
}) {
  const [active, setActive] = useState<TabKey>('property')

  const dataMap: Record<TabKey, RankingData[]> = {
    property: propertyData,
    user: userData,
    company: companyData,
  }

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              active === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <PropertyRankingChart data={dataMap[active]} />
    </div>
  )
}
