import { createBrowserRouter, Outlet } from 'react-router-dom'
import AdminPage from '@/app/pages/AdminPage'
import AnalyticsPage from '@/app/pages/AnalyticsPage'
import AuthCallback from '@/app/pages/AuthCallback'
import FaqPage from '@/app/pages/FaqPage'
import HomePage from '@/app/pages/HomePage'
import LoginPage from '@/app/pages/LoginPage'
import MockExamPage from '@/app/pages/MockExamPage'
import OnboardingPage from '@/app/pages/OnboardingPage'
import QuizDetailPage from '@/app/pages/QuizDetailPage'
import QuizListPage from '@/app/pages/QuizListPage'
import WrongQuizPage from '@/app/pages/WrongQuizPage'
import WrongQuizSolvePage from '@/app/pages/WrongQuizSolvePage'
import { Footer } from '@/components'

export const router = createBrowserRouter([
  {
    // 전역 푸터 레이아웃. 자식 페이지 루트는 flex-1로 남은 높이를 채운다.
    element: (
      <div className="min-h-screen flex flex-col">
        <Outlet />
        <Footer />
      </div>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/my-quizzes',
        element: <QuizListPage />,
      },
      {
        path: '/my-quizzes/:date',
        element: <QuizDetailPage />,
      },
      {
        path: '/wrong-quizzes',
        element: <WrongQuizPage />,
      },
      {
        path: '/wrong-quizzes/solve',
        element: <WrongQuizSolvePage />,
      },
      {
        path: '/mock-exam',
        element: <MockExamPage />,
      },
      {
        path: '/faq',
        element: <FaqPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/analytics',
        element: <AnalyticsPage />,
      },
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
    ],
  },
  // 리디렉트 처리 중 잠깐 스쳐가는 화면이라 푸터 제외
  {
    path: '/login/oauth2/code/:provider',
    element: <AuthCallback />,
  },
])
