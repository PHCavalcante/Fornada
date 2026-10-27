import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile, ProfileUpdate, UserRole } from '../types/auth'
import { supabase } from '../utils/supabase'
import { palette } from '../theme'
import { concluirCadastroPendente } from '../utils/bakery'
import {
  fetchProfile,
  signInWithPassword,
  signOut as supabaseSignOut,
  signUp as supabaseSignUp,
  updateProfile as supabaseUpdateProfile,
  type SignUpInput,
  type SignUpResult,
} from '../utils/auth'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<Profile>
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signOut: () => Promise<void>
  updateProfile: (patch: ProfileUpdate) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const carregarProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null)
      return null
    }
    try {
      const novoProfile = await fetchProfile(userId)
      setProfile(novoProfile)
      return novoProfile
    } catch {
      setProfile(null)
      return null
    }
  }, [])

  const aplicarSessao = useCallback(
    async (novaSessao: Session | null): Promise<Profile | null> => {
      setSession(novaSessao)
      return carregarProfile(novaSessao?.user.id)
    },
    [carregarProfile],
  )

  useEffect(() => {
    let ativo = true

    // onAuthStateChange é chamado dentro do lock de auth do Supabase:
    // por isso o fetch do profile fica em um macrotask separado.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      if (!ativo) return
      setSession(novaSessao)
      setLoading(false)
      setTimeout(() => {
        if (ativo) void carregarProfile(novaSessao?.user.id)
      }, 0)
    })

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return
      setSession(data.session)
      setLoading(false)
      void carregarProfile(data.session?.user.id)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [carregarProfile])

  // Cadastro de padaria iniciado no wizard antes da confirmação de e-mail:
  // é concluído aqui, por onde toda sessão nova passa (link de confirmação,
  // login manual ou restauração de sessão).
  const processandoPendente = useRef(false)

  useEffect(() => {
    if (!profile || profile.role !== 'owner' || processandoPendente.current) return

    processandoPendente.current = true
    concluirCadastroPendente(profile.id)
      .catch((erro: unknown) => {
        console.warn('Não foi possível concluir o cadastro da padaria pendente.', erro)
        processandoPendente.current = false
      })
  }, [profile])

  const signIn = useCallback(
    async (email: string, password: string): Promise<Profile> => {
      const novaSessao = await signInWithPassword(email, password)
      const perfil = await aplicarSessao(novaSessao)
      if (!perfil) throw new Error('A conta entrou, mas o perfil não foi encontrado. Contate o suporte.')
      return perfil
    },
    [aplicarSessao],
  )

  const signUp = useCallback(
    async (input: SignUpInput): Promise<SignUpResult> => {
      const resultado = await supabaseSignUp(input)
      if (resultado.session) {
        const novoPerfil = await aplicarSessao(resultado.session)
        if (!novoPerfil) throw new Error('A conta foi criada, mas o perfil não apareceu. Verifique o trigger de criação de perfil no Supabase.')
        if (novoPerfil.role !== input.role) throw new Error('O perfil criado tem um tipo de conta inesperado.')
      }
      return resultado
    },
    [aplicarSessao],
  )

  const signOut = useCallback(async () => {
    await supabaseSignOut()
    await aplicarSessao(null)
  }, [aplicarSessao])

  const updateProfile = useCallback(async (patch: ProfileUpdate) => {
    const atualizado = await supabaseUpdateProfile(patch)
    setProfile(atualizado)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role: profile?.role ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {loading ? (
        <div
          className="flex h-screen w-full items-center justify-center"
          style={{ backgroundColor: palette.light.background }}
        >
          <p className="text-gray-600">Carregando...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
