import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import ClientHeader from '../../components/ClientHeader'
import location from '../../assets/location.svg'
import logoPadariaFallback from '../../assets/logo.png'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { palette } from '../../theme'
import { useLocalizacao } from '../../utils/GetLocation'
import { criarPedidoSimulado } from '../../utils/customerOrders'
import { supabase } from '../../utils/supabase'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Checkout() {
    const navigate = useNavigate()
    const { cart, itemCount, subtotal, limparCarrinho } = useCart()
    const { profile } = useAuth()
    const { coordenadas, enderecoCompleto, erro: erroLocalizacao, carregando: carregandoLocalizacao, pegarLocalizacao } = useLocalizacao()
    const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
    const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
    const [enviandoPedido, setEnviandoPedido] = useState(false)
    const [erroPedido, setErroPedido] = useState<string | null>(null)

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

    async function fazerPedido() {
        if (!cart || !profile?.id || !coordenadas) {
            setErroPedido(!coordenadas
                ? 'Para registrar o pedido, informe sua localização pelo GPS.'
                : 'Entre na sua conta de cliente para continuar.')
            return
        }
        setEnviandoPedido(true)
        setErroPedido(null)
        try {
            const orderId = await criarPedidoSimulado({
                bakeryId: cart.bakery_id,
                items: cart.items,
                coordinates: coordenadas,
                deliveryAddress: enderecoCompleto ?? `${coordenadas.lat.toFixed(5)}, ${coordenadas.lng.toFixed(5)}`,
            })
            limparCarrinho()
            setConfirmacaoAberta(false)
            await navigate({ to: '/client/TrackOrder', search: { orderId } })
        } catch (falha) {
            setErroPedido(falha instanceof Error ? falha.message : 'Não foi possível registrar o pedido. Tente novamente.')
        } finally {
            setEnviandoPedido(false)
        }
    }

    useEffect(() => {
        if (!confirmacaoAberta) return

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === 'Escape') setConfirmacaoAberta(false)
        }

        window.addEventListener('keydown', fecharComEscape)
        return () => window.removeEventListener('keydown', fecharComEscape)
    }, [confirmacaoAberta])

    return (
        <div className="flex h-full min-h-0 flex-col">
            <ClientHeader title="Checkout" backTo="/client/Orders" />

            <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
                <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                        <img
                            src={cart?.bakery_logo_url || logoPadariaFallback}
                            alt={cart ? `Logo da padaria ${cart.bakery_name}` : ''}
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Seu pedido</p>
                            <h2 className="truncate font-semibold">{cart?.bakery_name ?? 'Padaria'}</h2>
                        </div>
                        <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-900">
                            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                        </span>
                    </div>

                    <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="font-bold">Endereço de entrega</h2>
                            <p className="mt-1 text-sm text-gray-500">Entrega no endereço atual</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                                <img src={location} alt="" className="h-5 w-5" />
                            </span>
                            <p className="min-w-0 flex-1 break-words pt-1 text-sm leading-6 text-gray-700">
                                {enderecoCompleto ?? 'Endereço não informado'}
                            </p>
                            <button
                                type="button"
                                onClick={() => { setErroPedido(null); void pegarLocalizacao() }}
                                disabled={carregandoLocalizacao}
                                className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                                style={{ color: palette.light.accent }}
                            >
                                {carregandoLocalizacao ? 'Obtendo...' : 'Usar GPS'}
                            </button>
                        </div>
                        {(!coordenadas || erroLocalizacao) && (
                            <p className="mt-2 text-sm text-amber-800" role="status">
                                {erroLocalizacao ?? 'O pedido precisa das coordenadas do GPS. O CEP sozinho não informa um ponto exato.'}
                            </p>
                        )}
                    </section>

                    <section>
                        <h2 className="mb-3 px-1 font-bold">Tipo de entrega</h2>
                        <button
                            type="button"
                            aria-pressed="true"
                            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ borderColor: palette.light.accent, outlineColor: palette.light.accent }}
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" style={{ color: palette.light.accent }}>
                                    <path d="M2.75 6.75h11.5v11h-11.5zM14.25 10h4l3 3.5v4.25h-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                                    <circle cx="7" cy="18" r="1.75" fill="white" stroke="currentColor" strokeWidth="1.7" />
                                    <circle cx="18" cy="18" r="1.75" fill="white" stroke="currentColor" strokeWidth="1.7" />
                                </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold">Entrega padrão</p>
                                <p className="mt-1 text-sm text-gray-500">Taxa definida pela padaria</p>
                            </div>
                            <span className="font-semibold">
                                {deliveryFee === null ? '—' : moeda.format(deliveryFee)}
                            </span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: palette.light.accent }} aria-hidden="true">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette.light.accent }} />
                            </span>
                        </button>
                    </section>

                    <section>
                        <h2 className="mb-3 px-1 font-bold">Forma de pagamento</h2>
                        <button
                            type="button"
                            aria-pressed="true"
                            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ borderColor: palette.light.accent, outlineColor: palette.light.accent }}
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-800" aria-hidden="true">PIX</span>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold">Pagamento via Pix</p>
                                <p className="mt-1 text-sm text-gray-500">Simulação; nenhum pagamento será processado</p>
                            </div>
                            <span className="font-semibold">
                                {total === null ? '—' : moeda.format(total)}
                            </span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: palette.light.accent }} aria-hidden="true">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette.light.accent }} />
                            </span>
                        </button>
                    </section>

                    <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                        <h2 className="mb-4 font-bold">Resumo do pedido</h2>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex items-center justify-between gap-4 text-gray-600">
                                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                                <span className="shrink-0">{moeda.format(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-gray-600">
                                <span>Taxa de entrega</span>
                                <span className="shrink-0">{deliveryFee === null ? '—' : moeda.format(deliveryFee)}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-bold">Total a pagar</span>
                                    <span className="shrink-0 text-lg font-bold" style={{ color: palette.light.accent }}>
                                        {total === null ? '—' : moeda.format(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="shrink-0 border-t border-amber-100 px-5 py-3">
                <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500">Total a pagar</p>
                        <p className="truncate text-lg font-bold" style={{ color: palette.light.accent }}>
                            {total === null ? '—' : moeda.format(total)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setConfirmacaoAberta(true)}
                        disabled={!cart || itemCount === 0 || total === null || enviandoPedido}
                        className="h-11 min-w-36 rounded-xl px-6 font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: palette.light.accent, outlineColor: palette.light.accent }}
                    >
                        Continuar
                    </button>
                </div>
            </footer>

            {confirmacaoAberta && (
                <div
                    className="dialog-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-5"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) setConfirmacaoAberta(false)
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-confirmacao-pedido"
                        className="dialog-panel w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="titulo-confirmacao-pedido" className="text-xl font-bold">Confirme seu pedido</h2>
                                <p className="mt-1 text-sm text-gray-500">Confira as opções antes de continuar.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfirmacaoAberta(false)}
                                aria-label="Fechar confirmação"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl bg-amber-50/70 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Entrega padrão</p>
                                    <p className="text-sm text-gray-500">Tipo de entrega</p>
                                </div>
                                <span className="shrink-0 font-semibold">{deliveryFee === null ? '—' : moeda.format(deliveryFee)}</span>
                            </div>
                            <div className="border-t border-amber-200" />
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Pix (simulação)</p>
                                    <p className="text-sm text-gray-500">Nenhuma cobrança será realizada</p>
                                </div>
                                <span className="shrink-0 font-semibold">{total === null ? '—' : moeda.format(total)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            {erroPedido && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erroPedido}</p>}
                            <button
                                type="button"
                                onClick={() => void fazerPedido()}
                                disabled={enviandoPedido || !coordenadas}
                                className="flex h-12 items-center justify-center rounded-xl px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ backgroundColor: palette.light.accent }}
                            >
                                {enviandoPedido ? 'Registrando pedido...' : 'Fazer pedido'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmacaoAberta(false)}
                                disabled={enviandoPedido}
                                className="h-11 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Alterar pedido
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
