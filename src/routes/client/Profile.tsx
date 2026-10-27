import { createFileRoute } from '@tanstack/react-router'
import Profile from '../../pages/client/Profile'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Profile')({
  component: Profile,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
