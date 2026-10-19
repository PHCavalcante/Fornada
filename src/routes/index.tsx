import { createFileRoute } from '@tanstack/react-router'
import Home from '../pages/client/Home'
import { LOGIN_CLIENT, requireRole } from '../utils/routeGuards'

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
