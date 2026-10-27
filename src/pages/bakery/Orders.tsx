import { useCallback, useEffect, useState } from 'react'
import Menu from '../../components/Menu'
import { useAuth } from '../../contexts/AuthContext'
import { palette } from '../../theme'
import {
  atualizarStatusPedido,
  buscarPedidosDoProprietario,
  proximoStatus,
  type PedidoPadaria,
  type StatusPedido,
} from '../../utils/bakeryOrders'

const rotulosStatus: Record<StatusPedido, string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Confirmado',
  preparing: 'Em preparo',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const rotulosPagamento = {
  pix: 'Pix (simulado)',
  cash: 'Dinheiro',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
} as const

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export default function Orders() {
  const { profile } = useAuth()
  const [pedidos, setPedidos] = useState<PedidoPadaria[]>([])
  const [nomePadaria, setNomePadaria] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [pedidoEmAtualizacao, setPedidoEmAtualizacao] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregarPedidos = useCallback(async (silencioso = false) => {
    if (!profile?.id) return
    if (silencioso) setAtualizando(true)
    else setCarregando(true)
    setErro(null)
    try {
      const resultado = await buscarPedidosDoProprietario(profile.id)
      setNomePadaria(resultado.padaria?.name ?? '')
      setPedidos(resultado.pedidos)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os pedidos.')
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [profile?.id])

  useEffect(() => {
    void carregarPedidos()
  }, [carregarPedidos])

  async function mudarStatus(pedido: PedidoPadaria, status: StatusPedido) {
    const cancelando = status === 'cancelled'
    const confirmacao = cancelando
      ? 'Deseja realmente recusar/cancelar este pedido?'
      : `Deseja atualizar o pedido para “${rotulosStatus[status]}”?`
    if (!window.confirm(confirmacao)) return

    setPedidoEmAtualizacao(pedido.id)
    setErro(null)
    try {
      await atualizarStatusPedido(pedido, status)
      await carregarPedidos(true)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível atualizar o pedido.')
    } finally {
      setPedidoEmAtualizacao(null)
    }
  }

  const ativos = pedidos.filter((pedido) => !['delivered', 'cancelled'].includes(pedido.status))
  const finalizados = pedidos.filter((pedido) => ['delivered', 'cancelled'].includes(pedido.status))

  return (
    <div className="flex min-h-screen">
      <Menu />
      <main className="flex w-full flex-col px-6 pb-10 sm:ml-8 sm:px-10 lg:ml-14.75">
        <header className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: palette.light.accent }}>Pedidos</h1>
            {nomePadaria && <p className="mt-1 text-gray-600">{nomePadaria}</p>}
          </div>
          <button
            type="button"
            onClick={() => void carregarPedidos(true)}
            disabled={atualizando || carregando}
            className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50"
          >
            {atualizando ? 'Atualizando...' : 'Atualizar pedidos'}
          </button>
        </header>

        {erro && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}

        {carregando ? (
          <p className="mt-10 text-gray-600">Carregando pedidos...</p>
        ) : !nomePadaria ? (
          <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-bold">Nenhuma padaria vinculada à sua conta</h2>
            <p className="mt-2 text-gray-600">Conclua o cadastro da padaria para receber pedidos.</p>
          </section>
        ) : pedidos.length === 0 ? (
          <section className="mt-10 rounded-lg bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold">Nenhum pedido recebido ainda</h2>
            <p className="mt-2 text-gray-600">Quando um cliente fizer um pedido, ele aparecerá aqui.</p>
          </section>
        ) : (
          <div className="mt-8 flex flex-col gap-10">
            <section>
              <h2 className="mb-4 text-xl font-bold">Em andamento ({ativos.length})</h2>
              {ativos.length === 0 ? (
                <p className="text-gray-600">Nenhum pedido em andamento.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {ativos.map((pedido) => (
                    <CartaoPedido
                      key={pedido.id}
                      pedido={pedido}
                      ocupado={pedidoEmAtualizacao === pedido.id}
                      aoMudarStatus={(status) => void mudarStatus(pedido, status)}
                    />
                  ))}
                </div>
              )}
            </section>
            {finalizados.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold">Concluídos ou cancelados ({finalizados.length})</h2>
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {finalizados.map((pedido) => (
                    <CartaoPedido key={pedido.id} pedido={pedido} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function CartaoPedido({
  pedido,
  ocupado = false,
  aoMudarStatus,
}: {
  pedido: PedidoPadaria
  ocupado?: boolean
  aoMudarStatus?: (status: StatusPedido) => void
}) {
  const proximo = proximoStatus(pedido.status)
  const permiteCancelar = pedido.status === 'pending' || pedido.status === 'confirmed'
  const endereco = pedido.delivery_address_text?.trim()
    || `${pedido.delivery_latitude.toFixed(5)}, ${pedido.delivery_longitude.toFixed(5)}`

  return (
    <article className="flex flex-col rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</p>
          <p className="mt-1 text-sm text-gray-500">{dataHora.format(new Date(pedido.created_at))}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-center text-sm" style={{ backgroundColor: palette.light.secondary }}>
          {rotulosStatus[pedido.status]}
        </span>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <h3 className="font-semibold">Itens</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {pedido.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span>{item.quantity}x {item.product_name}</span>
              <span className="shrink-0">{moeda.format(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-600">Pagamento</dt>
          <dd>{rotulosPagamento[pedido.payment_method]}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-600">Subtotal</dt>
          <dd>{moeda.format(pedido.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-600">Entrega</dt>
          <dd>{moeda.format(pedido.delivery_fee)}</dd>
        </div>
        <div className="flex justify-between gap-3 font-bold">
          <dt>Total</dt>
          <dd>{moeda.format(pedido.total)}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
        <p className="font-semibold">Endereço de entrega</p>
        <p className="mt-1 break-words text-gray-700">{endereco}</p>
        {pedido.scheduled_for && (
          <p className="mt-2"><span className="font-semibold">Agendado para:</span> {dataHora.format(new Date(pedido.scheduled_for))}</p>
        )}
      </div>

      {pedido.customer_notes && (
        <p className="mt-3 text-sm"><span className="font-semibold">Observações:</span> {pedido.customer_notes}</p>
      )}

      {aoMudarStatus && proximo && (
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          {permiteCancelar && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => aoMudarStatus('cancelled')}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
            >
              Recusar
            </button>
          )}
          <button
            type="button"
            disabled={ocupado}
            onClick={() => aoMudarStatus(proximo)}
            className="rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: palette.light.accent }}
          >
            {ocupado ? 'Atualizando...' : rotulosStatus[proximo]}
          </button>
        </div>
      )}
    </article>
  )
}
