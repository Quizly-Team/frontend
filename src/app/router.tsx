import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/app/pages/HomePage';
import AuthCallback from '@/app/pages/AuthCallback';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login/oauth2/code/:provider',
    element: <AuthCallback />,
  },
]);
