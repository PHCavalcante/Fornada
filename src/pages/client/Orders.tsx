import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import ClientHeader from '../../components/ClientHeader'
import ClientMenu from '../../components/ClientMenu'
import { useCart } from '../../contexts/CartContext'
import { palette } from '../../theme'
import logoPadariaFallback from '../../assets/logo.png'
import produtoImagemFallback from '../../assets/logo.png'
import { supabase } from '../../utils/supabase'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Orders() {
  const { cart, itemCount, subtotal, alterarQuantidade, limparCarrinho } = useCart()
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ClientHeader title="Pedidos" showClearButton={itemCount > 0} onClear={limparCarrinho} />
      {!cart || cart.items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h2 className="text-lg font-semibold">Seu pedido está vazio</h2>
          <p className="mt-2 text-sm text-gray-600">Escolha uma padaria e adicione produtos para montar seu pedido.</p>
          <Link to="/" className="mt-5 rounded-lg px-5 py-3 font-semibold text-white" style={{ backgroundColor: palette.light.accent }}>
            Explorar padarias
          </Link>
        </div>
      ) : (
        <>
          <main className="min-h-0 flex flex-col flex-1 overflow-y-auto px-5 pb-5">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={cart.bakery_logo_url || logoPadariaFallback}
                alt={`Logo da padaria ${cart.bakery_name}`}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <h2 className="min-w-0 flex-1 truncate font-bold">{cart.bakery_name}</h2>
              <Link to="/client/bakery/$bakery" params={{ bakery: cart.bakery_id }} className="text-sm underline">
                Ver cardápio
              </Link>
            </div>
            <p className='mt-28'>Itens Adicionados</p>
            <div className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <article key={item.product_id} className="flex items-center gap-3">
                  <img
                    src={item.image_url || produtoImagemFallback}
                    alt={`Imagem de ${item.name}`}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                    )}
                    <p className="mt-1 font-semibold" style={{ color: "#2E9C12" }}>{moeda.format(item.unit_price * item.quantity)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.product_id, item.quantity - 1)}
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      className="h-8 w-8 rounded-full"
                      style={{ color: palette.light.accent}}
                    >−</button>
                    <span className="min-w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.product_id, item.quantity + 1)}
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      className="h-8 w-8 rounded-full"
                      style={{ color: palette.light.accent}}
                    >+</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex flex-col px-5 my-auto">
            <span className="font-bold mb-1">Resumo dos valores</span>
            <div className="flex space-between justify-between w-full">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                <span className="text-gray-500">Taxa de entrega</span>
                <span className='font-medium'>Total</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">{moeda.format(subtotal)}</span>
                <span className="text-gray-500">{deliveryFee === null ? '—' : moeda.format(deliveryFee)}</span>
                <span className='font-medium'>{total === null ? '—' : moeda.format(total)}</span>
              </div>
            </div>
          </div>
          </main>
          <footer className="flex items-center justify-between px-5">
            <div className="flex flex-col px-5 my-auto">
              <span>Total a pagar</span>
              <span style={{ color: "#2E9C12" }}>{total === null ? '—' : moeda.format(total)}</span>
            </div>
            <Link to="/client/Checkout" className='text-white text-center py-1 h-10 rounded-lg w-32' style={{ backgroundColor: palette.light.accent }}>Continuar</Link>
          </footer>
        </>
      )}
      <ClientMenu />
    </div>
  )
}
