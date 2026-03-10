import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, Button } from '@/components';
import { authUtils } from '@/lib/auth';
import { getUserInfo } from '@/api/account';
import {
  answerAdminInquiry,
  getAdminInquiries,
  runAggregateSummaryBatch,
  type AdminInquiryRaw,
} from '@/api/admin';
import {
  getFaqs,
  flattenFaqGroups,
  deleteAdminFaq,
  FAQ_CATEGORIES,
  type FaqCategory,
  type FlatFaqItem,
} from '@/api/faq';
import FaqCreateModal from '@/components/modal/FaqCreateModal';

type AdminSectionKey = 'qna' | 'faq' | 'batch';

type AdminSection = {
  key: AdminSectionKey;
  title: string;
  description: string;
};

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
];

type QnaStatus = '미답변' | '답변완료' | '보류';
type QnaItem = {
  id: number;
  title: string;
  writer: string;
  createdAt: string;
  status: QnaStatus;
  content: string;
  answer: string;
};

const DEFAULT_REPLY_TEMPLATE = `안녕하세요.
항상 퀴즐리 서비스를 이용해주셔서 감사합니다.

[문의 내용에 대한 답변을 작성해주세요]

또 다른 문의 사항이 있으면 언제든지 문의해주세요.`;

const toDisplayDate = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
};

const toQnaStatus = (rawStatus?: string, answer?: string): QnaStatus => {
  const normalized = (rawStatus || '').toUpperCase();
  if (
    normalized.includes('HOLD') ||
    normalized.includes('PENDING_REVIEW') ||
    normalized.includes('PENDING')
  ) {
    return '보류';
  }
  if (
    normalized.includes('ANSWER') ||
    normalized.includes('COMPLETE') ||
    normalized.includes('DONE') ||
    normalized.includes('REPLIED')
  ) {
    return '답변완료';
  }
  if (normalized.includes('WAIT') || normalized.includes('NEW')) {
    return '미답변';
  }
  if (answer && answer.trim() !== '') {
    return '답변완료';
  }
  return '미답변';
};

const toNumberId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const pickFirstText = (...candidates: Array<unknown>): string | null => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate.trim();
    }
  }
  return null;
};

const mapInquiryToQnaItem = (item: AdminInquiryRaw): QnaItem | null => {
  const id =
    toNumberId(item.id) ??
    toNumberId(item.inquiryId) ??
    toNumberId(item.inquiryID);

  if (id === null) {
    return null;
  }

  const answer = item.reply ?? item.answer ?? item.answerContent ?? '';
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
      item.memberName
    ) ?? '사용자';

  return {
    id,
    title: item.title ?? item.inquiryTitle ?? item.subject ?? `문의 #${id}`,
    writer,
    createdAt: toDisplayDate(item.createdAt ?? item.createdDate),
    status: toQnaStatus(item.status ?? item.inquiryStatus, answer),
    content: item.content ?? item.inquiryContent ?? item.question ?? '',
    answer,
  };
};

