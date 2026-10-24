import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ProdutoPublico } from '../utils/clientCatalog'

export interface ItemCarrinho {
  product_id: string
  name: string
  description: string | null
  unit_price: number
  image_url: string | null
  quantity: number
}

export interface Carrinho {
  bakery_id: string
  bakery_name: string
  bakery_logo_url?: string | null
  items: ItemCarrinho[]
}

interface CartContextType {
  cart: Carrinho | null
  itemCount: number
  subtotal: number
  adicionarProduto: (padaria: { id: string; name: string; logo_url: string | null }, produto: ProdutoPublico, quantity?: number) => boolean
  alterarQuantidade: (productId: string, quantity: number) => void
  removerProduto: (productId: string) => void
  limparCarrinho: () => void
}

const CHAVE_CARRINHO = 'tcc:carrinho-cliente:v1'
const CartContext = createContext<CartContextType | null>(null)

function lerCarrinho(): Carrinho | null {
  try {
    const conteudo = localStorage.getItem(CHAVE_CARRINHO)
    if (!conteudo) return null
    const valor: unknown = JSON.parse(conteudo)
    if (
      typeof valor !== 'object' || valor === null ||
      !('bakery_id' in valor) || typeof valor.bakery_id !== 'string' ||
      !('bakery_name' in valor) || typeof valor.bakery_name !== 'string' ||
      !('items' in valor) || !Array.isArray(valor.items)
    ) return null
    return valor as Carrinho
  } catch {
    return null
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Carrinho | null>(lerCarrinho)

  useEffect(() => {
    try {
      if (cart) localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(cart))
      else localStorage.removeItem(CHAVE_CARRINHO)
    } catch {
      // O carrinho continua disponível na sessão atual mesmo sem armazenamento local.
    }
  }, [cart])

  const adicionarProduto: CartContextType['adicionarProduto'] = (padaria, produto, quantity = 1) => {
    if (cart && cart.bakery_id !== padaria.id) return false
    setCart((atual) => {
      const base = atual ?? { bakery_id: padaria.id, bakery_name: padaria.name, bakery_logo_url: padaria.logo_url, items: [] }
      const existente = base.items.find((item) => item.product_id === produto.id)
      const items = existente
        ? base.items.map((item) => item.product_id === produto.id
          ? { ...item, quantity: item.quantity + quantity }
          : item)
        : [...base.items, {
          product_id: produto.id,
          name: produto.name,
          description: produto.description,
          unit_price: Number(produto.price),
          image_url: produto.image_url,
          quantity,
        }]
      return { ...base, bakery_name: padaria.name, bakery_logo_url: padaria.logo_url, items }
    })
    return true
  }

  const alterarQuantidade = (productId: string, quantity: number) => {
    setCart((atual) => {
      if (!atual) return atual
      if (quantity <= 0) {
        const items = atual.items.filter((item) => item.product_id !== productId)
        return items.length ? { ...atual, items } : null
      }
      return {
        ...atual,
        items: atual.items.map((item) => item.product_id === productId ? { ...item, quantity } : item),
      }
    })
  }

  const removerProduto = (productId: string) => {
    setCart((atual) => {
      if (!atual) return null
      const items = atual.items.filter((item) => item.product_id !== productId)
      return items.length ? { ...atual, items } : null
    })
  }

  const limparCarrinho = () => setCart(null)

  const value = {
    cart,
    itemCount: cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    subtotal: cart?.items.reduce((total, item) => total + item.unit_price * item.quantity, 0) ?? 0,
    adicionarProduto,
    alterarQuantidade,
    removerProduto,
    limparCarrinho,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
