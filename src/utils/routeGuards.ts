import { redirect } from '@tanstack/react-router'
import type { UserRole } from '../types/auth'
import { fetchProfile } from './auth'
import { supabase } from './supabase'

export const HOME_POR_ROLE = {
  customer: '/',
  owner: '/bakery/Dashboard',
  admin: '/',
} as const satisfies Record<UserRole, string>

export const LOGIN_CLIENT = '/client/Login'
export const LOGIN_BAKERY = '/bakery/Login'

function homeDoUsuario(role: UserRole | null | undefined) {
  return role ? HOME_POR_ROLE[role] : ('/' as const)
}

async function sessaoEProfile() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return { session: null, profile: null }
  const profile = await fetchProfile(data.session.user.id).catch(() => null)
  return { session: data.session, profile }
}

/**
 * Protege uma rota: exige sessão ativa e um dos papéis informados.
 * Sem sessão redireciona para a tela de login; com papel incompatível vai para a home do papel.
 */
export async function requireRole(roles: UserRole[], loginPath: typeof LOGIN_CLIENT | typeof LOGIN_BAKERY) {
  const { session, profile } = await sessaoEProfile()

  if (!session) throw redirect({ to: loginPath })

  if (!profile) throw redirect({ to: loginPath })

  if (!roles.includes(profile.role))
    throw redirect({ to: homeDoUsuario(profile?.role) })

  return profile
}

/** Usado nas telas de login/cadastro: quem já tem sessão não precisa delas. */
export async function redirectIfAuthenticated() {
  const { session, profile } = await sessaoEProfile()
  if (session && profile) throw redirect({ to: homeDoUsuario(profile.role) })
}