const getInitialReplyDraft = (inquiry: QnaItem | null): string => {
  if (!inquiry) {
    return '';
  }

  if (inquiry.answer.trim() !== '') {
    return inquiry.answer;
  }

  return DEFAULT_REPLY_TEMPLATE;
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSectionKey>('qna');
  const [qnaList, setQnaList] = useState<QnaItem[]>([]);
  const [isQnaLoading, setIsQnaLoading] = useState(false);
  const [qnaError, setQnaError] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false);
  const [faqList, setFaqList] = useState<FlatFaqItem[]>([]);
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<FaqCategory | 'all'>('all');
  const [showFaqCreateModal, setShowFaqCreateModal] = useState(false);
  const [isDeletingFaq, setIsDeletingFaq] = useState<number | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [batchTargetDate, setBatchTargetDate] = useState('');
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchFaqs = async () => {
    try {
      setIsFaqLoading(true);
      setFaqError(null);
      const response = await getFaqs();
      setFaqList(flattenFaqGroups(response));
    } catch (err) {
      setFaqError(err instanceof Error ? err.message : 'FAQ 조회에 실패했습니다.');
    } finally {
      setIsFaqLoading(false);
    }
  };

  const handleDeleteFaq = async (faqId: number) => {
    if (!confirm('해당 FAQ를 삭제하시겠습니까?')) return;
    try {
      setIsDeletingFaq(faqId);
      await deleteAdminFaq(faqId);
      await fetchFaqs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'FAQ 삭제에 실패했습니다.');
    } finally {
      setIsDeletingFaq(null);
    }
  };

  const fetchInquiries = async () => {
    try {
      setIsQnaLoading(true);
      setQnaError(null);
      const inquiries = await getAdminInquiries();
      const mapped = inquiries
        .map(mapInquiryToQnaItem)
        .filter((item): item is QnaItem => item !== null)
        .sort((a, b) => b.id - a.id);

      setQnaList(mapped);
      setSelectedInquiryId((prevId) => {
        if (prevId && mapped.some((item) => item.id === prevId)) {
          return prevId;
        }
        return mapped.length > 0 ? mapped[0].id : null;
      });
    } catch (err) {
      setQnaError(err instanceof Error ? err.message : '문의 목록 조회에 실패했습니다.');
    } finally {
      setIsQnaLoading(false);
    }
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!authUtils.isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const userInfo = await getUserInfo();
        const userRole = (userInfo as { role?: string }).role;
        if (userRole !== 'ADMIN') {
          alert('관리자 권한이 필요합니다.');
          navigate('/analytics', { replace: true });
          return;
        }

        await Promise.all([fetchInquiries(), fetchFaqs()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '관리자 정보를 확인할 수 없습니다.');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  const currentSection = ADMIN_SECTIONS.find(
    (section) => section.key === activeSection
  ) ?? ADMIN_SECTIONS[0];
  const displayedQnaList = showUnansweredOnly
    ? qnaList.filter((item) => item.status === '미답변')
    : qnaList;
  const selectedInquiry = displayedQnaList.find((item) => item.id === selectedInquiryId) ?? null;
  const unansweredCount = qnaList.filter((item) => item.status === '미답변').length;
  const answeredCount = qnaList.filter((item) => item.status === '답변완료').length;
  const displayedFaqList = faqCategoryFilter === 'all'
    ? faqList
    : faqList.filter((item) => item.category === faqCategoryFilter);
  const faqCategoryCounts = (Object.keys(FAQ_CATEGORIES) as FaqCategory[]).reduce(
    (acc, key) => {
      acc[key] = faqList.filter((item) => item.category === key).length;
      return acc;
    },
    {} as Record<FaqCategory, number>
  );

  const handleSelectInquiry = (item: QnaItem) => {
    setSelectedInquiryId(item.id);
    setAnswerDraft(getInitialReplyDraft(item));
  };

  useEffect(() => {
    if (activeSection !== 'qna') {
      return;
    }

    if (displayedQnaList.length === 0) {
      setSelectedInquiryId(null);
      return;
    }

    if (!selectedInquiryId || !displayedQnaList.some((item) => item.id === selectedInquiryId)) {
      setSelectedInquiryId(displayedQnaList[0].id);
    }
  }, [activeSection, displayedQnaList, selectedInquiryId]);

  useEffect(() => {
    setAnswerDraft(getInitialReplyDraft(selectedInquiry));
  }, [selectedInquiryId, selectedInquiry?.answer]);

  const handleSubmitAnswer = async () => {
    if (!selectedInquiryId) {
      alert('답변할 문의를 선택해주세요.');
      return;
    }
    if (!answerDraft.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      await answerAdminInquiry(selectedInquiryId, { reply: answerDraft.trim() });
      await fetchInquiries();
      alert('답변이 등록되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 등록에 실패했습니다.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleRunBatch = async () => {
    if (!batchTargetDate) {
      alert('집계 대상 날짜를 선택해주세요.');
      return;
    }
    if (!confirm(`${batchTargetDate} 날짜의 통계 배치를 실행하시겠습니까?`)) return;

    try {
      setIsBatchRunning(true);
      setBatchResult(null);
      await runAggregateSummaryBatch(batchTargetDate);
      setBatchResult({ type: 'success', message: `${batchTargetDate} 배치가 정상적으로 실행 요청되었습니다.` });
    } catch (err) {
      setBatchResult({ type: 'error', message: err instanceof Error ? err.message : '배치 실행에 실패했습니다.' });
    } finally {
      setIsBatchRunning(false);
    }
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().slice(0, 10);

  return (
    <div className="min-h-screen w-full bg-bg-home flex flex-col">
      <Header />
      <main className="flex-1 px-5 py-10 md:px-10 md:py-14">
        <div className="w-full max-w-[1160px] mx-auto">
          {isChecking ? (
            <div className="bg-white rounded-2xl border border-gray-300 p-10 text-center">
              <p className="text-gray-600">관리자 권한 확인 중...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-300 p-10 text-center">
              <p className="text-red-500 mb-6">{error}</p>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => navigate('/analytics')}
                className="w-[180px] h-[46px] rounded-md bg-[#f6fbf4] text-primary hover:bg-[#e8f5e0]"
              >
                계정관리로 돌아가기
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <section className="bg-white rounded-2xl border border-gray-300 p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900">
                      관리자 운영센터
                    </h1>
                    <p className="text-[15px] md:text-[16px] text-gray-600 mt-2">
                      사용자 문의 답변, FAQ 등록/수정 등 운영 업무를 처리하는 공간입니다.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => navigate('/analytics')}
                    className="w-[180px] h-[46px] rounded-md bg-[#f6fbf4] text-primary hover:bg-[#e8f5e0]"
                  >
                    계정관리로 돌아가기
                  </Button>
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
                <aside className="bg-white rounded-2xl border border-gray-300 p-4">
                  <h2 className="text-[18px] font-semibold text-gray-900 mb-3">관리 메뉴</h2>
                  <div className="flex flex-col gap-2">
                    {ADMIN_SECTIONS.map((section) => (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => setActiveSection(section.key)}
                        className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${
                          activeSection === section.key
                            ? 'bg-[#f0fdf4] text-primary font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{section.title}</span>
                          {section.key === 'qna' ? (
                            <span className="text-[12px] text-gray-500">{unansweredCount} 미답변</span>
                          ) : section.key === 'faq' ? (
                            <span className="text-[12px] text-gray-500">{faqList.length}개 등록</span>
                          ) : (
                            <span className="text-[12px] text-gray-500">배치 실행</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </aside>

                <div className="bg-white rounded-2xl border border-gray-300 p-6 md:p-7">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="text-[24px] font-bold text-gray-900">
                        {currentSection.title}
                      </h3>
                      <p className="text-[15px] text-gray-600 mt-2">
                        {currentSection.description}
                      </p>
                    </div>
                    {activeSection === 'qna' ? (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={handleSubmitAnswer}
                        disabled={isSubmittingAnswer}
                        className="w-[140px] h-[42px] rounded-md"
                      >
                        {isSubmittingAnswer ? '등록 중...' : '답변 등록'}
                      </Button>
                    ) : activeSection === 'faq' ? (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={() => setShowFaqCreateModal(true)}
                        className="w-[140px] h-[42px] rounded-md"
                      >
                        FAQ 등록
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={handleRunBatch}
                        disabled={isBatchRunning}
                        className="w-[140px] h-[42px] rounded-md"
                      >
                        {isBatchRunning ? '실행 중...' : '배치 실행'}
                      </Button>
                    )}
                  </div>

                  {activeSection !== 'batch' && (
                  <div className={`mt-6 grid grid-cols-2 gap-3 ${activeSection === 'qna' ? 'md:grid-cols-3' : 'md:grid-cols-5'}`}>
                    {activeSection === 'qna' ? (
                      <>
                        <div className="rounded-xl border border-gray-200 p-4">
                          <p className="text-[13px] text-gray-500">전체 문의</p>
                          <p className="text-[24px] font-bold text-gray-900 mt-1">{qnaList.length}건</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4">
                          <p className="text-[13px] text-gray-500">미답변</p>
                          <p className="text-[24px] font-bold text-red-500 mt-1">{unansweredCount}건</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4">
                          <p className="text-[13px] text-gray-500">답변완료</p>
                          <p className="text-[24px] font-bold text-primary mt-1">{answeredCount}건</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl border border-gray-200 p-4">
                          <p className="text-[13px] text-gray-500">전체 FAQ</p>
                          <p className="text-[24px] font-bold text-gray-900 mt-1">{faqList.length}개</p>
                        </div>
                        {(Object.entries(FAQ_CATEGORIES) as [FaqCategory, string][]).map(([key, label]) => (
                          <div key={key} className="rounded-xl border border-gray-200 p-4">
                            <p className="text-[13px] text-gray-500">{label}</p>
                            <p className="text-[24px] font-bold text-primary mt-1">{faqCategoryCounts[key]}개</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  )}

                  {activeSection === 'batch' ? (
                    <>
                      <div className="mt-6 rounded-xl border border-gray-200 p-4">
                        <p className="text-[15px] text-gray-700">
                          전날 유저 통계를 집계하는 배치가 실패한 경우, 특정 날짜를 지정하여 수동으로 배치를 실행할 수 있습니다.
                        </p>
                        <p className="text-[13px] text-gray-500 mt-2">
                          당일 포함 미래 날짜는 선택할 수 없습니다.
                        </p>
                      </div>

                      <div className="mt-4 rounded-xl border border-gray-200 p-4">
                        <p className="text-[16px] font-semibold text-gray-900 mb-3">집계 대상 날짜 선택</p>
                        <input
                          type="date"
                          value={batchTargetDate}
                          max={maxDate}
                          onChange={(e) => setBatchTargetDate(e.target.value)}
                          className="w-full max-w-[240px] rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-primary"
                        />
                      </div>

                      {batchResult && (
                        <div
                          className={`mt-4 rounded-xl border p-4 ${
                            batchResult.type === 'success'
                              ? 'border-green-200 bg-[#f0fdf4] text-green-800'
                              : 'border-red-200 bg-[#fef2f2] text-red-800'
                          }`}
                        >
                          <p className="text-[14px] font-medium">{batchResult.type === 'success' ? '실행 성공' : '실행 실패'}</p>
                          <p className="text-[13px] mt-1">{batchResult.message}</p>
                        </div>
                      )}
                    </>
                  ) : activeSection === 'qna' ? (
                    <>
                      <div className="mt-6 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUnansweredOnly(false)}
                          className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                            !showUnansweredOnly
                              ? 'bg-[#f0fdf4] border-primary text-primary'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          전체
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUnansweredOnly(true)}
                          className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                            showUnansweredOnly
                              ? 'bg-[#fef2f2] border-red-300 text-red-500'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          미답변만
                        </button>
                      </div>

                      <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-[80px_minmax(0,1fr)_160px_120px_120px] bg-gray-50 px-4 py-3 text-[13px] font-medium text-gray-600">
                          <span>문의번호</span>
                          <span>문의 제목</span>
                          <span>작성자</span>
                          <span>등록일</span>
                          <span>상태</span>
                        </div>
                        {isQnaLoading ? (
                          <div className="px-4 py-8 text-[14px] text-gray-500 text-center">
                            문의 목록을 불러오는 중입니다...
                          </div>
                        ) : qnaError ? (
                          <div className="px-4 py-8 text-[14px] text-red-500 text-center">
                            {qnaError}
                          </div>
                        ) : displayedQnaList.length === 0 ? (
                          <div className="px-4 py-8 text-[14px] text-gray-500 text-center">
                            {showUnansweredOnly
                              ? '미답변 문의가 없습니다.'
                              : '등록된 문의가 없습니다.'}
                          </div>
                        ) : (
                          displayedQnaList.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectInquiry(item)}
                              className={`w-full grid grid-cols-[80px_minmax(0,1fr)_160px_120px_120px] px-4 py-3 text-[14px] text-gray-800 border-t border-gray-100 text-left ${
                                selectedInquiryId === item.id ? 'bg-[#f9fcf8]' : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <span>{item.id}</span>
                              <span className="truncate pr-2">{item.title}</span>
                              <span>{item.writer}</span>
                              <span>{item.createdAt}</span>
                              <span
                                className={
                                  item.status === '미답변'
                                    ? 'text-red-500 font-medium'
                                    : item.status === '답변완료'
                                      ? 'text-primary font-medium'
                                      : 'text-gray-500'
                                }
                              >
                                {item.status}
                              </span>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="mt-4 rounded-xl border border-gray-200 p-4">
                        <p className="text-[16px] font-semibold text-gray-900 mb-3">답변 작성</p>
                        {selectedInquiry ? (
                          <>
                            <p className="text-[14px] text-gray-700 mb-2">
                              선택 문의: <span className="font-medium">{selectedInquiry.title}</span>
                            </p>
                            {selectedInquiry.content ? (
                              <p className="text-[13px] text-gray-500 mb-3">
                                문의 내용: {selectedInquiry.content}
                              </p>
                            ) : null}
                            <textarea
                              value={answerDraft}
                              onChange={(e) => setAnswerDraft(e.target.value)}
                              placeholder="문의에 대한 답변을 입력하세요."
                              className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-primary"
                            />
                          </>
                        ) : (
                          <p className="text-[14px] text-gray-500">
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
                          className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                            faqCategoryFilter === 'all'
                              ? 'bg-[#f0fdf4] border-primary text-primary'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          전체
                        </button>
                        {(Object.entries(FAQ_CATEGORIES) as [FaqCategory, string][]).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFaqCategoryFilter(key)}
                            className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                              faqCategoryFilter === key
                                ? 'bg-[#f0fdf4] border-primary text-primary'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-[60px_120px_minmax(0,1fr)_80px] bg-gray-50 px-4 py-3 text-[13px] font-medium text-gray-600">
                          <span>No</span>
                          <span>카테고리</span>
                          <span>질문</span>
                          <span>삭제</span>
                        </div>
                        {isFaqLoading ? (
                          <div className="px-4 py-8 text-[14px] text-gray-500 text-center">
                            FAQ 목록을 불러오는 중입니다...
                          </div>
                        ) : faqError ? (
                          <div className="px-4 py-8 text-[14px] text-red-500 text-center">
                            {faqError}
                          </div>
                        ) : displayedFaqList.length === 0 ? (
                          <div className="px-4 py-8 text-[14px] text-gray-500 text-center">
                            {faqCategoryFilter === 'all'
                              ? '등록된 FAQ가 없습니다.'
                              : `${FAQ_CATEGORIES[faqCategoryFilter]} 카테고리에 등록된 FAQ가 없습니다.`}
                          </div>
                        ) : (
                          displayedFaqList.map((item, index) => (
                            <div key={item.id} className="border-t border-gray-100">
                              <button
                                type="button"
                                onClick={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
                                className="w-full grid grid-cols-[60px_120px_minmax(0,1fr)_80px] px-4 py-3 text-[14px] text-gray-800 text-left hover:bg-gray-50"
                              >
                                <span>{index + 1}</span>
                                <span>{item.categoryDescription}</span>
                                <span className="truncate pr-2">{item.question}</span>
                                <span
                                  className="text-[13px] text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFaq(item.id);
                                  }}
                                >
                                  {isDeletingFaq === item.id ? '삭제중' : '삭제'}
                                </span>
                              </button>
                              {expandedFaqId === item.id && (
                                <div className="px-4 pb-4 pt-1">
                                  <div className="rounded-lg bg-gray-50 p-4 text-[14px] text-gray-700 whitespace-pre-wrap">
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
      <Footer />
    </div>
  );
};

export default AdminPage;
