import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/app/pages/HomePage';
import AuthCallback from '@/app/pages/AuthCallback';
import QuizListPage from '@/app/pages/QuizListPage';
import QuizDetailPage from '@/app/pages/QuizDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/quiz-list',
    element: <QuizListPage />,
  },
  {
    path: '/quiz-list/:date',
    element: <QuizDetailPage />,
  },
  {
    path: '/login/oauth2/code/:provider',
    element: <AuthCallback />,
  },
]);
