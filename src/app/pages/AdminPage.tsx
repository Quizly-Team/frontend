import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserInfo } from '@/api/account'
import {
  answerAdminInquiry,
  getAdminInquiries,
  runAggregateSummaryBatch,
  type AdminInquiryRaw,
} from '@/api/admin'
import {
  getFaqs,
  flattenFaqGroups,
  deleteAdminFaq,
  FAQ_CATEGORIES,
  type FaqCategory,
  type FlatFaqItem,
} from '@/api/faq'
import { Header, Button } from '@/components'
import FaqCreateModal from '@/components/modal/FaqCreateModal'
import { authUtils } from '@/lib/auth'

type AdminSectionKey = 'qna' | 'faq' | 'batch'

type AdminSection = {
  key: AdminSectionKey
  title: string
  description: string
}

const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: 'qna',
    title: 'QnA 관리',
    description: '사용자 문의를 확인하고 답변을 등록/수정합니다.',
  },
  {
    key: 'faq',
    title: 'FAQ 관리',
    description: 'FAQ를 조회하고 등록/수정하여 사용자 안내를 관리합니다.',
  },
  {
    key: 'batch',
    title: '배치 관리',
    description: '일별 유저 통계 배치를 수동으로 실행합니다.',
  },
]

type QnaStatus = '미답변' | '답변완료' | '보류'
type QnaItem = {
  id: number
  title: string
  writer: string
  createdAt: string
  status: QnaStatus
  content: string
  answer: string
}

type QnaStatusFilter = 'all' | 'WAITING' | 'COMPLETED'

const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | '...')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages]
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ]
}

const DEFAULT_REPLY_TEMPLATE = `안녕하세요.
항상 퀴즐리 서비스를 이용해주셔서 감사합니다.

[문의 내용에 대한 답변을 작성해주세요]

또 다른 문의 사항이 있으면 언제든지 문의해주세요.`

const toDisplayDate = (value?: string): string => {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10)
  }

  return parsed.toISOString().slice(0, 10)
}

const toQnaStatus = (rawStatus?: string, answer?: string): QnaStatus => {
  const normalized = (rawStatus || '').toUpperCase()
  if (
    normalized.includes('HOLD') ||
    normalized.includes('PENDING_REVIEW') ||
    normalized.includes('PENDING')
  ) {
    return '보류'
  }
  if (
    normalized.includes('ANSWER') ||
    normalized.includes('COMPLETE') ||
    normalized.includes('DONE') ||
    normalized.includes('REPLIED')
  ) {
    return '답변완료'
  }
  if (normalized.includes('WAIT') || normalized.includes('NEW')) {
    return '미답변'
  }
  if (answer && answer.trim() !== '') {
    return '답변완료'
  }
  return '미답변'
}

const toNumberId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

const pickFirstText = (...candidates: Array<unknown>): string | null => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate.trim()
    }
  }
  return null
}

const mapInquiryToQnaItem = (item: AdminInquiryRaw): QnaItem | null => {
  const id =
    toNumberId(item.id) ??
    toNumberId(item.inquiryId) ??
    toNumberId(item.inquiryID)

  if (id === null) {
    return null
  }

  const answer = item.reply ?? item.answer ?? item.answerContent ?? ''
  const writer =
    pickFirstText(
      item.writerName,
      item.user?.nickName,
      item.user?.nickname,
      item.userNickname,
      item.userNickName,
      item.nickName,
      item.nickname,
      item.user?.name,
      item.userName,
      item.username,
      item.name,
      item.writer,
      item.memberNickname,
      item.memberName,
    ) ?? '사용자'

  return {
    id,
    title: item.title ?? item.inquiryTitle ?? item.subject ?? `문의 #${id}`,
    writer,
    createdAt: toDisplayDate(item.createdAt ?? item.createdDate),
    status: toQnaStatus(item.status ?? item.inquiryStatus, answer),
    content: item.content ?? item.inquiryContent ?? item.question ?? '',
    answer,
  }
}

