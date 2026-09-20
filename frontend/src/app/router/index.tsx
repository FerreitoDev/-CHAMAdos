import { createBrowserRouter } from 'react-router'
import App from '@/App'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { TicketsListPage } from '@/features/tickets/pages/TicketsListPage'
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage'
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
          {
            path: '/tickets',
            element: <TicketsListPage />,
          },
          {
            path: '/tickets/:id',
            element: <TicketDetailPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            path: '/users',
            element: <UsersPage />,
          },
          {
            path: '/categories',
            element: <CategoriesPage />,
          },
        ],
      },
    ],
  },
])
