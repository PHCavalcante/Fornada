import { createFileRoute } from '@tanstack/react-router'
import Cart from '../../pages/client/Cart'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Cart')({
  component: Cart,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
