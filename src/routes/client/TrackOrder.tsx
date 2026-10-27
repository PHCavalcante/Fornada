import { createFileRoute } from '@tanstack/react-router'
import TrackOrder from '../../pages/client/TrackOrder'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/TrackOrder')({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
  }),
  component: TrackOrder,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
