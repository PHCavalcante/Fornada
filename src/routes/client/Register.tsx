import { createFileRoute } from '@tanstack/react-router'
import Register from '../../pages/client/Register'
import { redirectIfAuthenticated } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Register')({
  component: Register,
  beforeLoad: () => redirectIfAuthenticated(),
})