import type { ItemCarrinho } from '../contexts/CartContext'
import type { StatusPedido } from './bakeryOrders'
import { supabase } from './supabase'

export interface PedidoCliente {
  id: string
  bakery_id: string
  status: StatusPedido
  payment_method: 'pix' | 'cash' | 'credit_card' | 'debit_card'
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address_text: string | null
  created_at: string
  bakery: { name: string; logo_url: string | null } | null
  order_items: {
    id: string
    product_name: string
    unit_price: number
    quantity: number
    subtotal: number
  }[]
  order_status_history: { status: StatusPedido; note: string | null; changed_at: string }[]
}

export async function criarPedidoSimulado(args: {
  bakeryId: string
  items: Pick<ItemCarrinho, 'product_id' | 'quantity' | 'unit_price'>[]
  coordinates: { lat: number; lng: number }
  deliveryAddress: string
}) {
  const { data, error } = await supabase.rpc('create_customer_order', {
    p_bakery_id: args.bakeryId,
    p_items: args.items.map(({ product_id, quantity, unit_price }) => ({ product_id, quantity, unit_price })),
    p_delivery_latitude: args.coordinates.lat,
    p_delivery_longitude: args.coordinates.lng,
    p_delivery_address_text: args.deliveryAddress,
    p_payment_method: 'pix',
  })

  if (error) {
    throw new Error(error.message || 'Não foi possível registrar o pedido. Tente novamente.')
  }
  if (typeof data !== 'string') throw new Error('O pedido foi enviado, mas não recebemos sua identificação.')
  return data
}

export async function buscarPedidosRecentesDoCliente(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, bakery_id, status, total, created_at, bakeries(name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => {
    const bakery = row.bakeries as unknown as { name: string } | null
    return {
      id: row.id,
      status: row.status as StatusPedido,
      total: Number(row.total),
      created_at: row.created_at,
      bakery_name: bakery?.name ?? 'Padaria',
    }
  })
}

export async function buscarPedidoDoCliente(orderId: string, customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, bakery_id, status, payment_method, subtotal, delivery_fee, total,
      delivery_address_text, created_at,
      bakery:bakeries(name, logo_url),
      order_items(id, product_name, unit_price, quantity, subtotal),
      order_status_history(status, note, changed_at)
    `)
    .eq('id', orderId)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  const pedido = data as unknown as PedidoCliente
  pedido.subtotal = Number(pedido.subtotal)
  pedido.delivery_fee = Number(pedido.delivery_fee)
  pedido.total = Number(pedido.total)
  pedido.order_items = pedido.order_items.map((item) => ({
    ...item,
    unit_price: Number(item.unit_price),
    subtotal: Number(item.subtotal),
  }))
  return pedido
}
