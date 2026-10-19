import type { CadastroBakery } from '../types/bakery'
import { supabase } from './supabase'
import { validatePassword } from './auth'

const CHAVE_PENDENTE = 'tcc:cadastro-padaria-pendente'

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

export async function criarBakery(ownerId: string, form: CadastroBakery) {
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

/**
 * Quando o Supabase exige confirmação de e-mail, não há sessão para cadastrar a padaria.
 * Guardamos os dados (sem a senha) para concluir o cadastro no primeiro login.
 */
export function salvarCadastroPendente(form: CadastroBakery) {
  const { password: _password, confirmPassword: _confirmPassword, ...dados } = form
  localStorage.setItem(CHAVE_PENDENTE, JSON.stringify(dados))
}

export function lerCadastroPendente(): Omit<CadastroBakery, 'password' | 'confirmPassword'> | null {
  const bruto = localStorage.getItem(CHAVE_PENDENTE)
  if (!bruto) return null

  try {
    return JSON.parse(bruto)
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
  const dados = lerCadastroPendente()
  if (!dados) return false

  await criarBakery(ownerId, { ...dados, password: '', confirmPassword: '' })
  limparCadastroPendente()
  return true
}