const getInitialReplyDraft = (inquiry: QnaItem | null): string => {
  if (!inquiry) {
    return ''
  }

  if (inquiry.answer.trim() !== '') {
    return inquiry.answer
  }

  return DEFAULT_REPLY_TEMPLATE
}

const AdminPage = () => {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<AdminSectionKey>('qna')
  const [qnaList, setQnaList] = useState<QnaItem[]>([])
  const [isQnaLoading, setIsQnaLoading] = useState(false)
  const [qnaError, setQnaError] = useState<string | null>(null)
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null,
  )
  const [answerDraft, setAnswerDraft] = useState('')
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const [qnaStatusFilter, setQnaStatusFilter] = useState<QnaStatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [faqList, setFaqList] = useState<FlatFaqItem[]>([])
  const [isFaqLoading, setIsFaqLoading] = useState(false)
  const [faqError, setFaqError] = useState<string | null>(null)
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<
    FaqCategory | 'all'
  >('all')
  const [showFaqCreateModal, setShowFaqCreateModal] = useState(false)
  const [isDeletingFaq, setIsDeletingFaq] = useState<number | null>(null)
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null)
  const [batchTargetDate, setBatchTargetDate] = useState('')
  const [isBatchRunning, setIsBatchRunning] = useState(false)
  const [batchResult, setBatchResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const fetchFaqs = async () => {
    try {
      setIsFaqLoading(true)
      setFaqError(null)
      const response = await getFaqs()
      setFaqList(flattenFaqGroups(response))
    } catch (err) {
      setFaqError(
        err instanceof Error ? err.message : 'FAQ 조회에 실패했습니다.',
      )
    } finally {
      setIsFaqLoading(false)
    }
  }

  const handleDeleteFaq = async (faqId: number) => {
    if (!confirm('해당 FAQ를 삭제하시겠습니까?')) return
    try {
      setIsDeletingFaq(faqId)
      await deleteAdminFaq(faqId)
      await fetchFaqs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'FAQ 삭제에 실패했습니다.')
    } finally {
      setIsDeletingFaq(null)
    }
  }

  const fetchInquiries = async (
    page = currentPage,
    status = qnaStatusFilter,
  ) => {
    try {
      setIsQnaLoading(true)
      setQnaError(null)
      const { inquiryList, pagination } = await getAdminInquiries({
        page,
        status: status === 'all' ? undefined : status,
      })
      const mapped = inquiryList
        .map(mapInquiryToQnaItem)
        .filter((item): item is QnaItem => item !== null)

      setQnaList(mapped)
      setTotalPages(pagination.totalPages)
      setTotalElements(pagination.totalElements)
      setCurrentPage(pagination.page)
      setSelectedInquiryId((prevId) => {
        if (prevId && mapped.some((item) => item.id === prevId)) {
          return prevId
        }
        return mapped.length > 0 ? mapped[0].id : null
      })
    } catch (err) {
      setQnaError(
        err instanceof Error ? err.message : '문의 목록 조회에 실패했습니다.',
      )
    } finally {
      setIsQnaLoading(false)
    }
  }

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!authUtils.isAuthenticated()) {
        navigate('/login', { replace: true })
        return
      }

      try {
        const userInfo = await getUserInfo()
        const userRole = (userInfo as { role?: string }).role
        if (userRole !== 'ADMIN') {
          alert('관리자 권한이 필요합니다.')
          navigate('/analytics', { replace: true })
          return
        }

        await Promise.all([fetchInquiries(), fetchFaqs()])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '관리자 정보를 확인할 수 없습니다.',
        )
      } finally {
        setIsChecking(false)
      }
    }

    verifyAdmin()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만 관리자 검증 및 초기 데이터 로드를 실행하려는 의도. fetchInquiries를 deps에 넣으면 렌더마다 재발화되어 동작이 달라짐
  }, [navigate])

  const currentSection =
    ADMIN_SECTIONS.find((section) => section.key === activeSection) ??
    ADMIN_SECTIONS[0]
  const selectedInquiry =
    qnaList.find((item) => item.id === selectedInquiryId) ?? null
  const unansweredCount = qnaList.filter(
    (item) => item.status === '미답변',
  ).length
  const answeredCount = qnaList.filter(
    (item) => item.status === '답변완료',
  ).length
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  )
  const displayedFaqList =
    faqCategoryFilter === 'all'
      ? faqList
      : faqList.filter((item) => item.category === faqCategoryFilter)
  const faqCategoryCounts = (
    Object.keys(FAQ_CATEGORIES) as FaqCategory[]
  ).reduce(
    (acc, key) => {
      acc[key] = faqList.filter((item) => item.category === key).length
      return acc
    },
    {} as Record<FaqCategory, number>,
  )

  const handleSelectInquiry = (item: QnaItem) => {
    setSelectedInquiryId(item.id)
    setAnswerDraft(getInitialReplyDraft(item))
  }

  useEffect(() => {
    if (activeSection !== 'qna') {
      return
    }

    if (qnaList.length === 0) {
      setSelectedInquiryId(null)
      return
    }

    if (
      !selectedInquiryId ||
      !qnaList.some((item) => item.id === selectedInquiryId)
    ) {
      setSelectedInquiryId(qnaList[0].id)
    }
  }, [activeSection, qnaList, selectedInquiryId])

  useEffect(() => {
    setAnswerDraft(getInitialReplyDraft(selectedInquiry))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 선택 문의 id 또는 answer가 바뀔 때만 초안을 재설정하려는 의도. selectedInquiry 객체 전체를 deps에 넣으면 참조 변동으로 발화 시점이 달라져 동작이 바뀜
  }, [selectedInquiryId, selectedInquiry?.answer])

  const handleSubmitAnswer = async () => {
    if (!selectedInquiryId) {
      alert('답변할 문의를 선택해주세요.')
      return
    }
    if (!answerDraft.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    try {
      setIsSubmittingAnswer(true)
      await answerAdminInquiry(selectedInquiryId, { reply: answerDraft.trim() })
      await fetchInquiries()
      alert('답변이 등록되었습니다.')
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 등록에 실패했습니다.')
    } finally {
      setIsSubmittingAnswer(false)
    }
  }

  const handleRunBatch = async () => {
    if (!batchTargetDate) {
      alert('집계 대상 날짜를 선택해주세요.')
      return
    }
    if (!confirm(`${batchTargetDate} 날짜의 통계 배치를 실행하시겠습니까?`))
      return

    try {
      setIsBatchRunning(true)
      setBatchResult(null)
      await runAggregateSummaryBatch(batchTargetDate)
      setBatchResult({
        type: 'success',
        message: `${batchTargetDate} 배치가 정상적으로 실행 요청되었습니다.`,
      })
    } catch (err) {
      setBatchResult({
        type: 'error',
        message:
          err instanceof Error ? err.message : '배치 실행에 실패했습니다.',
      })
    } finally {
      setIsBatchRunning(false)
    }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const maxDate = yesterday.toISOString().slice(0, 10)

  return (
    <div className="flex-1 w-full bg-background-alternative flex flex-col">
      <Header />
      <main className="flex-1 px-5 py-10 md:px-10 md:py-14">
        <div className="w-full max-w-[1160px] mx-auto">
          {isChecking ? (
            <div className="bg-background-elevated rounded-lg border border-line-normal p-10 text-center">
              <p className="text-gray-alternative">관리자 권한 확인 중...</p>
            </div>
          ) : error ? (
            <div className="bg-background-elevated rounded-lg border border-line-normal p-10 text-center">
              <p className="text-status-negative-normal mb-6">{error}</p>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => navigate('/analytics')}
                className="w-[180px] h-[46px] rounded-sm bg-primary-subtle text-primary-normal hover:bg-interaction-primary-pressed"
              >
                계정관리로 돌아가기
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <section className="bg-background-elevated rounded-lg border border-line-normal p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3lg-bold md:text-1xl-bold text-gray-normal">
                      관리자 운영센터
                    </h1>
                    <p className="text-3sm-regular md:text-1rg-regular text-gray-alternative mt-2">
                      사용자 문의 답변, FAQ 등록/수정 등 운영 업무를 처리하는
                      공간입니다.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => navigate('/analytics')}
                    className="w-[180px] h-[46px] rounded-sm bg-primary-subtle text-primary-normal hover:bg-interaction-primary-pressed"
                  >
                    계정관리로 돌아가기
                  </Button>
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
                <aside className="bg-background-elevated rounded-lg border border-line-normal p-4">
                  <h2 className="text-1md-semibold text-gray-normal mb-3">
                    관리 메뉴
                  </h2>
                  <div className="flex flex-col gap-2">
                    {ADMIN_SECTIONS.map((section) => (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => setActiveSection(section.key)}
                        className={`w-full text-left rounded-md px-4 py-3 transition-colors ${
                          activeSection === section.key
                            ? 'bg-primary-subtle text-primary-normal font-medium'
                            : 'text-gray-neutral hover:bg-background-alternative'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{section.title}</span>
                          {section.key === 'qna' ? (
                            <span className="text-2xs-regular text-gray-assistive">
                              {unansweredCount} 미답변
                            </span>
                          ) : section.key === 'faq' ? (
                            <span className="text-2xs-regular text-gray-assistive">
                              {faqList.length}개 등록
                            </span>
                          ) : (
                            <span className="text-2xs-regular text-gray-assistive">
                              배치 실행
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </aside>

                <div className="bg-background-elevated rounded-lg border border-line-normal p-6 md:p-7">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="text-2lg-bold text-gray-normal">
                        {currentSection.title}
                      </h3>
                      <p className="text-3sm-regular text-gray-alternative mt-2">
                        {currentSection.description}
                      </p>
                    </div>
                    {activeSection === 'qna' ? (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={handleSubmitAnswer}
                        disabled={isSubmittingAnswer}
                        className="w-[140px] h-[42px] rounded-sm"
                      >
                        {isSubmittingAnswer ? '등록 중...' : '답변 등록'}
                      </Button>
                    ) : activeSection === 'faq' ? (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={() => setShowFaqCreateModal(true)}
                        className="w-[140px] h-[42px] rounded-sm"
                      >
                        FAQ 등록
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={handleRunBatch}
                        disabled={isBatchRunning}
                        className="w-[140px] h-[42px] rounded-sm"
                      >
                        {isBatchRunning ? '실행 중...' : '배치 실행'}
                      </Button>
                    )}
                  </div>

                  {activeSection !== 'batch' && (
                    <div
                      className={`mt-6 grid grid-cols-2 gap-3 ${activeSection === 'qna' ? 'md:grid-cols-3' : 'md:grid-cols-5'}`}
                    >
                      {activeSection === 'qna' ? (
                        <>
                          <div className="rounded-md border border-line-normal p-4">
                            <p className="text-1sm-regular text-gray-assistive">
                              전체 문의
                            </p>
                            <p className="text-2lg-bold text-gray-normal mt-1">
                              {totalElements}건
                            </p>
                          </div>
                          <div className="rounded-md border border-line-normal p-4">
                            <p className="text-1sm-regular text-gray-assistive">
                              미답변
                            </p>
                            <p className="text-2lg-bold text-status-negative-normal mt-1">
                              {unansweredCount}건
                            </p>
                          </div>
                          <div className="rounded-md border border-line-normal p-4">
                            <p className="text-1sm-regular text-gray-assistive">
                              답변완료
                            </p>
                            <p className="text-2lg-bold text-primary-normal mt-1">
                              {answeredCount}건
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-md border border-line-normal p-4">
                            <p className="text-1sm-regular text-gray-assistive">
                              전체 FAQ
                            </p>
                            <p className="text-2lg-bold text-gray-normal mt-1">
                              {faqList.length}개
                            </p>
                          </div>
                          {(
                            Object.entries(FAQ_CATEGORIES) as [
                              FaqCategory,
                              string,
                            ][]
                          ).map(([key, label]) => (
                            <div
                              key={key}
                              className="rounded-md border border-line-normal p-4"
                            >
                              <p className="text-1sm-regular text-gray-assistive">
                                {label}
                              </p>
                              <p className="text-2lg-bold text-primary-normal mt-1">
                                {faqCategoryCounts[key]}개
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {activeSection === 'batch' ? (
                    <>
                      <div className="mt-6 rounded-md border border-line-normal p-4">
                        <p className="text-3sm-regular text-gray-neutral">
                          전날 유저 통계를 집계하는 배치가 실패한 경우, 특정
                          날짜를 지정하여 수동으로 배치를 실행할 수 있습니다.
                        </p>
                        <p className="text-1sm-regular text-gray-assistive mt-2">
                          당일 포함 미래 날짜는 선택할 수 없습니다.
                        </p>
                      </div>

                      <div className="mt-4 rounded-md border border-line-normal p-4">
                        <p className="text-1rg-semibold text-gray-normal mb-3">
                          집계 대상 날짜 선택
                        </p>
                        <input
                          type="date"
                          value={batchTargetDate}
                          max={maxDate}
                          onChange={(e) => setBatchTargetDate(e.target.value)}
                          className="text-2sm-regular w-full max-w-[240px] rounded-sm border border-line-normal px-3 py-2 text-gray-normal outline-none focus:border-primary-normal"
                        />
                      </div>

                      {batchResult && (
                        <div
                          className={`mt-4 rounded-md border p-4 ${
                            batchResult.type === 'success'
                              ? 'border-primary-subtle bg-primary-subtle text-primary-heavy'
                              : 'border-status-negative-subtle bg-status-negative-subtle text-status-negative-heavy'
                          }`}
                        >
                          <p className="text-2sm-medium">
                            {batchResult.type === 'success'
                              ? '실행 성공'
                              : '실행 실패'}
                          </p>
                          <p className="text-1sm-regular mt-1">
                            {batchResult.message}
                          </p>
                        </div>
                      )}
                    </>
                  ) : activeSection === 'qna' ? (
                    <>
                      <div className="mt-6 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQnaStatusFilter('all')
                            setCurrentPage(1)
                            fetchInquiries(1, 'all')
                          }}
                          className={`text-1sm-regular px-3 py-2 rounded-full border transition-colors ${
                            qnaStatusFilter === 'all'
                              ? 'bg-primary-subtle border-primary-normal text-primary-normal'
                              : 'bg-background-elevated border-line-normal text-gray-alternative hover:bg-background-alternative'
                          }`}
                        >
                          전체
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQnaStatusFilter('WAITING')
                            setCurrentPage(1)
                            fetchInquiries(1, 'WAITING')
                          }}
                          className={`text-1sm-regular px-3 py-2 rounded-full border transition-colors ${
                            qnaStatusFilter === 'WAITING'
                              ? 'bg-status-negative-subtle border-status-negative-subtle text-status-negative-normal'
                              : 'bg-background-elevated border-line-normal text-gray-alternative hover:bg-background-alternative'
                          }`}
                        >
                          미답변
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQnaStatusFilter('COMPLETED')
                            setCurrentPage(1)
                            fetchInquiries(1, 'COMPLETED')
                          }}
                          className={`text-1sm-regular px-3 py-2 rounded-full border transition-colors ${
                            qnaStatusFilter === 'COMPLETED'
                              ? 'bg-primary-subtle border-primary-normal text-primary-normal'
                              : 'bg-background-elevated border-line-normal text-gray-alternative hover:bg-background-alternative'
                          }`}
                        >
                          답변완료
                        </button>
                      </div>

                      <div className="mt-6 rounded-md border border-line-normal overflow-hidden">
                        <div className="text-1sm-medium grid grid-cols-[80px_minmax(0,1fr)_160px_120px_120px] bg-background-alternative px-4 py-3 text-gray-alternative">
                          <span>문의번호</span>
                          <span>문의 제목</span>
                          <span>작성자</span>
                          <span>등록일</span>
                          <span>상태</span>
                        </div>
                        {isQnaLoading ? (
                          <div className="text-2sm-regular px-4 py-8 text-gray-assistive text-center">
                            문의 목록을 불러오는 중입니다...
                          </div>
                        ) : qnaError ? (
                          <div className="text-2sm-regular px-4 py-8 text-status-negative-normal text-center">
                            {qnaError}
                          </div>
                        ) : qnaList.length === 0 ? (
                          <div className="text-2sm-regular px-4 py-8 text-gray-assistive text-center">
                            {qnaStatusFilter === 'WAITING'
                              ? '미답변 문의가 없습니다.'
                              : qnaStatusFilter === 'COMPLETED'
                                ? '답변완료 문의가 없습니다.'
                                : '등록된 문의가 없습니다.'}
                          </div>
                        ) : (
                          qnaList.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectInquiry(item)}
                              className={`text-2sm-regular w-full grid grid-cols-[80px_minmax(0,1fr)_160px_120px_120px] px-4 py-3 text-gray-neutral border-t border-line-normal text-left ${
                                selectedInquiryId === item.id
                                  ? 'bg-primary-subtle'
                                  : 'bg-background-elevated hover:bg-background-alternative'
                              }`}
                            >
                              <span>{item.id}</span>
                              <span className="truncate pr-2">
                                {item.title}
                              </span>
                              <span>{item.writer}</span>
                              <span>{item.createdAt}</span>
                              <span
                                className={
                                  item.status === '미답변'
                                    ? 'text-status-negative-normal font-medium'
                                    : item.status === '답변완료'
                                      ? 'text-primary-normal font-medium'
                                      : 'text-gray-assistive'
                                }
                              >
                                {item.status}
                              </span>
                            </button>
                          ))
                        )}
                      </div>

                      {totalPages > 1 && !isQnaLoading && !qnaError && (
                        <div className="flex items-center justify-center gap-1 mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              const prevPage = Math.max(1, currentPage - 1)
                              setCurrentPage(prevPage)
                              fetchInquiries(prevPage)
                            }}
                            disabled={currentPage === 1}
                            className="flex h-9 w-9 items-center justify-center rounded-sm text-gray-assistive hover:text-primary-normal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="이전 페이지"
                          >
                            <svg
                              width="7"
                              height="12"
                              viewBox="0 0 7 12"
                              fill="none"
                            >
                              <path
                                d="M6 1L1 6L6 11"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {pageNumbers.map((page, idx) =>
                            page === '...' ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className="text-2sm-regular flex h-9 w-9 items-center justify-center text-gray-disable"
                              >
                                ···
                              </span>
                            ) : (
                              <button
                                key={page}
                                type="button"
                                onClick={() => {
                                  setCurrentPage(page)
                                  fetchInquiries(page)
                                }}
                                className={`text-2sm-regular flex h-9 w-9 items-center justify-center rounded-sm transition-colors ${
                                  page === currentPage
                                    ? 'bg-primary-normal text-static-white'
                                    : 'text-gray-neutral hover:text-primary-normal'
                                }`}
                              >
                                {page}
                              </button>
                            ),
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const nextPage = Math.min(
                                totalPages,
                                currentPage + 1,
                              )
                              setCurrentPage(nextPage)
                              fetchInquiries(nextPage)
                            }}
                            disabled={currentPage === totalPages}
                            className="flex h-9 w-9 items-center justify-center rounded-sm text-gray-assistive hover:text-primary-normal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="다음 페이지"
                          >
                            <svg
                              width="7"
                              height="12"
                              viewBox="0 0 7 12"
                              fill="none"
                            >
                              <path
                                d="M1 1L6 6L1 11"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="mt-4 rounded-md border border-line-normal p-4">
                        <p className="text-1rg-semibold text-gray-normal mb-3">
                          답변 작성
                        </p>
                        {selectedInquiry ? (
                          <>
                            <p className="text-2sm-regular text-gray-neutral mb-2">
                              선택 문의:{' '}
                              <span className="font-medium">
                                {selectedInquiry.title}
                              </span>
                            </p>
                            {selectedInquiry.content ? (
                              <p className="text-1sm-regular text-gray-assistive mb-3">
                                문의 내용: {selectedInquiry.content}
                              </p>
                            ) : null}
                            <textarea
                              value={answerDraft}
                              onChange={(e) => setAnswerDraft(e.target.value)}
                              placeholder="문의에 대한 답변을 입력하세요."
                              className="text-2sm-regular w-full min-h-[120px] rounded-sm border border-line-normal px-3 py-2 text-gray-normal outline-none focus:border-primary-normal"
                            />
                          </>
                        ) : (
                          <p className="text-2sm-regular text-gray-assistive">
                            답변할 문의를 먼저 선택해주세요.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-6 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFaqCategoryFilter('all')}
                          className={`text-1sm-regular px-3 py-2 rounded-full border transition-colors ${
                            faqCategoryFilter === 'all'
                              ? 'bg-primary-subtle border-primary-normal text-primary-normal'
                              : 'bg-background-elevated border-line-normal text-gray-alternative hover:bg-background-alternative'
                          }`}
                        >
                          전체
                        </button>
                        {(
                          Object.entries(FAQ_CATEGORIES) as [
                            FaqCategory,
                            string,
                          ][]
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFaqCategoryFilter(key)}
                            className={`text-1sm-regular px-3 py-2 rounded-full border transition-colors ${
                              faqCategoryFilter === key
                                ? 'bg-primary-subtle border-primary-normal text-primary-normal'
                                : 'bg-background-elevated border-line-normal text-gray-alternative hover:bg-background-alternative'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 rounded-md border border-line-normal overflow-hidden">
                        <div className="text-1sm-medium grid grid-cols-[60px_120px_minmax(0,1fr)_80px] bg-background-alternative px-4 py-3 text-gray-alternative">
                          <span>No</span>
                          <span>카테고리</span>
                          <span>질문</span>
                          <span>삭제</span>
                        </div>
                        {isFaqLoading ? (
                          <div className="text-2sm-regular px-4 py-8 text-gray-assistive text-center">
                            FAQ 목록을 불러오는 중입니다...
                          </div>
                        ) : faqError ? (
                          <div className="text-2sm-regular px-4 py-8 text-status-negative-normal text-center">
                            {faqError}
                          </div>
                        ) : displayedFaqList.length === 0 ? (
                          <div className="text-2sm-regular px-4 py-8 text-gray-assistive text-center">
                            {faqCategoryFilter === 'all'
                              ? '등록된 FAQ가 없습니다.'
                              : `${FAQ_CATEGORIES[faqCategoryFilter]} 카테고리에 등록된 FAQ가 없습니다.`}
                          </div>
                        ) : (
                          displayedFaqList.map((item, index) => (
                            <div
                              key={item.id}
                              className="border-t border-line-normal"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedFaqId(
                                    expandedFaqId === item.id ? null : item.id,
                                  )
                                }
                                className="text-2sm-regular w-full grid grid-cols-[60px_120px_minmax(0,1fr)_80px] px-4 py-3 text-gray-neutral text-left hover:bg-background-alternative"
                              >
                                <span>{index + 1}</span>
                                <span>{item.categoryDescription}</span>
                                <span className="truncate pr-2">
                                  {item.question}
                                </span>
                                <span
                                  className="text-1sm-medium text-status-negative-normal hover:text-status-negative-strong disabled:opacity-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteFaq(item.id)
                                  }}
                                >
                                  {isDeletingFaq === item.id
                                    ? '삭제중'
                                    : '삭제'}
                                </span>
                              </button>
                              {expandedFaqId === item.id && (
                                <div className="px-4 pb-4 pt-1">
                                  <div className="text-2sm-regular rounded-sm bg-background-alternative p-4 text-gray-neutral whitespace-pre-wrap">
                                    {item.answer}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      <FaqCreateModal
        isOpen={showFaqCreateModal}
        onClose={() => setShowFaqCreateModal(false)}
        onSuccess={fetchFaqs}
      />
    </div>
  )
}

export default AdminPage
