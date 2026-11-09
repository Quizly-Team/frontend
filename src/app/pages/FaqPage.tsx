import { Header, FaqCategorySection, MyPageTabs } from '@/components'
import { useFaqs } from '@/hooks/useFaqs'

const CONTACT_EMAIL = 'duwn1010@gmail.com'

const FaqPage = () => {
  const { data, isLoading, isError } = useFaqs()
  const groups = data?.faqCategoryGroupList ?? []

  return (
    <div className="flex-1 w-full bg-background-alternative flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-15 max-lg:px-10 max-md:px-5 max-md:pt-5">
        <div className="w-full max-w-[976px] max-lg:max-w-[904px] max-md:max-w-full">
          {/* 상단 탭 */}
          <MyPageTabs
            active="faq"
            description="Quizly에 대해 궁금한 점을 빠르게 찾아보세요"
          />

          {/* 본문: 로딩 / 에러 / 빈 / 데이터주도 렌더 */}
          {isLoading ? (
            <div className="bg-background-elevated border border-line-normal rounded-lg p-8 max-md:p-5 flex justify-center py-20">
              <p className="text-gray-alternative">로딩 중...</p>
            </div>
          ) : isError ? (
            <div className="bg-background-elevated border border-line-normal rounded-lg p-8 max-md:p-5 flex justify-center py-20">
              <p className="text-status-negative-normal">
                데이터를 불러오는데 실패했습니다.
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-background-elevated border border-line-normal rounded-lg p-8 max-md:p-5 flex justify-center py-20">
              <p className="text-gray-alternative">등록된 FAQ가 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-md:gap-5">
              {groups.map((group) => (
                <FaqCategorySection
                  key={group.category}
                  category={group.category}
                  description={group.description}
                  items={group.faqDetailList}
                />
              ))}

              {/* 하단 CTA */}
              <div className="bg-primary-normal rounded-lg flex flex-col items-center py-10 gap-6 max-md:py-8 max-md:gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-2lg-bold max-md:text-2md-medium text-static-white">
                    원하는 답변을 찾지 못하셨나요?
                  </p>
                  <p className="text-1md-regular max-md:text-1rg-regular text-static-white">
                    이메일로 문의해 주시면 빠르게 답변드리겠습니다
                  </p>
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-1rg-medium bg-background-elevated rounded-sm px-4 py-3 text-primary-normal"
                >
                  이메일로 문의하기
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default FaqPage
