import { createFileRoute } from '@tanstack/react-router'
import Management from '../../pages/bakery/Management'
import { LOGIN_BAKERY, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/bakery/Management')({
  component: Management,
  beforeLoad: () => requireRole(['owner'], LOGIN_BAKERY),
})