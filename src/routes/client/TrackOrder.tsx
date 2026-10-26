import { createFileRoute } from '@tanstack/react-router'
import TrackOrder from '../../pages/client/TrackOrder'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/TrackOrder')({
  component: TrackOrder,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
