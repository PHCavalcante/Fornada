import { buscarPadariaDoProprietario } from './bakeryWorkspace'
import { supabase } from './supabase'

export interface ResumoDashboardPadaria {
  padariaNome: string
  faturamentoEntregue: number
  pedidosEntregues: number
  pedidosEmAndamento: number
  pedidosCancelados: number
}

const TAMANHO_PAGINA = 500
const DIAS_PERIODO = 30

export async function buscarResumoDashboard(ownerId: string): Promise<ResumoDashboardPadaria | null> {
  const padaria = await buscarPadariaDoProprietario(ownerId)
  if (!padaria) return null

  const desde = new Date(Date.now() - DIAS_PERIODO * 24 * 60 * 60 * 1000).toISOString()
  let pagina = 0
  let faturamentoEmCentavos = 0
  let pedidosEntregues = 0
  let pedidosCancelados = 0

  while (true) {
    const inicio = pagina * TAMANHO_PAGINA
    const { data, error } = await supabase
      .from('order_status_history')
      .select('order_id, status, changed_at, orders!inner(bakery_id, total)')
      .eq('orders.bakery_id', padaria.id)
      .in('status', ['delivered', 'cancelled'])
      .gte('changed_at', desde)
      .order('changed_at')
      .order('order_id')
      .range(inicio, inicio + TAMANHO_PAGINA - 1)

    if (error) throw new Error(error.message)
    const eventos = data ?? []

    for (const evento of eventos) {
      const pedido = evento.orders as unknown as { bakery_id: string; total: number }
      if (evento.status === 'delivered') {
        pedidosEntregues += 1
        faturamentoEmCentavos += Math.round(Number(pedido.total) * 100)
      } else if (evento.status === 'cancelled') {
        pedidosCancelados += 1
      }
    }

    if (eventos.length < TAMANHO_PAGINA) break
    pagina += 1
  }

  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('bakery_id', padaria.id)
    .in('status', ['pending', 'confirmed', 'preparing', 'out_for_delivery'])

  if (error) throw new Error(error.message)

  return {
    padariaNome: padaria.name,
    faturamentoEntregue: faturamentoEmCentavos / 100,
    pedidosEntregues,
    pedidosEmAndamento: count ?? 0,
    pedidosCancelados,
  }
}
