import { createBrowserRouter } from 'react-router-dom'
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

export const router = createBrowserRouter([
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
    path: '/login/oauth2/code/:provider',
    element: <AuthCallback />,
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
])
