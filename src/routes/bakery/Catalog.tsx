import { createFileRoute } from '@tanstack/react-router'
import Catalog from '../../pages/bakery/Catalog'
import { LOGIN_BAKERY, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/bakery/Catalog')({
  component: Catalog,
  beforeLoad: () => requireRole(['owner'], LOGIN_BAKERY),
})