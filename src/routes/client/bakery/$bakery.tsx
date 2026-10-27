import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import ClientHeader from '../../../components/ClientHeader'
import { useCart } from '../../../contexts/CartContext'
import { palette } from '../../../theme'
import { buscarCatalogoPublico, type CategoriaPublica, type ProdutoPublico } from '../../../utils/clientCatalog'
import placeholderProduto from '../../../assets/logo.png'

type DadosPadariaCatalogo = {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  street: string
  adress_number: string
  neighborhood: string
  city: string
  avg_rating: number
  rating_count: number
  is_open: boolean
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const Route = createFileRoute('/client/bakery/$bakery')({ component: RouteComponent })

function RouteComponent() {
  const { bakery: bakeryId } = Route.useParams()
  const { cart, itemCount, subtotal, adicionarProduto } = useCart()
  const [padaria, setPadaria] = useState<DadosPadariaCatalogo | null>(null)
  const [categorias, setCategorias] = useState<CategoriaPublica[]>([])
  const [produtos, setProdutos] = useState<ProdutoPublico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [avisoCarrinho, setAvisoCarrinho] = useState<string | null>(null)
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoPublico | null>(null)
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)
    buscarCatalogoPublico(bakeryId)
      .then((dados) => {
        if (!ativo) return
        setPadaria(dados.padaria as DadosPadariaCatalogo | null)
        setCategorias(dados.categorias)
        setProdutos(dados.produtos)
      })
      .catch((falha: unknown) => {
        if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar esta padaria.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [bakeryId])

  function abrirProduto(produto: ProdutoPublico) {
    setProdutoSelecionado(produto)
    setQuantidade(1)
    setAvisoCarrinho(null)
  }

  function adicionarAoCarrinho(produto: ProdutoPublico) {
    if (!padaria) return
    const adicionado = adicionarProduto({ id: padaria.id, name: padaria.name, logo_url: padaria.logo_url }, produto, quantidade)
    if (adicionado) {
      setProdutoSelecionado(null)
      setAvisoCarrinho(`${quantidade} ${quantidade === 1 ? 'unidade adicionada' : 'unidades adicionadas'} ao carrinho.`)
      window.setTimeout(() => setAvisoCarrinho(null), 4500)
    } else {
      setAvisoCarrinho(`Seu carrinho já tem itens de ${cart?.bakery_name}. Esvazie-o antes de escolher outra padaria.`)
    }
  }

  const grupos = categorias.map((categoria) => ({
    categoria,
    produtos: produtos.filter((produto) => produto.category_id === categoria.id),
  }))
  const semCategoria = produtos.filter((produto) => !categorias.some((categoria) => categoria.id === produto.category_id))

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fffaf5]">
      <div className="relative shrink-0">
        <ClientHeader title="" turnAbsolute={true} />
        <div className="h-36 w-full bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 sm:h-48">
          {padaria?.cover_url && <img src={padaria.cover_url} alt="" className="h-full w-full object-cover" />}
        </div>
        {padaria?.logo_url && (
          <img src={padaria.logo_url ?? "https://files.catbox.moe/bkdtqw.png"} alt="" className="absolute -bottom-7 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border-4 border-white bg-white object-cover shadow-md" />
        )}
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
        {carregando ? (
          <p className="mx-auto mt-8 max-w-lg rounded-2xl bg-white px-5 py-10 text-center text-gray-600 shadow-sm ring-1 ring-orange-100">Carregando catálogo...</p>
        ) : erro ? (
          <p role="alert" className="mx-auto mt-8 max-w-lg rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center text-red-700">{erro}</p>
        ) : !padaria ? (
          <p className="mx-auto mt-8 max-w-lg rounded-2xl bg-white px-5 py-8 text-center text-gray-600 shadow-sm ring-1 ring-orange-100">Esta padaria não foi encontrada.</p>
        ) : (
          <>
            <header className={`rounded-3xl border border-orange-100 bg-white px-4 pb-5 pt-8 text-center shadow-sm ${padaria.logo_url ? 'mt-4' : ''}`}>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{padaria.name}</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-5 text-gray-600">
                {padaria.street}, {padaria.adress_number} · {padaria.neighborhood}, {padaria.city}
              </p>
              {padaria.rating_count > 0 && (
                <p className="mx-auto mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">★ {Number(padaria.avg_rating).toFixed(1)} <span className="ml-1 font-normal text-amber-800">({padaria.rating_count} avaliações)</span></p>
              )}
              <p className={`mx-auto mt-3 w-fit rounded-full px-3 py-1 text-xs font-semibold ${padaria.is_open ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                {padaria.is_open ? 'Aberta agora' : 'Fechada no momento'}
              </p>
              {padaria.description && <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">{padaria.description}</p>}
            </header>

            {produtos.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-10 text-center text-gray-600">Esta padaria ainda não possui produtos disponíveis.</p>
            ) : (
              <div className="mx-auto mt-7 flex max-w-3xl flex-col gap-7">
                {grupos.map(({ categoria, produtos: produtosDaCategoria }) => produtosDaCategoria.length > 0 && (
                  <section key={categoria.id}>
                    <h2 className="mb-3 border-l-4 border-orange-400 pl-3 text-lg font-bold text-gray-900">{categoria.name}</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {produtosDaCategoria.map((produto) => (
                        <ProdutoCard key={produto.id} produto={produto} imagemFallback={padaria.logo_url} aoSelecionar={abrirProduto} />
                      ))}
                    </div>
                  </section>
                ))}
                {semCategoria.length > 0 && (
                  <section>
                    <h2 className="mb-3 border-l-4 border-orange-400 pl-3 text-lg font-bold text-gray-900">Outros produtos</h2>
                    <div className="flex flex-col gap-3">
                      {semCategoria.map((produto) => (
                        <ProdutoCard key={produto.id} produto={produto} imagemFallback={padaria.logo_url} aoSelecionar={abrirProduto} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {avisoCarrinho && (
        <p role="status" className="fixed bottom-20 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-gray-900 px-4 py-3 text-center text-sm text-white shadow-xl">
          {avisoCarrinho}
        </p>
      )}

      {produtoSelecionado && padaria && (
        <div
          className="fixed inset-0 z-40 flex bg-black/50"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setProdutoSelecionado(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhe-produto"
            className="relative flex h-full max-h-full w-full max-w-none flex-col overflow-hidden rounded-none bg-[#fffaf5]"
          >
            <button
              type="button"
              onClick={() => setProdutoSelecionado(null)}
              aria-label="Fechar detalhes do produto"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-2xl shadow-lg ring-1 ring-black/5"
            >
              ×
            </button>
            <img
              src={produtoSelecionado.image_url || padaria.cover_url || padaria.logo_url || placeholderProduto}
              alt={produtoSelecionado.name}
              className="h-[45dvh] min-h-64 w-full shrink-0 bg-orange-50 object-cover"
            />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
              <h2 id="titulo-detalhe-produto" className="text-2xl font-bold tracking-tight text-gray-900">{produtoSelecionado.name}</h2>
              {produtoSelecionado.description && <p className="mt-2 text-sm leading-6 text-gray-600">{produtoSelecionado.description}</p>}
              <p className="mt-4 text-xl font-bold" style={{ color: palette.light.accent }}>{moeda.format(Number(produtoSelecionado.price))}</p>

              <div className="mt-auto pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold">Quantidade</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantidade((atual) => Math.max(1, atual - 1))}
                      aria-label="Diminuir quantidade"
                      className="h-10 w-10 rounded-full border border-orange-200 bg-white text-lg font-semibold text-gray-800 hover:bg-orange-50"
                    >−</button>
                    <span aria-live="polite" className="min-w-5 text-center">{quantidade}</span>
                    <button
                      type="button"
                      onClick={() => setQuantidade((atual) => atual + 1)}
                      aria-label="Aumentar quantidade"
                      className="h-10 w-10 rounded-full border border-orange-200 bg-white text-lg font-semibold text-gray-800 hover:bg-orange-50"
                    >+</button>
                  </div>
                </div>
                {!padaria.is_open && <p className="mb-3 text-sm text-red-700">Esta padaria está fechada no momento.</p>}
                {avisoCarrinho && <p role="alert" className="mb-3 text-sm text-red-700">{avisoCarrinho}</p>}
                {cart && cart.bakery_id !== bakeryId && (
                  <Link to="/client/Cart" className="mb-3 block text-center text-sm underline">
                    Abrir carrinho de {cart.bakery_name}
                  </Link>
                )}
                <button
                  type="button"
                  disabled={!padaria.is_open}
                  onClick={() => adicionarAoCarrinho(produtoSelecionado)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-50"
                  style={{ backgroundColor: palette.light.accent }}
                >
                  <span>Adicionar ao pedido</span>
                  <span>{moeda.format(Number(produtoSelecionado.price) * quantidade)}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {itemCount > 0 && cart && (
        <Link
          to="/client/Cart"
          className="flex shrink-0 items-center justify-between border-t border-orange-100 px-5 py-4 text-white shadow-[0_-8px_24px_rgba(95,55,20,0.1)]"
          style={{ backgroundColor: palette.light.accent }}
        >
          <span className="font-bold">Ver carrinho · {moeda.format(subtotal)}</span>
        </Link>
      )}
    </div>
  )
}

function ProdutoCard({
  produto,
  imagemFallback,
  aoSelecionar,
}: {
  produto: ProdutoPublico
  imagemFallback: string | null
  aoSelecionar: (produto: ProdutoPublico) => void
}) {
  return (
    <button
      type="button"
      onClick={() => aoSelecionar(produto)}
      className="min-w-36 max-w-40 shrink-0 rounded-2xl border border-orange-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
    >
      <img
        src={produto.image_url || imagemFallback || placeholderProduto}
        alt=""
        className="h-28 w-full shrink-0 rounded-xl bg-orange-50 object-cover"
      />
        <span className="min-w-0 flex-1 pt-2">
        <span className="block line-clamp-2 font-semibold leading-5 text-gray-900">{produto.name}</span>
        {/* {produto.description && <span className="mt-1 line-clamp-2 block text-sm text-gray-600">{produto.description}</span>} */}
        {/* <span className="mt-2 block font-bold">{moeda.format(Number(produto.price))}</span> */}
      </span>
      {/* <span className="shrink-0 text-sm font-semibold" style={{ color: palette.light.accent }}>Ver</span> */}
    </button>
  )
}
