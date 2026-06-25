"use client"

interface DashboardTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = [
  "Chat",
  "Summary",
]

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-[20px] border border-[#2A2A2A] bg-[#141414] p-3">
      {TABS.map((tab) => {
        const isActive = tab === activeTab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                ? "bg-white text-black"
                : "bg-transparent text-[#A0A0A0] hover:text-white"
              }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
