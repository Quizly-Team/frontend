import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/app/pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
