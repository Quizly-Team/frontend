import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/app/pages/HomePage';
import AuthCallback from '@/app/pages/AuthCallback';
import LoginPage from '@/app/pages/LoginPage';
import QuizListPage from '@/app/pages/QuizListPage';
import QuizDetailPage from '@/app/pages/QuizDetailPage';
import WrongQuizPage from '@/app/pages/WrongQuizPage';
import WrongQuizSolvePage from '@/app/pages/WrongQuizSolvePage';
import MockExamPage from '@/app/pages/MockExamPage';

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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/login/oauth2/code/:provider',
    element: <AuthCallback />,
  },
]);
