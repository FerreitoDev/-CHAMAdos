import { createBrowserRouter } from 'react-router'
import App from '@/App'
import { AppLayout } from '@/app/layouts/AppLayout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
    ],
  },
])