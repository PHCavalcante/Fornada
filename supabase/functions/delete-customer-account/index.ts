import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function responder(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return responder({ error: 'Método não permitido.' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return responder({ error: 'Sessão necessária.' }, 401)
  const accessToken = authorization.slice('Bearer '.length)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')
    ?? JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}').default
  const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    ?? JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default

  if (!supabaseUrl || !publishableKey || !secretKey) {
    console.error('Variáveis padrão do Supabase indisponíveis na Edge Function.')
    return responder({ error: 'Serviço de exclusão não está configurado.' }, 500)
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  })
  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: { user }, error: erroSessao } = await userClient.auth.getUser(accessToken)
  if (erroSessao || !user) return responder({ error: 'Sessão inválida ou expirada. Entre novamente.' }, 401)

  const { data: profile, error: erroPerfil } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (erroPerfil) {
    console.error('Falha ao consultar perfil para exclusão:', erroPerfil.message)
    return responder({ error: 'Não foi possível validar a conta.' }, 500)
  }
  if (profile?.role !== 'customer') {
    return responder({ error: 'Esta opção está disponível apenas para contas de cliente.' }, 403)
  }

  const { error: erroLimpeza } = await adminClient.rpc('delete_customer_account_data', {
    target_user_id: user.id,
  })
  if (erroLimpeza) {
    console.error('Falha ao remover dados do cliente:', erroLimpeza.message)
    return responder({ error: 'Não foi possível remover os dados da conta. Nenhuma exclusão foi concluída.' }, 500)
  }

  const { error: erroExclusao } = await adminClient.auth.admin.deleteUser(user.id)
  if (erroExclusao) {
    console.error('Falha ao excluir usuário do Auth após limpeza dos dados:', erroExclusao.message)
    return responder({ error: 'Os dados do perfil foram removidos, mas a conta de acesso não. Entre em contato com o suporte.' }, 500)
  }

  return responder({ success: true })
})
