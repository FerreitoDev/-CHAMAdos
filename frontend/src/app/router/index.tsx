import { createBrowserRouter } from 'react-router'
import App from '@/App'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <App />,
          },
        ],
      },
    ],
  },
])
