import { useNavigate } from 'react-router-dom'

export type MyPageTab = 'analytics' | 'faq' | 'account'

const TABS: { id: MyPageTab; label: string; to: string }[] = [
  { id: 'analytics', label: '학습분석', to: '/analytics' },
  { id: 'faq', label: 'FAQ', to: '/faq' },
  { id: 'account', label: '계정관리', to: '/analytics?tab=account' },
]

interface MyPageTabsProps {
  active: MyPageTab
  description: string
}

const MyPageTabs = ({ active, description }: MyPageTabsProps) => {
  const navigate = useNavigate()

  return (
    <div className="mb-[30px]">
      <div className="flex items-center gap-6 max-md:gap-4 mb-[6px] max-md:mb-2">
        {TABS.map((tab) =>
          tab.id === active ? (
            <span
              key={tab.id}
              aria-current="page"
              className="text-header1-bold max-md:text-header3-bold text-gray-900"
            >
              {tab.label}
            </span>
          ) : (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.to)}
              className="text-header1-bold max-md:text-header3-bold text-gray-300"
            >
              {tab.label}
            </button>
          ),
        )}
      </div>
      <p className="text-[20px] max-md:text-[16px] leading-[1.4] text-gray-600">
        {description}
      </p>
    </div>
  )
}

export default MyPageTabs
