import { supabase } from './supabase'

export interface CategoriaCatalogo {
  id: string
  bakery_id: string
  name: string
  sort_order: number
}

export interface ProdutoCatalogo {
  id: string
  bakery_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
}

export interface ProdutoInput {
  category_id: string | null
  name: string
  description: string | null
  price: number
}

export async function buscarCatalogo(bakeryId: string) {
  const [categorias, produtos] = await Promise.all([
    supabase
      .from('categories')
      .select('id, bakery_id, name, sort_order')
      .eq('bakery_id', bakeryId)
      .order('sort_order')
      .order('name'),
    supabase
      .from('products')
      .select('id, bakery_id, category_id, name, description, price, image_url, is_available')
      .eq('bakery_id', bakeryId)
      .order('name'),
  ])

  if (categorias.error) throw new Error(categorias.error.message)
  if (produtos.error) throw new Error(produtos.error.message)

  return {
    categorias: (categorias.data ?? []) as CategoriaCatalogo[],
    produtos: (produtos.data ?? []) as ProdutoCatalogo[],
  }
}

export async function criarCategoria(bakeryId: string, name: string) {
  const { error } = await supabase.from('categories').insert({
    bakery_id: bakeryId,
    name,
  })

  if (error) throw new Error(error.message)
}

export async function salvarProduto(bakeryId: string, produto: ProdutoInput, produtoId?: string) {
  if (produtoId) {
    const { error } = await supabase
      .from('products')
      .update(produto)
      .eq('id', produtoId)
      .eq('bakery_id', bakeryId)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase.from('products').insert({
    ...produto,
    bakery_id: bakeryId,
  })
  if (error) throw new Error(error.message)
}

export async function atualizarDisponibilidadeProduto(
  bakeryId: string,
  produtoId: string,
  isAvailable: boolean,
) {
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', produtoId)
    .eq('bakery_id', bakeryId)

  if (error) throw new Error(error.message)
}
