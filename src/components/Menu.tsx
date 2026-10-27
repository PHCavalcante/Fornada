import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import Logo from '../assets/logo.png'
import dashboardLogo from '../assets/dashboard.svg'
import ordersLogo from '../assets/orders.svg'
import exit from '../assets/exit.svg'
import manager from '../assets/manager.svg'
import catalog from '../assets/catalog.svg'
import { useAuth } from '../contexts/AuthContext'
import { palette } from '../theme'
import { mensagemDeErro } from '../utils/auth'

const itensMenu = [
  { to: '/bakery/Dashboard' as const, rotulo: 'Dashboard', icone: dashboardLogo },
  { to: '/bakery/Orders' as const, rotulo: 'Pedidos', icone: ordersLogo },
  { to: '/bakery/Management' as const, rotulo: 'Gerência', icone: manager },
  { to: '/bakery/Catalog' as const, rotulo: 'Catálogo', icone: catalog },
]

export default function Menu() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [erro, setErro] = useState<string | null>(null)

  async function logOut() {
    if (!confirm('Você tem certeza que deseja sair?')) return
    try {
      await signOut()
      navigate({ to: '/bakery/Login', replace: true })
    } catch (erroLogout) {
      setErro(mensagemDeErro(erroLogout))
    }
  }

  function ativo(caminho: string) {
    return location.pathname === caminho
  }

  return (
    <>
      <aside
        style={{ backgroundColor: palette.light.accent }}
        className="hidden h-full min-h-0 w-64 shrink-0 flex-col items-center overflow-y-auto shadow-[4px_0px_4px_0px_#00000020] lg:flex lg:w-72"
      >
        <img src={Logo} alt="Fornada" width={132} className="mt-5" draggable={false} />
        <span className="text-xl text-white">FORNADA</span>
        <nav aria-label="Navegação da padaria" className="mt-12 flex w-full flex-col px-4">
          {itensMenu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={ativo(item.to) ? 'page' : undefined}
              style={{ backgroundColor: ativo(item.to) ? palette.light.primary : 'transparent' }}
              className="mb-3 flex min-h-12 items-center gap-3 rounded-lg px-4 py-2 text-base font-bold text-white xl:text-lg"
            >
              <img src={item.icone} alt="" className="h-6 w-6 shrink-0" />
              <span>{item.rotulo}</span>
            </Link>
          ))}
        </nav>
        <button onClick={() => void logOut()} className="mt-auto mb-5 flex min-h-12 items-center gap-3 rounded-lg px-4 py-2 font-bold text-white hover:bg-white/10">
          <img src={exit} alt="" className="h-6 w-6" />
          Sair
        </button>
      </aside>

      <nav
        aria-label="Navegação da padaria"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/15 px-1 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] text-white shadow-[0_-4px_18px_#0002] lg:hidden"
        style={{ backgroundColor: palette.light.accent }}
      >
        {itensMenu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={ativo(item.to) ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[11px] font-semibold ${ativo(item.to) ? 'bg-white/15' : ''}`}
          >
            <img src={item.icone} alt="" className="h-5 w-5 shrink-0" />
            <span className="max-w-full truncate">{item.rotulo}</span>
          </Link>
        ))}
        <button onClick={() => void logOut()} aria-label="Sair" className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[11px] font-semibold">
          <img src={exit} alt="" className="h-5 w-5 shrink-0" />
          <span>Sair</span>
        </button>
      </nav>
      {erro && <p role="alert" className="fixed bottom-20 left-1/2 z-50 w-[min(92vw,30rem)] -translate-x-1/2 rounded-lg bg-red-700 px-4 py-3 text-center text-sm text-white shadow-lg lg:bottom-4">{erro}</p>}
    </>
  )
}
