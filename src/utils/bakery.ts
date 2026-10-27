import type { CadastroBakery } from '../types/bakery'
import { supabase } from './supabase'
import { validatePassword } from './auth'

const CHAVE_PENDENTE = 'tcc:cadastro-padaria-pendente'
let filaNominatim: Promise<void> = Promise.resolve()
let ultimaConsultaNominatim = 0

function soDigitos(valor: string) {
  return valor.replace(/\D/g, '')
}

function paraHorario(valor: string): string | null {
  if (!valor) return null
  // Aceita "8:00" e "08:00" e normaliza para o formato time do Postgres.
  const partes = valor.split(':')
  if (partes.length < 2) return null
  const hora = Number(partes[0])
  const minuto = Number(partes[1])
  if (Number.isNaN(hora) || Number.isNaN(minuto)) return null
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`
}

function paraNumero(valor: string): number | null {
  const limpo = valor.replace(',', '.').trim()
  if (!limpo) return null
  const numero = Number(limpo)
  return Number.isNaN(numero) ? null : numero
}

function paraInteiro(valor: string): number | null {
  const numero = paraNumero(valor)
  return numero === null ? null : Math.trunc(numero)
}

export function validarStep(step: number, form: CadastroBakery): string | null {
  if (step === 0) {
    if (!form.name.trim()) return 'Informe o nome da padaria.'
    if (soDigitos(form.cnpj).length !== 14) return 'CNPJ deve ter 14 dígitos.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Informe um e-mail válido.'
    if (!form.phone.trim()) return 'Informe um telefone ou WhatsApp.'
    return validatePassword(form.password, form.confirmPassword)
  }

  if (step === 1) {
    if (soDigitos(form.cep).length !== 8) return 'CEP deve ter 8 dígitos.'
    if (!form.street.trim()) return 'Informe a rua.'
    if (!form.adress_number.trim()) return 'Informe o número do endereço.'
    if (!form.neighborhood.trim()) return 'Informe o bairro.'
    if (!form.city.trim()) return 'Informe a cidade.'
  }

  return null
}

/**
 * Checado antes do signup: evita criar uma conta de dono sem padaria
 * quando o CNPJ informado já existe.
 */
export async function cnpjDisponivel(cnpj: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bakeries')
    .select('id')
    .eq('cnpj', soDigitos(cnpj))
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data === null
}

export async function padariaDoProprietarioExiste(ownerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bakeries')
    .select('id')
    .eq('owner_id', ownerId)
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data !== null
}

export async function criarBakery(
  ownerId: string,
  form: CadastroBakery,
  coordenadasInformadas?: { lat: number; lng: number },
) {
  const coordenadas = coordenadasInformadas ?? await geocodificarEnderecoPadaria(form)
  const { data, error } = await supabase
    .from('bakeries')
    .insert({
      owner_id: ownerId,
      name: form.name.trim(),
      cnpj: soDigitos(form.cnpj),
      email: form.email.trim(),
      phone_or_whatsapp: form.phone.trim(),
      description: form.description.trim() || null,
      cep: soDigitos(form.cep),
      street: form.street.trim(),
      adress_number: form.adress_number.trim(),
      complement: form.complement.trim() || null,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      latitude: coordenadas.lat,
      longitude: coordenadas.lng,
      opens_at: paraHorario(form.opens_at),
      closes_at: paraHorario(form.closes_at),
      delivery_radius_km: paraNumero(form.delivery_radius_km),
      estimated_delivery_minutes: paraInteiro(form.estimated_delivery_minutes),
      pix_key: form.pix_key.trim() || null,
      min_order_value: paraNumero(form.min_order_value),
      delivery_fee: paraNumero(form.delivery_fee),
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Já existe uma padaria cadastrada com este CNPJ.')
    throw new Error(error.message)
  }

  return data
}

export async function geocodificarEnderecoPadaria(form: Pick<CadastroBakery, 'cep' | 'street' | 'adress_number' | 'neighborhood' | 'city'>) {
  const consulta = [
    `${form.street.trim()} ${form.adress_number.trim()}`,
    form.neighborhood.trim(),
    form.city.trim(),
    soDigitos(form.cep),
    'Brasil',
  ].filter(Boolean).join(', ')
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.search = new URLSearchParams({
    q: consulta,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'br',
    'accept-language': 'pt-BR',
  }).toString()

  const consultaAnterior = filaNominatim
  let liberarConsulta!: () => void
  filaNominatim = new Promise<void>((resolve) => { liberarConsulta = resolve })
  await consultaAnterior
  const intervalo = 1000 - (Date.now() - ultimaConsultaNominatim)
  if (intervalo > 0) await new Promise((resolve) => window.setTimeout(resolve, intervalo))

  let resposta: Response
  try {
    ultimaConsultaNominatim = Date.now()
    resposta = await fetch(url, { headers: { Accept: 'application/json' } })
  } finally {
    liberarConsulta()
  }
  if (!resposta.ok) throw new Error('Não foi possível localizar o endereço da padaria. Confira os dados e tente novamente.')
  const resultados: unknown = await resposta.json()
  if (!Array.isArray(resultados) || resultados.length === 0) {
    throw new Error('Não encontramos esse endereço no mapa. Confira rua, número, bairro e cidade.')
  }

  const latitude = Number(resultados[0]?.lat)
  const longitude = Number(resultados[0]?.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('O mapa retornou uma localização inválida. Confira o endereço e tente novamente.')
  }
  return { lat: latitude, lng: longitude }
}

/**
 * Quando o Supabase exige confirmação de e-mail, não há sessão para cadastrar a padaria.
 * Guardamos os dados (sem a senha) para concluir o cadastro no primeiro login.
 */
export function salvarCadastroPendente(form: CadastroBakery, coordenadas: { lat: number; lng: number }) {
  const { password: _password, confirmPassword: _confirmPassword, ...dados } = form
  localStorage.setItem(CHAVE_PENDENTE, JSON.stringify({ dados, coordenadas }))
}

export function lerCadastroPendente(): {
  dados: Omit<CadastroBakery, 'password' | 'confirmPassword'>
  coordenadas: { lat: number; lng: number } | null
} | null {
  const bruto = localStorage.getItem(CHAVE_PENDENTE)
  if (!bruto) return null

  try {
    const salvo = JSON.parse(bruto)
    if (salvo?.dados && typeof salvo.dados === 'object') {
      return { dados: salvo.dados, coordenadas: salvo.coordenadas ?? null }
    }
    // Compatibilidade com cadastros pendentes salvos antes da geocodificação.
    return { dados: salvo, coordenadas: null }
  } catch {
    localStorage.removeItem(CHAVE_PENDENTE)
    return null
  }
}

export function limparCadastroPendente() {
  localStorage.removeItem(CHAVE_PENDENTE)
}

/** Usa o cadastro guardado no wizard para criar a padaria depois da confirmação de e-mail. */
export async function concluirCadastroPendente(ownerId: string) {
  const pendente = lerCadastroPendente()
  if (!pendente) return false

  await criarBakery(ownerId, { ...pendente.dados, password: '', confirmPassword: '' }, pendente.coordenadas ?? undefined)
  limparCadastroPendente()
  return true
}
