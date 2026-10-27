import { Link, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import ClientHeader from '../../components/ClientHeader'
import { useAuth } from '../../contexts/AuthContext'
import { palette } from '../../theme'
import { buscarPedidoDoCliente, type PedidoCliente } from '../../utils/customerOrders'
import { supabase } from '../../utils/supabase'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
const etapas = [
  { status: 'pending', titulo: 'Pedido recebido', detalhe: 'Aguardando confirmação da padaria.' },
  { status: 'confirmed', titulo: 'Pedido confirmado', detalhe: 'A padaria aceitou o pedido.' },
  { status: 'preparing', titulo: 'Em preparo', detalhe: 'A padaria está preparando seus produtos.' },
  { status: 'out_for_delivery', titulo: 'Saiu para entrega', detalhe: 'Seu pedido está a caminho.' },
  { status: 'delivered', titulo: 'Entregue', detalhe: 'Pedido concluído.' },
] as const

export default function TrackOrder() {
  const { orderId } = useSearch({ from: '/client/TrackOrder' })
  const { profile } = useAuth()
  const [pedido, setPedido] = useState<PedidoCliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const idPedidoCarregado = pedido?.id
  const statusPedidoCarregado = pedido?.status

  const carregar = useCallback(async () => {
    if (!orderId || !profile?.id) {
      setPedido(null)
      setCarregando(false)
      return
    }
    try {
      setErro(null)
      const resultado = await buscarPedidoDoCliente(orderId, profile.id)
      setPedido(resultado)
      if (!resultado) setErro('Não encontramos esse pedido na sua conta.')
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar o pedido.')
    } finally {
      setCarregando(false)
    }
  }, [orderId, profile?.id])

  useEffect(() => {
    if (idPedidoCarregado !== orderId) setCarregando(true)
    void carregar()
    if (!orderId || statusPedidoCarregado === 'delivered' || statusPedidoCarregado === 'cancelled') return

    const canal = supabase
      .channel(`pedido-cliente-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, () => { void carregar() })
      .subscribe()

    // Polling mantém o acompanhamento atualizado se Realtime não estiver habilitado no projeto.
    const intervalo = window.setInterval(() => { void carregar() }, 15000)
    return () => {
      window.clearInterval(intervalo)
      void supabase.removeChannel(canal)
    }
  }, [carregar, idPedidoCarregado, orderId, statusPedidoCarregado])

  const statusAtual = pedido?.status
  const cancelado = statusAtual === 'cancelled'
  const indiceAtual = etapas.findIndex((etapa) => etapa.status === statusAtual)
  const historicoPorStatus = new Map((pedido?.order_status_history ?? []).map((evento) => [evento.status, evento.changed_at]))

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffaf5]">
      <ClientHeader title="Acompanhar pedido" backTo="/client/Orders" />
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pt-5">
          {carregando ? (
            <div className="rounded-2xl bg-white p-6 text-center text-gray-600">Carregando seu pedido...</div>
          ) : erro ? (
            <section className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <h1 className="text-lg font-bold">Não foi possível exibir o pedido</h1>
              <p role="alert" className="mt-2 text-sm text-gray-600">{erro}</p>
              <Link to="/client/Orders" className="mt-5 inline-flex rounded-xl px-5 py-3 font-semibold text-white" style={{ backgroundColor: palette.light.accent }}>
                Voltar aos pedidos
              </Link>
            </section>
          ) : pedido ? (
            <>
              <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</p>
                    <h1 className="mt-1 text-xl font-bold">{pedido.bakery?.name ?? 'Sua padaria'}</h1>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${cancelado ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-900'}`}>
                    {cancelado ? 'Cancelado' : etapas[Math.max(indiceAtual, 0)]?.titulo}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Feito em {dataHora.format(new Date(pedido.created_at))}</p>
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
                  Pagamento via Pix em modo de simulação. Nenhuma cobrança foi realizada.
                </p>
              </section>

              <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <h2 className="mb-5 font-bold">Acompanhe o preparo</h2>
                {cancelado ? (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                    A padaria cancelou este pedido. Consulte a padaria para mais informações.
                  </div>
                ) : (
                  <ol className="flex flex-col">
                    {etapas.map((etapa, indice) => {
                      const concluida = indiceAtual >= indice
                      const horario = historicoPorStatus.get(etapa.status)
                      return (
                        <li key={etapa.status} className="relative flex gap-4 pb-6 last:pb-0">
                          {indice < etapas.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5 ${indiceAtual > indice ? 'bg-amber-700' : 'bg-gray-200'}`} aria-hidden="true" />}
                          <span className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${concluida ? 'border-amber-800 bg-amber-800' : 'border-gray-300 bg-white'}`} aria-hidden="true">
                            {concluida && <span className="block text-center text-sm leading-5 text-white">✓</span>}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`font-semibold ${concluida ? 'text-gray-900' : 'text-gray-400'}`}>{etapa.titulo}</p>
                            <p className={`mt-1 text-sm ${concluida ? 'text-gray-600' : 'text-gray-400'}`}>{etapa.detalhe}</p>
                            {horario && <p className="mt-1 text-xs text-gray-500">{dataHora.format(new Date(horario))}</p>}
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>

              <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-bold">Resumo</h2>
                <ul className="flex flex-col gap-3">
                  {pedido.order_items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4 text-sm">
                      <span className="min-w-0 text-gray-700">{item.quantity} × {item.product_name}</span>
                      <span className="shrink-0 font-medium">{moeda.format(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="my-4 border-t border-dashed border-gray-200" />
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-gray-600">Subtotal</dt><dd>{moeda.format(pedido.subtotal)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-gray-600">Entrega</dt><dd>{moeda.format(pedido.delivery_fee)}</dd></div>
                  <div className="flex justify-between gap-4 font-bold"><dt>Total</dt><dd>{moeda.format(pedido.total)}</dd></div>
                </dl>
              </section>

              <button type="button" onClick={() => void carregar()} className="self-center rounded-lg px-4 py-2 text-sm font-semibold underline" style={{ color: palette.light.accent }}>
                Atualizar acompanhamento
              </button>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}
