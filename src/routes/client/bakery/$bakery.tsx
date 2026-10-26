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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative shrink-0">
        <ClientHeader title="" turnAbsolute={true} />
        <div className="h-36 w-full bg-amber-100 sm:h-48">
          {padaria?.cover_url && <img src={padaria.cover_url} alt="" className="h-full w-full object-cover" />}
        </div>
        {padaria?.logo_url && (
          <img src={padaria.logo_url ?? "https://files.catbox.moe/bkdtqw.png"} alt="" className="absolute -bottom-6 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full" />
        )}
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {carregando ? (
          <p className="py-14 text-center text-gray-600">Carregando catálogo...</p>
        ) : erro ? (
          <p role="alert" className="py-12 text-center text-red-700">{erro}</p>
        ) : !padaria ? (
          <p className="py-12 text-center text-gray-600">Esta padaria não foi encontrada.</p>
        ) : (
          <>
            <header className={`pt-8 text-center ${padaria.logo_url ? 'mt-4' : ''}`}>
              <h1 className="text-xl font-bold">{padaria.name}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {padaria.street}, {padaria.adress_number} · {padaria.neighborhood}, {padaria.city}
              </p>
              {padaria.rating_count > 0 && (
                <p className="mt-2 text-sm text-gray-600">★ {Number(padaria.avg_rating).toFixed(1)} ({padaria.rating_count} avaliações)</p>
              )}
              {!padaria.is_open && <p className="mt-2 font-semibold text-red-700">Fechada no momento</p>}
              {padaria.description && <p className="mx-auto mt-3 max-w-lg text-sm text-gray-600">{padaria.description}</p>}
            </header>

            {produtos.length === 0 ? (
              <p className="py-12 text-center text-gray-600">Esta padaria ainda não possui produtos disponíveis.</p>
            ) : (
              <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-8">
                {grupos.map(({ categoria, produtos: produtosDaCategoria }) => produtosDaCategoria.length > 0 && (
                  <section key={categoria.id}>
                    <h2 className="mb-3 text-lg font-bold">{categoria.name}</h2>
                    <div className="flex gap-3">
                      {produtosDaCategoria.map((produto) => (
                        <ProdutoCard key={produto.id} produto={produto} imagemFallback={padaria.logo_url} aoSelecionar={abrirProduto} />
                      ))}
                    </div>
                  </section>
                ))}
                {semCategoria.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-lg font-bold">Outros produtos</h2>
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
        <p role="status" className="fixed bottom-20 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm text-white shadow-lg">
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
            className="relative flex h-full max-h-full w-full max-w-none flex-col overflow-hidden rounded-none bg-white"
          >
            <button
              type="button"
              onClick={() => setProdutoSelecionado(null)}
              aria-label="Fechar detalhes do produto"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl shadow"
            >
              ×
            </button>
            <img
              src={produtoSelecionado.image_url || padaria.cover_url || padaria.logo_url || placeholderProduto}
              alt={produtoSelecionado.name}
              className="h-[45dvh] min-h-64 w-full shrink-0 bg-amber-50 object-cover"
            />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
              <h2 id="titulo-detalhe-produto" className="text-xl font-bold">{produtoSelecionado.name}</h2>
              {produtoSelecionado.description && <p className="mt-2 text-sm text-gray-600">{produtoSelecionado.description}</p>}
              <p className="mt-4 text-lg font-bold">{moeda.format(Number(produtoSelecionado.price))}</p>

              <div className="mt-auto pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold">Quantidade</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantidade((atual) => Math.max(1, atual - 1))}
                      aria-label="Diminuir quantidade"
                      className="h-9 w-9 rounded-full border text-lg"
                    >−</button>
                    <span aria-live="polite" className="min-w-5 text-center">{quantidade}</span>
                    <button
                      type="button"
                      onClick={() => setQuantidade((atual) => atual + 1)}
                      aria-label="Aumentar quantidade"
                      className="h-9 w-9 rounded-full border text-lg"
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
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-50"
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
          className="flex shrink-0 items-center justify-between px-5 py-4 text-white"
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
      className="flex flex-col items-center"
    >
      <img
        src={produto.image_url || imagemFallback || placeholderProduto}
        alt=""
        className="h-20 w-20 shrink-0 rounded-lg bg-amber-50 object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{produto.name}</span>
        {/* {produto.description && <span className="mt-1 line-clamp-2 block text-sm text-gray-600">{produto.description}</span>} */}
        {/* <span className="mt-2 block font-bold">{moeda.format(Number(produto.price))}</span> */}
      </span>
      {/* <span className="shrink-0 text-sm font-semibold" style={{ color: palette.light.accent }}>Ver</span> */}
    </button>
  )
}
