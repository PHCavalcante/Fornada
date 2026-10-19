import { createFileRoute } from '@tanstack/react-router'
import Profile from '../../pages/client/Profile'

export const Route = createFileRoute('/client/Profile')({
  component: Profile,
})
