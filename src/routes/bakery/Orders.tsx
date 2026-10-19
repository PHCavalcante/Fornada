import { createFileRoute } from '@tanstack/react-router'
import Orders from '../../pages/bakery/Orders'
import { LOGIN_BAKERY, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/bakery/Orders')({
  component: Orders,
  beforeLoad: () => requireRole(['owner'], LOGIN_BAKERY),
})