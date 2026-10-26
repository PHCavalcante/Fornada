import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { palette } from '../theme';

const RootLayout = () => (
  <AuthProvider>
    <CartProvider>
      <div style={{
        backgroundColor: palette.light.background,
        height: '100vh',
      }}>
        <Outlet />
        {/* <TanStackRouterDevtools /> */}
      </div>
    </CartProvider>
  </AuthProvider>
)

export const Route = createRootRoute({ component: RootLayout })
