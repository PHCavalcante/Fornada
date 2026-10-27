import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import ClientHeader from '../../components/ClientHeader'
import ClientMenu from '../../components/ClientMenu'
import profileImagePlaceholder from '../../assets/profile.svg'
import arrow from '../../assets/arrow.svg'
import trash from '../../assets/trash.svg'
import { palette } from '../../theme'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useLocalizacao } from '../../utils/GetLocation'
import { supabase } from '../../utils/supabase'

type ProfileSection = 'personal' | 'delivery' | 'privacy' | 'delete' | null

export default function Profile() {
  const navigate = useNavigate()
  const { profile, user, updateProfile } = useAuth()
  const { limparCarrinho } = useCart()
  const {
    enderecoCompleto, origem, cepSalvo, coordenadas, erro: erroLocalizacao,
    carregando: carregandoLocalizacao, pegarLocalizacao, buscarCep, limparLocalizacao,
  } = useLocalizacao()
  const [secao, setSecao] = useState<ProfileSection>(null)
  const [nome, setNome] = useState(profile?.full_name ?? '')
  const [telefone, setTelefone] = useState(profile?.phone ?? '')
  const [cep, setCep] = useState(cepSalvo ?? '')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [apagandoConta, setApagandoConta] = useState(false)
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    setNome(profile?.full_name ?? '')
    setTelefone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone])

  useEffect(() => setCep(cepSalvo ?? ''), [cepSalvo])

  async function salvarDadosPessoais(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    setMensagem(null)
    setSalvandoPerfil(true)
    try {
      await updateProfile({ full_name: nome.trim(), phone: telefone.trim() || null })
      setMensagem('Seus dados foram atualizados.')
      setSecao(null)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível atualizar seus dados.')
    } finally {
      setSalvandoPerfil(false)
    }
  }

  async function salvarCep(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    if (await buscarCep(cep)) setMensagem('Localização atualizada neste dispositivo.')
  }

  async function excluirConta() {
    if (confirmacaoExclusao !== 'EXCLUIR') return
    setErro(null)
    setApagandoConta(true)
    try {
      const { error: erroFuncao } = await supabase.functions.invoke('delete-customer-account', { body: {} })
      if (erroFuncao) throw erroFuncao
      limparLocalizacao()
      limparCarrinho()
      await supabase.auth.signOut({ scope: 'local' })
      await navigate({ to: '/client/Login', replace: true })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível excluir a conta. Tente novamente.')
      setApagandoConta(false)
    }
  }

  const botoes: { id: Exclude<ProfileSection, 'delete' | null>; titulo: string; descricao: string; icone: string }[] = [
    { id: 'personal', titulo: 'Dados pessoais', descricao: 'Nome, telefone e e-mail da conta', icone: '01' },
    { id: 'delivery', titulo: 'Dados de entrega', descricao: 'Localização salva neste dispositivo', icone: '02' },
    { id: 'privacy', titulo: 'Privacidade e termos', descricao: 'Como os dados são usados e direitos do titular', icone: '03' },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffaf5]">
      <ClientHeader title="Meu perfil" />
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50">
              <img src={profile?.avatar_url || profileImagePlaceholder} width={40} height={40} alt="Foto do perfil" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Olá,</p>
              <h2 className="truncate text-xl font-bold text-gray-900">{profile?.full_name || 'Cliente'}</h2>
              <p className="truncate text-sm text-gray-500">{user?.email}</p>
            </div>
          </section>

          {mensagem && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{mensagem}</p>}
          {erro && !secao && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

          <section aria-label="Configurações do perfil" className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-orange-100">
            {botoes.map((item, indice) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setErro(null); setMensagem(null); setSecao(item.id) }}
                className={`flex w-full items-center gap-4 px-4 py-5 text-left transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${indice ? 'border-t border-orange-100' : ''}`}
              >
                {/* <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-sm font-bold text-orange-800">{item.icone}</span> */}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900">{item.titulo}</span>
                  <span className="mt-1 block text-sm text-gray-500">{item.descricao}</span>
                </span>
                <img src={arrow} alt="" className="h-4 w-3 opacity-60" />
              </button>
            ))}
          </section>

          {profile?.role === 'customer' && (
            <section className="flex flex-col rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Zona de segurança</h2>
              <p className="mt-1 text-sm leading-5 text-gray-600">A exclusão remove seu acesso e os dados da conta associados.</p>
              <button
                type="button"
                onClick={() => { setErro(null); setConfirmacaoExclusao(''); setSecao('delete') }}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Excluir minha conta <img src={trash} alt="" className="h-4 w-4" />
              </button>
            </section>
          )}
        </div>
      </main>
      <ClientMenu />

      {secao && (
        <div className="dialog-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setSecao(null) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-secao-perfil" className="dialog-panel max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Minha conta</p>
                <h2 id="titulo-secao-perfil" className="mt-1 text-xl font-bold text-gray-900">
                  {secao === 'personal' ? 'Dados pessoais' : secao === 'delivery' ? 'Dados de entrega' : secao === 'privacy' ? 'Privacidade e termos' : 'Excluir conta'}
                </h2>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setSecao(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200">×</button>
            </div>

            {secao === 'personal' && (
              <form onSubmit={(evento) => void salvarDadosPessoais(evento)} className="mt-5 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Nome completo
                  <input required maxLength={120} value={nome} onChange={(evento) => setNome(evento.target.value)} className="h-11 rounded-xl border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Telefone <span className="font-normal text-gray-500">(opcional)</span>
                  <input type="tel" autoComplete="tel" maxLength={30} value={telefone} onChange={(evento) => setTelefone(evento.target.value)} className="h-11 rounded-xl border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </label>
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-gray-700">E-mail de acesso</span>
                  <p className="rounded-xl bg-gray-50 px-3 py-3 text-gray-600">{user?.email || 'E-mail indisponível'}</p>
                  <span className="text-xs text-gray-500">A alteração de e-mail não está disponível nesta versão.</span>
                </div>
                {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
                <button type="submit" disabled={salvandoPerfil} className="mt-1 h-11 rounded-xl px-4 font-semibold text-white disabled:opacity-60" style={{ backgroundColor: palette.light.accent }}>{salvandoPerfil ? 'Salvando...' : 'Salvar alterações'}</button>
              </form>
            )}

            {secao === 'delivery' && (
              <div className="mt-5 flex flex-col gap-4">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-gray-800">Localização atual</p>
                  <p className="mt-2 break-words text-sm leading-6 text-gray-700">{enderecoCompleto || 'Nenhuma localização salva neste dispositivo.'}</p>
                  {origem && <p className="mt-2 text-xs text-gray-500">Informada por {origem === 'gps' ? 'GPS' : 'CEP'}{origem === 'cep' ? ' (aproximada)' : ''}.</p>}
                  {origem === 'gps' && coordenadas && <p className="mt-1 text-xs text-gray-500">Coordenadas usadas para buscar padarias próximas.</p>}
                </div>
                <button type="button" disabled={carregandoLocalizacao} onClick={() => void pegarLocalizacao()} className="h-11 rounded-xl border border-gray-300 px-4 font-semibold text-gray-800 disabled:opacity-60">
                  {carregandoLocalizacao ? 'Obtendo localização...' : 'Usar localização do dispositivo'}
                </button>
                <form onSubmit={(evento) => void salvarCep(evento)} className="flex flex-col gap-3">
                  <label htmlFor="profile-cep" className="text-sm font-medium text-gray-700">Ou informar um CEP</label>
                  <div className="flex gap-2">
                    <input id="profile-cep" inputMode="numeric" autoComplete="postal-code" maxLength={8} placeholder="00000000" value={cep} onChange={(evento) => setCep(evento.target.value.replace(/\D/g, '').slice(0, 8))} className="h-11 min-w-0 flex-1 rounded-xl border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                    <button type="submit" disabled={carregandoLocalizacao || cep.replace(/\D/g, '').length !== 8} className="h-11 rounded-xl px-4 font-semibold text-white disabled:opacity-50" style={{ backgroundColor: palette.light.accent }}>Salvar CEP</button>
                  </div>
                </form>
                {erroLocalizacao && <p role="alert" className="text-sm text-red-700">{erroLocalizacao}</p>}
                <p className="text-xs leading-5 text-gray-500">A localização fica salva apenas neste navegador. Você pode removê-la a qualquer momento.</p>
                {enderecoCompleto && <button type="button" onClick={() => { limparLocalizacao(); setMensagem('Localização removida deste dispositivo.') }} className="self-start py-1 text-sm font-semibold text-red-700 underline">Remover localização salva</button>}
              </div>
            )}

            {secao === 'privacy' && <PrivacyContent />}

            {secao === 'delete' && (
              <div className="mt-5 flex flex-col gap-4">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-900">
                  <p className="font-semibold">Esta ação é permanente.</p>
                  <p className="mt-1">No protótipo, a exclusão remove seu perfil, favoritos e pedidos vinculados. A localização e o carrinho salvos neste navegador também serão apagados. Não será possível recuperar esses dados.</p>
                </div>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Digite <span className="font-mono font-bold">EXCLUIR</span> para confirmar
                  <input autoCapitalize="characters" value={confirmacaoExclusao} onChange={(evento) => setConfirmacaoExclusao(evento.target.value.trim().toUpperCase())} className="h-11 rounded-xl border border-gray-300 px-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                </label>
                {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
                <button type="button" disabled={apagandoConta || confirmacaoExclusao !== 'EXCLUIR'} onClick={() => void excluirConta()} className="h-11 rounded-xl bg-red-600 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {apagandoConta ? 'Excluindo conta...' : 'Excluir permanentemente'}
                </button>
              </div>
            )}

            {secao !== 'delete' && secao !== 'personal' && <div className="mt-5 flex justify-end"><button type="button" onClick={() => setSecao(null)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Fechar</button></div>}
          </section>
        </div>
      )}
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="mt-5 flex flex-col gap-4 text-sm leading-6 text-gray-700">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
        Este é um texto-base para o protótipo. Antes de iniciar a pesquisa, identifique aqui o responsável pelo tratamento dos dados e um canal de contato.
      </div>
      <details open className="rounded-2xl border border-gray-200 p-4">
        <summary className="cursor-pointer font-semibold text-gray-900">Aviso de privacidade</summary>
        <div className="mt-3 flex flex-col gap-3">
          <p>O aplicativo usa nome, e-mail e, se informado, telefone para manter sua conta. A localização por GPS ou CEP é usada para encontrar padarias próximas. A localização e o carrinho ficam armazenados no navegador deste dispositivo; o CEP é consultado no ViaCEP e as coordenadas podem ser enviadas ao OpenStreetMap/Nominatim para obter o endereço aproximado.</p>
          <p>Os dados da conta são armazenados no Supabase, que fornece autenticação e banco de dados. O acesso deve ser limitado pelas regras de segurança do sistema. Nesta versão, a criação e o pagamento de pedidos ainda não são concluídos pelo aplicativo.</p>
          <p>Você pode consultar e corrigir nome e telefone no perfil, remover a localização deste dispositivo ou solicitar a exclusão da conta. A exclusão também remove os pedidos e favoritos vinculados ao perfil neste protótipo.</p>
          <p>Nos termos da LGPD, o titular pode solicitar confirmação e acesso aos dados, correção, portabilidade, informação sobre compartilhamento e, quando aplicável, anonimização, bloqueio ou eliminação.</p>
        </div>
      </details>
      <details className="rounded-2xl border border-gray-200 p-4">
        <summary className="cursor-pointer font-semibold text-gray-900">Termos de uso — versão de protótipo</summary>
        <div className="mt-3 flex flex-col gap-3">
          <p>O aplicativo é um protótipo acadêmico para navegação e avaliação de usabilidade. As informações de produtos, disponibilidade, preços e padarias podem estar incompletas ou ser demonstrativas.</p>
          <p>O usuário deve fornecer informações corretas, manter suas credenciais em segurança e utilizar o aplicativo de forma lícita. Não compartilhe sua senha nem dados pessoais de terceiros no campo de observações.</p>
          <p>Nesta versão, a etapa de checkout não registra um pedido real nem processa pagamentos. A tela de acompanhamento é demonstrativa. Não use o protótipo para solicitar ou pagar entregas.</p>
        </div>
      </details>
      <p className="text-xs text-gray-500">Referência: Lei nº 13.709/2018 (LGPD), especialmente os direitos do titular previstos no art. 18.</p>
    </div>
  )
}
