import { createFileRoute } from '@tanstack/react-router'
import Register from '../../pages/bakery/Register'
import { redirectIfAuthenticated } from '../../utils/routeGuards'

export const Route = createFileRoute('/bakery/Register')({
  component: Register,
  beforeLoad: () => redirectIfAuthenticated(),
})