import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, Button } from '@/components';
import { authUtils } from '@/lib/auth';
import { getUserInfo } from '@/api/account';
import {
  answerAdminInquiry,
  getAdminInquiries,
  type AdminInquiryRaw,
} from '@/api/admin';

type AdminSectionKey = 'qna' | 'faq';

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

type FaqItem = {
  id: number;
  category: string;
  question: string;
  updatedAt: string;
  isVisible: boolean;
};

const DEFAULT_REPLY_TEMPLATE = `안녕하세요.
항상 퀴즐리 서비스를 이용해주셔서 감사합니다.

[문의 내용에 대한 답변을 작성해주세요]

또 다른 문의 사항이 있으면 언제든지 문의해주세요.`;

const FAQ_MOCK_DATA: FaqItem[] = [
  { id: 91, category: '계정', question: '닉네임은 어디서 변경하나요?', updatedAt: '2026-03-04', isVisible: true },
  { id: 90, category: '결제', question: '환불은 어떻게 신청하나요?', updatedAt: '2026-03-03', isVisible: true },
  { id: 89, category: '학습', question: '오답노트는 자동으로 저장되나요?', updatedAt: '2026-03-02', isVisible: false },
];

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

        await fetchInquiries();
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
  const visibleFaqCount = FAQ_MOCK_DATA.filter((item) => item.isVisible).length;

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
                          ) : (
                            <span className="text-[12px] text-gray-500">{visibleFaqCount} 노출중</span>
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
                    ) : (
                      <Button
                        variant="primary"
                        size="medium"
                        className="w-[140px] h-[42px] rounded-md"
                      >
                        FAQ 등록
                      </Button>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
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
                          <p className="text-[24px] font-bold text-gray-900 mt-1">{FAQ_MOCK_DATA.length}개</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4">
                          <p className="text-[13px] text-gray-500">노출중</p>
                          <p className="text-[24px] font-bold text-primary mt-1">{visibleFaqCount}개</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4">
                          <p className="text-[13px] text-gray-500">비노출</p>
                          <p className="text-[24px] font-bold text-gray-600 mt-1">
                            {FAQ_MOCK_DATA.length - visibleFaqCount}개
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {activeSection === 'qna' ? (
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
                    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-[80px_140px_minmax(0,1fr)_120px_100px] bg-gray-50 px-4 py-3 text-[13px] font-medium text-gray-600">
                        <span>No</span>
                        <span>카테고리</span>
                        <span>질문</span>
                        <span>수정일</span>
                        <span>노출</span>
                      </div>
                      {FAQ_MOCK_DATA.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[80px_140px_minmax(0,1fr)_120px_100px] px-4 py-3 text-[14px] text-gray-800 border-t border-gray-100"
                        >
                          <span>{item.id}</span>
                          <span>{item.category}</span>
                          <span className="truncate pr-2">{item.question}</span>
                          <span>{item.updatedAt}</span>
                          <span className={item.isVisible ? 'text-primary font-medium' : 'text-gray-500'}>
                            {item.isVisible ? '노출' : '숨김'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
