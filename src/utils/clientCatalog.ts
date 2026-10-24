import { supabase } from './supabase'

export interface PadariaPublica {
  id: string
  name: string
  logo_url: string | null
  cover_url: string | null
  street: string
  adress_number: string
  neighborhood: string
  city: string
  avg_rating: number
  rating_count: number
  latitude: number | null
  longitude: number | null
  delivery_radius_km: number | null
  distance_km: number | null
}

export interface CategoriaPublica {
  id: string
  name: string
  sort_order: number
}

export interface ProdutoPublico {
  id: string
  bakery_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
}

function distanciaEmKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radianos = (graus: number) => (graus * Math.PI) / 180
  const dLat = radianos(lat2 - lat1)
  const dLon = radianos(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radianos(lat1)) * Math.cos(radianos(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function buscarPadariasAbertas(coordenadas: { lat: number; lng: number } | null) {
  const { data, error } = await supabase
    .from('bakeries')
    .select(`
      id, name, logo_url, cover_url, street, adress_number, neighborhood,
      city, avg_rating, rating_count, latitude, longitude, delivery_radius_km
    `)
    .eq('is_open', true)
    .order('name')

  if (error) throw new Error(error.message)

  const padarias = (data ?? []) as unknown as Omit<PadariaPublica, 'distance_km'>[]
  return padarias
    .map((padaria) => {
      const temPontos = coordenadas !== null && padaria.latitude !== null && padaria.longitude !== null
      const distancia = temPontos
        ? distanciaEmKm(coordenadas.lat, coordenadas.lng, padaria.latitude, padaria.longitude)
        : null
      return { ...padaria, distance_km: distancia }
    })
    .filter((padaria) => {
      if (padaria.distance_km === null || padaria.delivery_radius_km === null) return true
      return padaria.distance_km <= padaria.delivery_radius_km
    })
    .sort((a, b) => {
      if (a.distance_km === null) return b.distance_km === null ? a.name.localeCompare(b.name) : 1
      if (b.distance_km === null) return -1
      return a.distance_km - b.distance_km
    })
}

export async function buscarCatalogoPublico(bakeryId: string) {
  const [padaria, categorias, produtos] = await Promise.all([
    supabase
      .from('bakeries')
      .select(`
        id, name, description, logo_url, cover_url, street, adress_number,
        neighborhood, city, avg_rating, rating_count, is_open
      `)
      .eq('id', bakeryId)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('id, name, sort_order')
      .eq('bakery_id', bakeryId)
      .order('sort_order')
      .order('name'),
    supabase
      .from('products')
      .select('id, bakery_id, category_id, name, description, price, image_url, is_available')
      .eq('bakery_id', bakeryId)
      .eq('is_available', true)
      .order('name'),
  ])

  if (padaria.error) throw new Error(padaria.error.message)
  if (categorias.error) throw new Error(categorias.error.message)
  if (produtos.error) throw new Error(produtos.error.message)

  return {
    padaria: padaria.data,
    categorias: (categorias.data ?? []) as CategoriaPublica[],
    produtos: (produtos.data ?? []) as ProdutoPublico[],
  }
}
