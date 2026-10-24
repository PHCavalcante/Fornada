import { createFileRoute, redirect } from '@tanstack/react-router'
import { LOGIN_CLIENT, requireRole } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Cart')({
  beforeLoad: async () => {
    await requireRole(['customer', 'admin'], LOGIN_CLIENT)
    throw redirect({ to: '/client/Orders' })
  },
})
