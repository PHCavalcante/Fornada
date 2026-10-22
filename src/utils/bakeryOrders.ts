import { buscarPadariaDoProprietario } from './bakeryWorkspace'
import { supabase } from './supabase'

export type StatusPedido = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface ItemPedidoPadaria {
  id: string
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
}

export interface PedidoPadaria {
  id: string
  customer_id: string
  bakery_id: string
  delivery_latitude: number
  delivery_longitude: number
  delivery_address_text: string | null
  status: StatusPedido
  payment_method: 'pix' | 'cash' | 'credit_card' | 'debit_card'
  subtotal: number
  delivery_fee: number
  total: number
  scheduled_for: string | null
  customer_notes: string | null
  created_at: string
  order_items: ItemPedidoPadaria[]
}

export async function buscarPedidosDoProprietario(ownerId: string) {
  const padaria = await buscarPadariaDoProprietario(ownerId)
  if (!padaria) return { padaria: null, pedidos: [] as PedidoPadaria[] }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, customer_id, bakery_id, delivery_latitude, delivery_longitude,
      delivery_address_text, status, payment_method, subtotal, delivery_fee,
      total, scheduled_for, customer_notes, created_at,
      order_items ( id, product_name, unit_price, quantity, subtotal )
    `)
    .eq('bakery_id', padaria.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return { padaria, pedidos: (data ?? []) as unknown as PedidoPadaria[] }
}

const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
}

export function proximoStatus(status: StatusPedido) {
  return PROXIMO_STATUS[status] ?? null
}

export async function atualizarStatusPedido(pedido: PedidoPadaria, status: StatusPedido) {
  const proximo = proximoStatus(pedido.status)
  const podeRecusar = pedido.status === 'pending' || pedido.status === 'confirmed'
  if (status !== proximo && !(status === 'cancelled' && podeRecusar)) {
    throw new Error('Esta mudança de status não é permitida.')
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', pedido.id)
    .eq('bakery_id', pedido.bakery_id)
    .eq('status', pedido.status)
    .select('id')
    .single()

  if (error) throw new Error(error.message)
}
