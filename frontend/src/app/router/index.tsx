import { createBrowserRouter } from 'react-router'
import App from '@/App'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
])
