import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import ClientHeader from '../../components/ClientHeader'
import ClientMenu from '../../components/ClientMenu'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { palette } from '../../theme'
import logoPadariaFallback from '../../assets/logo.png'
import produtoImagemFallback from '../../assets/logo.png'
import { supabase } from '../../utils/supabase'
import { buscarPedidosRecentesDoCliente } from '../../utils/customerOrders'
import type { StatusPedido } from '../../utils/bakeryOrders'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Orders() {
  const { cart, itemCount, subtotal, alterarQuantidade, limparCarrinho } = useCart()
  const { profile } = useAuth()
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [pedidosRecentes, setPedidosRecentes] = useState<Awaited<ReturnType<typeof buscarPedidosRecentesDoCliente>>>([])

  useEffect(() => {
    let ativo = true

    if (!cart?.bakery_id) {
      setDeliveryFee(null)
      return () => { ativo = false }
    }

    setDeliveryFee(null)
    supabase
      .from('bakeries')
      .select('delivery_fee')
      .eq('id', cart.bakery_id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!ativo) return
        setDeliveryFee(error || !data ? null : Number(data.delivery_fee ?? 0))
      })

    return () => { ativo = false }
  }, [cart?.bakery_id])

  const total = deliveryFee === null ? null : subtotal + deliveryFee

  useEffect(() => {
    if (!profile?.id) return
    let ativo = true
    buscarPedidosRecentesDoCliente(profile.id)
      .then((pedidos) => { if (ativo) setPedidosRecentes(pedidos) })
      .catch(() => { if (ativo) setPedidosRecentes([]) })
    return () => { ativo = false }
  }, [profile?.id])

  const historico = pedidosRecentes.length > 0 && (
    <section className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-bold text-gray-900">Pedidos recentes</h2>
      <ul className="flex flex-col divide-y divide-gray-100">
        {pedidosRecentes.map((pedido) => (
          <li key={pedido.id}>
            <Link to="/client/TrackOrder" search={{ orderId: pedido.id }} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
              <span className="min-w-0">
                <span className="block truncate font-semibold text-gray-800">{pedido.bakery_name}</span>
                <span className="mt-1 block text-xs text-gray-500">#{pedido.id.slice(0, 8).toUpperCase()} · {formatarData(pedido.created_at)}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-semibold">{moeda.format(pedido.total)}</span>
                <span className={`mt-1 block text-xs font-medium ${pedido.status === 'cancelled' ? 'text-red-700' : 'text-amber-800'}`}>{rotuloStatus(pedido.status)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffaf5]">
      <ClientHeader title="Pedidos" showClearButton={itemCount > 0} onClear={limparCarrinho} />
      {!cart || cart.items.length === 0 ? (
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <div className="flex min-h-[55%] flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Seu pedido está vazio</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">Escolha uma padaria e adicione produtos para montar seu pedido.</p>
            <Link to="/" className="mt-5 rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-95" style={{ backgroundColor: palette.light.accent }}>
              Explorar padarias
            </Link>
          </div>
          {historico}
        </main>
      ) : (
        <>
          <main className="min-h-0 flex flex-col flex-1 overflow-y-auto px-5 pb-5">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
              <img
                src={cart.bakery_logo_url || logoPadariaFallback}
                alt={`Logo da padaria ${cart.bakery_name}`}
                className="h-12 w-12 shrink-0 rounded-full border-2 border-orange-50 object-cover"
              />
              <h2 className="min-w-0 flex-1 truncate font-bold text-gray-900">{cart.bakery_name}</h2>
              <Link to="/client/bakery/$bakery" params={{ bakery: cart.bakery_id }} className="rounded-lg px-2 py-1 text-sm font-semibold underline underline-offset-4" style={{ color: palette.light.accent }}>
                Ver cardápio
              </Link>
            </div>
            <p className="mb-3 mt-7 text-lg font-bold tracking-tight text-gray-900">Itens Adicionados</p>
            <div className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <article key={item.product_id} className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
                  <img
                    src={item.image_url || produtoImagemFallback}
                    alt={`Imagem de ${item.name}`}
                    className="h-16 w-16 shrink-0 rounded-xl bg-orange-50 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                    )}
                    <p className="mt-1 font-semibold" style={{ color: palette.light.accent }}>{moeda.format(item.unit_price * item.quantity)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full bg-orange-50 p-1">
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.product_id, item.quantity - 1)}
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      className="h-8 w-8 rounded-full bg-white text-lg shadow-sm transition hover:bg-orange-100"
                      style={{ color: palette.light.accent}}
                    >−</button>
                    <span className="min-w-5 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.product_id, item.quantity + 1)}
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      className="h-8 w-8 rounded-full bg-white text-lg shadow-sm transition hover:bg-orange-100"
                      style={{ color: palette.light.accent}}
                    >+</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="my-auto flex flex-col rounded-2xl border border-orange-100 bg-white px-4 py-4 shadow-sm">
            <span className="mb-3 font-bold text-gray-900">Resumo dos valores</span>
            <div className="flex space-between justify-between w-full">
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-gray-500">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                <span className="text-gray-500">Taxa de entrega</span>
                <span className='font-medium'>Total</span>
              </div>
              <div className="flex flex-col gap-2 text-right text-sm">
                <span className="text-gray-500">{moeda.format(subtotal)}</span>
                <span className="text-gray-500">{deliveryFee === null ? '—' : moeda.format(deliveryFee)}</span>
                <span className='font-medium'>{total === null ? '—' : moeda.format(total)}</span>
              </div>
            </div>
          </div>
            {historico}
          </main>
          <footer className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="my-auto flex min-w-0 flex-col px-2">
              <span className="text-xs font-medium text-gray-500">Total a pagar</span>
              <span className="truncate text-lg font-bold" style={{ color: palette.light.accent }}>{total === null ? '—' : moeda.format(total)}</span>
            </div>
            <Link to="/client/Checkout" className="flex h-11 w-36 shrink-0 items-center justify-center rounded-xl px-4 font-semibold text-white shadow-sm transition hover:brightness-95" style={{ backgroundColor: palette.light.accent }}>Continuar</Link>
          </footer>
        </>
      )}
      <ClientMenu />
    </div>
  )
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
}

function rotuloStatus(status: StatusPedido) {
  const rotulos: Record<StatusPedido, string> = {
    pending: 'Aguardando confirmação',
    confirmed: 'Confirmado',
    preparing: 'Em preparo',
    out_for_delivery: 'Saiu para entrega',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  }
  return rotulos[status]
}
