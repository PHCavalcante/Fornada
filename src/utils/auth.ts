import { supabase } from './supabase'
import type { Profile, ProfileUpdate, SelfAssignableRole } from '../types/auth'
import type { Session } from '@supabase/supabase-js'

export const PASSWORD_MIN_LENGTH = 6

export class AuthError extends Error {}

const MENSAGENS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters.': `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  'Unable to validate email address: invalid format': 'E-mail inválido.',
  'Email signups are disabled': 'O cadastro por e-mail está desativado.',
  'Signup is disabled': 'O cadastro está desativado.',
  'Failed to fetch': 'Não foi possível conectar ao servidor. Verifique sua internet.',
}

export function traduzirErro(mensagem: string): string {
  return MENSAGENS[mensagem] ?? mensagem
}

export function mensagemDeErro(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export function validatePassword(senha: string, confirmacao?: string): string | null {
  if (senha.length < PASSWORD_MIN_LENGTH)
    return `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`
  if (confirmacao !== undefined && senha !== confirmacao) return 'As senhas não coincidem.'
  return null
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new AuthError(traduzirErro(error.message))
  return (data as Profile | null) ?? null
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new AuthError(traduzirErro(error.message))
  if (!data.session) throw new AuthError('Não foi possível iniciar a sessão.')
  return data.session
}

export interface SignUpInput {
  email: string
  password: string
  role: SelfAssignableRole
  fullName?: string
  phone?: string
}

export interface SignUpResult {
  session: Session | null
  confirmationRequired: boolean
}

export async function signUp({ email, password, role, fullName, phone }: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        role,
        ...(fullName ? { full_name: fullName } : {}),
        ...(phone ? { phone } : {}),
      },
    },
  })

  if (error) throw new AuthError(traduzirErro(error.message))

  // Sem sessão na resposta, o Supabase exigiu a confirmação por e-mail.
  return { session: data.session, confirmationRequired: data.session === null }
}

export async function updateProfile(patch: ProfileUpdate): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError('Sessão expirada. Faça login novamente.')

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw new AuthError(traduzirErro(error.message))
  return data as Profile
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new AuthError(traduzirErro(error.message))
}
