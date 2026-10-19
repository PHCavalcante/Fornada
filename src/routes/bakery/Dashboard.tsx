import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '../../pages/bakery/Dashboard'
import { LOGIN_BAKERY, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/bakery/Dashboard')({
  component: Dashboard,
  beforeLoad: () => requireRole(['owner'], LOGIN_BAKERY),
})