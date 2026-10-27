import { supabase } from './supabase'

export interface DadosPadariaGerencia {
  id: string
  owner_id: string
  name: string
  cnpj: string
  email: string
  phone_or_whatsapp: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  cep: string
  street: string
  adress_number: string
  complement: string | null
  neighborhood: string
  city: string
  latitude: number | null
  longitude: number | null
  opens_at: string | null
  closes_at: string | null
  is_open: boolean
  delivery_radius_km: number | null
  estimated_delivery_minutes: number | null
  pix_key: string | null
  min_order_value: number | null
  delivery_fee: number | null
}

export type AtualizacaoPadaria = Omit<DadosPadariaGerencia, 'id' | 'owner_id'>

export async function buscarDadosDaPadaria(ownerId: string) {
  const { data, error } = await supabase
    .from('bakeries')
    .select(`
      id, owner_id, name, cnpj, email, phone_or_whatsapp, description,
      logo_url, cover_url, cep, street, adress_number, complement,
      neighborhood, city, opens_at, closes_at, is_open,
      latitude, longitude,
      delivery_radius_km, estimated_delivery_minutes, pix_key,
      min_order_value, delivery_fee
    `)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as unknown as DadosPadariaGerencia | null
}

export async function atualizarDadosDaPadaria(ownerId: string, padariaId: string, dados: AtualizacaoPadaria) {
  const { error } = await supabase
    .from('bakeries')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('id', padariaId)
    .eq('owner_id', ownerId)
    .select('id')
    .single()

  if (error) throw new Error(error.message)
}
