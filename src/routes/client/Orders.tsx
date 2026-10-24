import { createFileRoute } from '@tanstack/react-router'
import Orders from '../../pages/client/Orders'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Orders')({
  component: Orders,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
