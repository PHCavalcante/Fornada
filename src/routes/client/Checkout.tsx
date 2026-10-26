import { createFileRoute } from '@tanstack/react-router';
import Checkout from '../../pages/client/Checkout';

export const Route = createFileRoute('/client/Checkout')({
  component: Checkout,
})
