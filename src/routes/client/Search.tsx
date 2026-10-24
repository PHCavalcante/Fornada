import { createFileRoute } from '@tanstack/react-router'
import Search from '../../pages/client/Search'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Search')({
  component: Search,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
