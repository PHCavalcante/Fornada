import { createFileRoute } from '@tanstack/react-router'
import Login from '../../pages/client/Login'
import { redirectIfAuthenticated } from '../../utils/routeGuards'

export const Route = createFileRoute('/client/Login')({
  component: Login,
  beforeLoad: () => redirectIfAuthenticated(),
})