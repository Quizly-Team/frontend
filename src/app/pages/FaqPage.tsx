import { Header, Footer, FaqCategorySection, MyPageTabs } from '@/components'
import { useFaqs } from '@/hooks/useFaqs'

const CONTACT_EMAIL = 'duwn1010@gmail.com'

const FaqPage = () => {
  const { data, isLoading, isError } = useFaqs()
  const groups = data?.faqCategoryGroupList ?? []

  return (
    <div className="flex-1 w-full bg-bg-home flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-20 pb-24 px-[60px] max-lg:px-10 max-md:px-5 max-md:pt-5">
        <div className="w-full max-w-[976px] max-lg:max-w-[904px] max-md:max-w-full">
          {/* 상단 탭 */}
          <MyPageTabs
            active="faq"
            description="Quizly에 대해 궁금한 점을 빠르게 찾아보세요"
          />

          {/* 본문: 로딩 / 에러 / 빈 / 데이터주도 렌더 */}
          {isLoading ? (
            <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] max-md:p-[20px] flex justify-center py-20">
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : isError ? (
            <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] max-md:p-[20px] flex justify-center py-20">
              <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white border border-[#dedede] rounded-[16px] p-[30px] max-md:p-[20px] flex justify-center py-20">
              <p className="text-gray-600">등록된 FAQ가 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-md:gap-[20px]">
              {groups.map((group) => (
                <FaqCategorySection
                  key={group.category}
                  category={group.category}
                  description={group.description}
                  items={group.faqDetailList}
                />
              ))}

              {/* 하단 CTA */}
              <div className="bg-primary rounded-[16px] flex flex-col items-center py-[40px] gap-[24px] max-md:py-[32px] max-md:gap-[16px]">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-header3-bold text-white max-md:text-body1-medium">
                    원하는 답변을 찾지 못하셨나요?
                  </p>
                  <p className="text-body2-regular text-white max-md:text-body3-regular">
                    이메일로 문의해 주시면 빠르게 답변드리겠습니다
                  </p>
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="bg-white rounded-[6px] px-[16px] py-[12px] text-primary text-body3-medium"
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
