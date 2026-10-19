import { createFileRoute } from '@tanstack/react-router'
import Orders from '../../pages/client/Orders'

export const Route = createFileRoute('/client/Orders')({
  component: Orders,
})
