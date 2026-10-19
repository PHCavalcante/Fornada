import { createFileRoute } from '@tanstack/react-router'
import Login from '../../pages/bakery/Login'
import { redirectIfAuthenticated } from '../../utils/routeGuards'

export const Route = createFileRoute('/bakery/Login')({
  component: Login,
  beforeLoad: () => redirectIfAuthenticated(),
})