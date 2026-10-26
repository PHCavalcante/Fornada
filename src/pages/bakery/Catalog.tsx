import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Menu from '../../components/Menu'
import { palette } from '../../theme'
import {
  atualizarDisponibilidadeProduto,
  buscarCatalogo,
  criarCategoria,
  salvarProduto,
  type CategoriaCatalogo,
  type ProdutoCatalogo,
} from '../../utils/catalog'
import { buscarPadariaDoProprietario } from '../../utils/bakeryWorkspace'
import logoFallback from '../../assets/logo.png'
import {
  BUCKET_IMAGENS_PRODUTOS,
  enviarImagemProduto,
  removerImagemPublica,
  validarImagem,
} from '../../utils/storageImages'

type FormularioProduto = {
  name: string
  description: string
  price: string
  category_id: string
  image_url: string
}

const FORMULARIO_VAZIO: FormularioProduto = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  image_url: '',
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Catalog() {
  const { profile } = useAuth()
  const [bakeryId, setBakeryId] = useState<string | null>(null)
  const [bakeryName, setBakeryName] = useState('')
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([])
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [nomeCategoria, setNomeCategoria] = useState('')
  const [formulario, setFormulario] = useState<FormularioProduto>(FORMULARIO_VAZIO)
  const [produtoEditado, setProdutoEditado] = useState<ProdutoCatalogo | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [imagemProduto, setImagemProduto] = useState<File | null>(null)
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!imagemProduto) {
      setImagemPreview(null)
      return
    }
    const url = URL.createObjectURL(imagemProduto)
    setImagemPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imagemProduto])

  const carregarCatalogo = useCallback(async (idPadaria: string) => {
    const dados = await buscarCatalogo(idPadaria)
    setCategorias(dados.categorias)
    setProdutos(dados.produtos)
  }, [])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        if (!profile?.id) return
        const padaria = await buscarPadariaDoProprietario(profile.id)
        if (!ativo) return
        if (!padaria) {
          setBakeryId(null)
          setBakeryName('')
          setCategorias([])
          setProdutos([])
          return
        }
        setBakeryId(padaria.id)
        setBakeryName(padaria.name)
        const dados = await buscarCatalogo(padaria.id)
        if (!ativo) return
        setCategorias(dados.categorias)
        setProdutos(dados.produtos)
      } catch (falha) {
        if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar o catálogo.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void carregar()
    return () => { ativo = false }
  }, [profile?.id])

  async function adicionarCategoria(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!bakeryId || !nomeCategoria.trim()) return

    setSalvando(true)
    setErro(null)
    try {
      await criarCategoria(bakeryId, nomeCategoria.trim())
      setNomeCategoria('')
      await carregarCatalogo(bakeryId)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível criar a categoria.')
    } finally {
      setSalvando(false)
    }
  }

  function abrirNovoProduto() {
    setProdutoEditado(null)
    setFormulario(FORMULARIO_VAZIO)
    setImagemProduto(null)
    setErro(null)
    setModalAberto(true)
  }

  function abrirEdicao(produto: ProdutoCatalogo) {
    setProdutoEditado(produto)
    setFormulario({
      name: produto.name,
      description: produto.description ?? '',
      price: String(produto.price),
      category_id: produto.category_id ?? '',
      image_url: produto.image_url ?? '',
    })
    setImagemProduto(null)
    setErro(null)
    setModalAberto(true)
  }

  async function submeterProduto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!bakeryId) return

    const preco = Number(formulario.price.replace(',', '.'))
    if (!formulario.name.trim()) {
      setErro('Informe o nome do produto.')
      return
    }
    if (!Number.isFinite(preco) || preco < 0) {
      setErro('Informe um preço válido, igual ou maior que zero.')
      return
    }

    setSalvando(true)
    setErro(null)
    let imagemEnviada: { path: string; publicUrl: string } | null = null
    let produtoSalvo = false
    try {
      let imageUrl = formulario.image_url || null
      if (imagemProduto) {
        imagemEnviada = await enviarImagemProduto(bakeryId, imagemProduto)
        imageUrl = imagemEnviada.publicUrl
      }
      await salvarProduto(bakeryId, {
        name: formulario.name.trim(),
        description: formulario.description.trim() || null,
        price: preco,
        category_id: formulario.category_id || null,
        image_url: imageUrl,
      }, produtoEditado?.id)
      produtoSalvo = true
      setImagemProduto(null)
      setModalAberto(false)
      if (imagemEnviada && produtoEditado?.image_url) {
        await removerImagemPublica(BUCKET_IMAGENS_PRODUTOS, produtoEditado.image_url).catch(() => undefined)
      }
      try {
        await carregarCatalogo(bakeryId)
      } catch {
        setErro('Produto salvo, mas não foi possível atualizar a lista. Recarregue a página para ver a alteração.')
      }
    } catch (falha) {
      if (imagemEnviada && !produtoSalvo) {
        await removerImagemPublica(BUCKET_IMAGENS_PRODUTOS, imagemEnviada.publicUrl).catch(() => undefined)
      }
      setErro(falha instanceof Error ? falha.message : 'Não foi possível salvar o produto.')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarDisponibilidade(produto: ProdutoCatalogo) {
    if (!bakeryId) return
    setErro(null)
    try {
      await atualizarDisponibilidadeProduto(bakeryId, produto.id, !produto.is_available)
      setProdutos((atuais) => atuais.map((item) =>
        item.id === produto.id ? { ...item, is_available: !item.is_available } : item,
      ))
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível atualizar a disponibilidade.')
    }
  }

  const grupos = categorias.map((categoria) => ({
    categoria,
    produtos: produtos.filter((produto) => produto.category_id === categoria.id),
  }))
  const semCategoria = produtos.filter((produto) => !categorias.some((categoria) => categoria.id === produto.category_id))

  return (
    <div className="flex min-h-screen">
      <Menu />
      <main className="flex w-full flex-col px-6 pb-10 sm:ml-8 sm:px-10 lg:ml-14.75 lg:mr-14.75">
        <header className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: palette.light.accent }}>Catálogo</h1>
            {bakeryName && <p className="mt-1 text-gray-600">{bakeryName}</p>}
          </div>
          {bakeryId && (
            <button
              type="button"
              onClick={abrirNovoProduto}
              className="rounded-lg px-4 py-3 font-bold text-white shadow-md"
              style={{ backgroundColor: palette.light.accent }}
            >
              Adicionar produto
            </button>
          )}
        </header>

        {erro && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}

        {carregando ? (
          <p className="mt-12 text-gray-600">Carregando catálogo...</p>
        ) : !bakeryId ? (
          <section className="mt-12 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Nenhuma padaria vinculada à sua conta</h2>
            <p className="mt-2 text-gray-600">Conclua o cadastro da padaria para começar a montar o catálogo.</p>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-lg bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Categorias</h2>
              <form onSubmit={(evento) => void adicionarCategoria(evento)} className="mt-3 flex flex-wrap gap-3">
                <label className="sr-only" htmlFor="nova-categoria">Nome da categoria</label>
                <input
                  id="nova-categoria"
                  value={nomeCategoria}
                  onChange={(evento) => setNomeCategoria(evento.target.value)}
                  placeholder="Ex.: Pães, Bolos, Salgados"
                  maxLength={80}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3"
                />
                <button
                  type="submit"
                  disabled={salvando || !nomeCategoria.trim()}
                  className="rounded-lg border border-gray-400 px-4 py-3 disabled:opacity-50"
                >
                  Criar categoria
                </button>
              </form>
              {categorias.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {categorias.map((categoria) => (
                    <li key={categoria.id} className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: palette.light.secondary }}>
                      {categoria.name}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Produtos ({produtos.length})</h2>
              {produtos.length === 0 ? (
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-bold">Seu catálogo ainda está vazio.</p>
                  <p className="mt-2 text-gray-600">Adicione o primeiro produto para começar.</p>
                  <button
                    type="button"
                    onClick={abrirNovoProduto}
                    className="mt-5 rounded-lg px-4 py-3 font-bold text-white"
                    style={{ backgroundColor: palette.light.accent }}
                  >
                    Adicionar produto
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {grupos.map(({ categoria, produtos: produtosDaCategoria }) => (
                    <GrupoProdutos
                      key={categoria.id}
                      titulo={categoria.name}
                      produtos={produtosDaCategoria}
                      aoEditar={abrirEdicao}
                      aoAlternar={(produto) => void alternarDisponibilidade(produto)}
                    />
                  ))}
                  {semCategoria.length > 0 && (
                    <GrupoProdutos
                      titulo="Sem categoria"
                      produtos={semCategoria}
                      aoEditar={abrirEdicao}
                      aoAlternar={(produto) => void alternarDisponibilidade(produto)}
                    />
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && !salvando) setModalAberto(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-form-produto" className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 id="titulo-form-produto" className="text-xl font-bold">
              {produtoEditado ? 'Editar produto' : 'Novo produto'}
            </h2>
            <form onSubmit={(evento) => void submeterProduto(evento)} className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1 font-medium">
                Nome
                <input
                  required
                  maxLength={120}
                  value={formulario.name}
                  onChange={(evento) => setFormulario({ ...formulario, name: evento.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 font-medium">
                Descrição <span className="font-normal text-gray-500">(opcional)</span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formulario.description}
                  onChange={(evento) => setFormulario({ ...formulario, description: evento.target.value })}
                  className="resize-y rounded-lg border border-gray-300 px-3 py-2 font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 font-medium">
                Preço (R$)
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={formulario.price}
                  onChange={(evento) => setFormulario({ ...formulario, price: evento.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 font-medium">
                Categoria
                <select
                  value={formulario.category_id}
                  onChange={(evento) => setFormulario({ ...formulario, category_id: evento.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal"
                >
                  <option value="">Sem categoria</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 font-medium">
                Foto do produto <span className="font-normal text-gray-500">(opcional)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(evento) => {
                    const arquivo = evento.currentTarget.files?.[0]
                    if (!arquivo) return
                    try {
                      validarImagem(arquivo)
                      setImagemProduto(arquivo)
                      setErro(null)
                      evento.currentTarget.value = ''
                    } catch (falha) {
                      setErro(falha instanceof Error ? falha.message : 'Arquivo de imagem inválido.')
                      evento.currentTarget.value = ''
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal"
                />
                <span className="text-xs font-normal text-gray-500">JPG, PNG ou WebP, até 5 MB.</span>
              </label>
              {(imagemPreview || formulario.image_url) && (
                <img
                  src={imagemPreview || formulario.image_url}
                  alt="Prévia da foto do produto"
                  className="h-32 w-32 rounded-lg border object-cover"
                />
              )}
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" disabled={salvando} onClick={() => { setModalAberto(false); setImagemProduto(null) }} className="rounded-lg px-4 py-2 text-gray-700 disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="rounded-lg px-4 py-2 font-bold text-white disabled:opacity-50" style={{ backgroundColor: palette.light.accent }}>
                  {salvando ? 'Salvando...' : 'Salvar produto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

function GrupoProdutos({
  titulo,
  produtos,
  aoEditar,
  aoAlternar,
}: {
  titulo: string
  produtos: ProdutoCatalogo[]
  aoEditar: (produto: ProdutoCatalogo) => void
  aoAlternar: (produto: ProdutoCatalogo) => void
}) {
  if (produtos.length === 0) return null

  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">{titulo}</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {produtos.map((produto) => (
          <article key={produto.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <img
                src={produto.image_url || logoFallback}
                alt={`Imagem de ${produto.name}`}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="wrap-break-word font-bold">{produto.name}</h4>
                  <span className="shrink-0 font-semibold">{moeda.format(produto.price)}</span>
                </div>
                {produto.description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{produto.description}</p>}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <span className={`text-sm ${produto.is_available ? 'text-green-700' : 'text-gray-500'}`}>
                {produto.is_available ? 'Disponível' : 'Indisponível'}
              </span>
              <div className="flex gap-3">
                <button type="button" onClick={() => aoEditar(produto)} className="text-sm font-semibold underline">
                  Editar
                </button>
                <button type="button" onClick={() => aoAlternar(produto)} className="text-sm font-semibold underline">
                  {produto.is_available ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
