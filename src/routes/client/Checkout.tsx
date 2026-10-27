import { createFileRoute } from '@tanstack/react-router';
import Checkout from '../../pages/client/Checkout';
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Checkout')({
  component: Checkout,
  beforeLoad: () => requireRole(['customer', 'admin'], LOGIN_CLIENT),
})
