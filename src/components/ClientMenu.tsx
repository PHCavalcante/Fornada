import { Link, useLocation } from '@tanstack/react-router'
import home from '../assets/home.svg'
import orders from '../assets/orders.svg'
import profile from '../assets/profile.svg'
import search from '../assets/search.svg'

export default function ClientMenu() {
  const location = useLocation()

  return (
    <nav aria-label="Navegação do cliente" className="flex w-full shrink-0 items-center justify-between px-4 py-2">
      <Link to="/" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === '/' ? '#000' : '#888' }}>
        <img src={home} alt="" />
        Início
      </Link>
      <Link to="/client/Orders" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === '/client/Orders' ? '#000' : '#888' }}>
        <img src={orders} width={20} className="invert" alt="" />
        Pedidos
      </Link>
      <Link to="/client/Search" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === '/client/Search' ? '#000' : '#888' }}>
        <img src={search} width={20} alt="" />
        Busca
      </Link>
      <Link to="/client/Profile" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === '/client/Profile' ? '#000' : '#888' }}>
        <img src={profile} alt="" style={{ opacity: location.pathname === '/client/Profile' ? '100%' : '75%' }} />
        Perfil
      </Link>
    </nav>
  )
}
