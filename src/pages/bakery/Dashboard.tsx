import { useCallback, useEffect, useState } from 'react'
import Menu from '../../components/Menu'
import { useAuth } from '../../contexts/AuthContext'
import { palette } from '../../theme'
import { buscarResumoDashboard, type ResumoDashboardPadaria } from '../../utils/bakeryDashboard'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const { profile } = useAuth()
  const [resumo, setResumo] = useState<ResumoDashboardPadaria | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregarResumo = useCallback(async (silencioso = false) => {
    if (!profile?.id) return
    if (silencioso) setAtualizando(true)
    else setCarregando(true)
    setErro(null)
    try {
      setResumo(await buscarResumoDashboard(profile.id))
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar o dashboard.')
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [profile?.id])

  useEffect(() => {
    void carregarResumo()
  }, [carregarResumo])

  const metricas = resumo ? [
    {
      titulo: 'Faturamento de pedidos entregues',
      valor: moeda.format(resumo.faturamentoEntregue),
      descricao: 'Últimos 30 dias',
      destaque: true,
    },
    {
      titulo: 'Pedidos entregues',
      valor: String(resumo.pedidosEntregues),
      descricao: 'Últimos 30 dias',
    },
    {
      titulo: 'Pedidos em andamento',
      valor: String(resumo.pedidosEmAndamento),
      descricao: 'Aguardando ou em preparo/entrega',
    },
    {
      titulo: 'Pedidos cancelados',
      valor: String(resumo.pedidosCancelados),
      descricao: 'Últimos 30 dias',
    },
  ] : []

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <Menu />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 sm:px-6 lg:px-10 lg:pb-10">
        <header className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:mt-10">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: palette.light.accent }}>Dashboard</h1>
            {resumo && <p className="mt-1 text-gray-600">{resumo.padariaNome}</p>}
            {profile && <p className="mt-2 text-gray-700">Bem-vindo, {profile.full_name}</p>}
          </div>
          <button
            type="button"
            onClick={() => void carregarResumo(true)}
            disabled={atualizando || carregando}
            className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50"
          >
            {atualizando ? 'Atualizando...' : 'Atualizar dados'}
          </button>
        </header>

        {erro && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}

        {carregando ? (
          <p className="mt-10 text-gray-600">Carregando dados...</p>
        ) : !resumo ? (
          <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-bold">Nenhuma padaria vinculada à sua conta</h2>
            <p className="mt-2 text-gray-600">Conclua o cadastro da padaria para ver os indicadores.</p>
          </section>
        ) : (
          <>
            <p className="mt-8 text-sm text-gray-600">
              Entregas e cancelamentos consideram a data da mudança de status. Pedidos cancelados não entram no faturamento.
            </p>
            <section aria-label="Resumo dos pedidos" className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {metricas.map((metrica) => (
                <article
                  key={metrica.titulo}
                  className="flex min-h-36 flex-col justify-between rounded-xl p-5 text-white shadow-[0px_4px_4px_0px_#00000030]"
                  style={{ backgroundColor: metrica.destaque ? palette.light.accent : palette.light.primary }}
                >
                  <h2 className="font-semibold">{metrica.titulo}</h2>
                  <p className="mt-3 text-3xl font-bold">{metrica.valor}</p>
                  <p className="mt-2 text-sm text-white/90">{metrica.descricao}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
