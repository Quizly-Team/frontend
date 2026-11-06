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
              className="text-1xl-bold max-md:text-2lg-bold text-gray-normal"
            >
              {tab.label}
            </span>
          ) : (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.to)}
              className="text-1xl-bold max-md:text-2lg-bold text-gray-disable"
            >
              {tab.label}
            </button>
          ),
        )}
      </div>
      <p className="text-2md-regular max-md:text-1rg-regular text-gray-alternative">
        {description}
      </p>
    </div>
  )
}

export default MyPageTabs
