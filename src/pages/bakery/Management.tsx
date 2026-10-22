import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Menu from '../../components/Menu'
import { useAuth } from '../../contexts/AuthContext'
import { palette } from '../../theme'
import {
  atualizarDadosDaPadaria,
  buscarDadosDaPadaria,
  type AtualizacaoPadaria,
  type DadosPadariaGerencia,
} from '../../utils/bakeryManagement'

interface FormularioPadaria {
  name: string
  cnpj: string
  email: string
  phone_or_whatsapp: string
  description: string
  logo_url: string
  cover_url: string
  cep: string
  street: string
  adress_number: string
  complement: string
  neighborhood: string
  city: string
  opens_at: string
  closes_at: string
  is_open: boolean
  delivery_radius_km: string
  estimated_delivery_minutes: string
  pix_key: string
  min_order_value: string
  delivery_fee: string
}

function paraFormulario(padaria: DadosPadariaGerencia): FormularioPadaria {
  return {
    name: padaria.name,
    cnpj: padaria.cnpj,
    email: padaria.email,
    phone_or_whatsapp: padaria.phone_or_whatsapp,
    description: padaria.description ?? '',
    logo_url: padaria.logo_url ?? '',
    cover_url: padaria.cover_url ?? '',
    cep: padaria.cep,
    street: padaria.street,
    adress_number: padaria.adress_number,
    complement: padaria.complement ?? '',
    neighborhood: padaria.neighborhood,
    city: padaria.city,
    opens_at: padaria.opens_at?.slice(0, 5) ?? '',
    closes_at: padaria.closes_at?.slice(0, 5) ?? '',
    is_open: padaria.is_open,
    delivery_radius_km: padaria.delivery_radius_km?.toString() ?? '',
    estimated_delivery_minutes: padaria.estimated_delivery_minutes?.toString() ?? '',
    pix_key: padaria.pix_key ?? '',
    min_order_value: padaria.min_order_value?.toString() ?? '',
    delivery_fee: padaria.delivery_fee?.toString() ?? '',
  }
}

function numeroOpcional(valor: string, campo: string) {
  if (!valor.trim()) return null
  const numero = Number(valor.replace(',', '.'))
  if (!Number.isFinite(numero) || numero < 0) throw new Error(`Informe um valor válido para ${campo}.`)
  return numero
}

function dadosParaSalvar(formulario: FormularioPadaria): AtualizacaoPadaria {
  const camposObrigatorios: (keyof FormularioPadaria)[] = [
    'name', 'cnpj', 'email', 'phone_or_whatsapp', 'cep', 'street',
    'adress_number', 'neighborhood', 'city',
  ]
  if (camposObrigatorios.some((campo) => !String(formulario[campo]).trim())) {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  const cnpj = formulario.cnpj.replace(/\D/g, '')
  const cep = formulario.cep.replace(/\D/g, '')
  if (cnpj.length !== 14) throw new Error('O CNPJ deve conter 14 dígitos.')
  if (cep.length !== 8) throw new Error('O CEP deve conter 8 dígitos.')
  if (!/^\S+@\S+\.\S+$/.test(formulario.email.trim())) throw new Error('Informe um e-mail válido.')

  const raio = numeroOpcional(formulario.delivery_radius_km, 'raio de entrega')
  const tempo = numeroOpcional(formulario.estimated_delivery_minutes, 'tempo estimado')
  if (tempo !== null && !Number.isInteger(tempo)) throw new Error('O tempo estimado deve ser um número inteiro de minutos.')

  return {
    name: formulario.name.trim(),
    cnpj,
    email: formulario.email.trim(),
    phone_or_whatsapp: formulario.phone_or_whatsapp.trim(),
    description: formulario.description.trim() || null,
    logo_url: formulario.logo_url.trim() || null,
    cover_url: formulario.cover_url.trim() || null,
    cep,
    street: formulario.street.trim(),
    adress_number: formulario.adress_number.trim(),
    complement: formulario.complement.trim() || null,
    neighborhood: formulario.neighborhood.trim(),
    city: formulario.city.trim(),
    opens_at: formulario.opens_at || null,
    closes_at: formulario.closes_at || null,
    is_open: formulario.is_open,
    delivery_radius_km: raio,
    estimated_delivery_minutes: tempo,
    pix_key: formulario.pix_key.trim() || null,
    min_order_value: numeroOpcional(formulario.min_order_value, 'pedido mínimo'),
    delivery_fee: numeroOpcional(formulario.delivery_fee, 'taxa de entrega'),
  }
}

export default function Management() {
  const { profile } = useAuth()
  const [padaria, setPadaria] = useState<DadosPadariaGerencia | null>(null)
  const [formulario, setFormulario] = useState<FormularioPadaria | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!profile?.id) return
    setCarregando(true)
    setErro(null)
    try {
      const dados = await buscarDadosDaPadaria(profile.id)
      setPadaria(dados)
      setFormulario(dados ? paraFormulario(dados) : null)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os dados da padaria.')
    } finally {
      setCarregando(false)
    }
  }, [profile?.id])

  useEffect(() => { void carregar() }, [carregar])

  function alterar<K extends keyof FormularioPadaria>(campo: K, valor: FormularioPadaria[K]) {
    setFormulario((atual) => atual ? { ...atual, [campo]: valor } : atual)
    setMensagem(null)
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!profile?.id || !padaria || !formulario) return

    setSalvando(true)
    setErro(null)
    setMensagem(null)
    try {
      const atualizacao = dadosParaSalvar(formulario)
      await atualizarDadosDaPadaria(profile.id, padaria.id, atualizacao)
      setPadaria({ ...padaria, ...atualizacao })
      setMensagem('Dados da padaria salvos.')
    } catch (falha) {
      const texto = falha instanceof Error ? falha.message : 'Não foi possível salvar as alterações.'
      setErro(texto.includes('duplicate key')
        ? 'CNPJ, e-mail ou telefone já está sendo usado por outra padaria.'
        : texto)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Menu />
      <main className="flex h-screen min-h-0 w-full flex-col overflow-y-auto px-6 pb-10 overscroll-contain sm:ml-8 sm:px-10 lg:ml-14.75 lg:mr-14.75">
        <header className="mt-10">
          <h1 className="text-3xl font-bold" style={{ color: palette.light.accent }}>Gerência</h1>
          <p className="mt-2 text-gray-600">Atualize os dados que aparecem para seus clientes.</p>
        </header>

        {erro && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}
        {mensagem && <p role="status" className="mt-6 rounded-lg bg-green-50 p-3 text-green-800">{mensagem}</p>}

        {carregando ? (
          <p className="mt-10 text-gray-600">Carregando dados da padaria...</p>
        ) : !padaria || !formulario ? (
          <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-bold">Nenhuma padaria vinculada à sua conta</h2>
            <p className="mt-2 text-gray-600">Conclua o cadastro da padaria para poder gerenciá-la.</p>
          </section>
        ) : (
          <form onSubmit={(evento) => void salvar(evento)} className="mt-8 flex flex-col gap-6">
            <Secao titulo="Identidade e contato">
              <div className="grid gap-4 md:grid-cols-2">
                <Campo rotulo="Nome da padaria" obrigatório>
                  <input required maxLength={120} value={formulario.name} onChange={(e) => alterar('name', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="CNPJ" obrigatório>
                  <input required inputMode="numeric" value={formulario.cnpj} onChange={(e) => alterar('cnpj', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="E-mail" obrigatório>
                  <input required type="email" value={formulario.email} onChange={(e) => alterar('email', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Telefone ou WhatsApp" obrigatório>
                  <input required type="tel" value={formulario.phone_or_whatsapp} onChange={(e) => alterar('phone_or_whatsapp', e.target.value)} className={estiloInput} />
                </Campo>
                <div className="md:col-span-2">
                  <Campo rotulo="Descrição">
                    <textarea rows={3} maxLength={500} value={formulario.description} onChange={(e) => alterar('description', e.target.value)} className={estiloInput} />
                  </Campo>
                </div>
              </div>
            </Secao>

            <Secao titulo="Logo e capa">
              <p className="mb-4 text-sm text-gray-600">Informe links públicos das imagens. O envio de arquivos será habilitado após configurar o Storage.</p>
              <div className="grid gap-5 md:grid-cols-2">
                <Campo rotulo="URL do logo">
                  <input type="url" placeholder="https://..." value={formulario.logo_url} onChange={(e) => alterar('logo_url', e.target.value)} className={estiloInput} />
                  {formulario.logo_url && <img src={formulario.logo_url} alt="Prévia do logo" className="mt-3 h-24 w-24 rounded-lg border object-cover" />}
                </Campo>
                <Campo rotulo="URL da capa">
                  <input type="url" placeholder="https://..." value={formulario.cover_url} onChange={(e) => alterar('cover_url', e.target.value)} className={estiloInput} />
                  {formulario.cover_url && <img src={formulario.cover_url} alt="Prévia da capa" className="mt-3 h-24 w-full rounded-lg border object-cover" />}
                </Campo>
              </div>
            </Secao>

            <Secao titulo="Endereço">
              <div className="grid gap-4 md:grid-cols-2">
                <Campo rotulo="CEP" obrigatório>
                  <input required inputMode="numeric" maxLength={9} value={formulario.cep} onChange={(e) => alterar('cep', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Cidade" obrigatório>
                  <input required value={formulario.city} onChange={(e) => alterar('city', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Rua" obrigatório>
                  <input required value={formulario.street} onChange={(e) => alterar('street', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Número" obrigatório>
                  <input required value={formulario.adress_number} onChange={(e) => alterar('adress_number', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Complemento">
                  <input value={formulario.complement} onChange={(e) => alterar('complement', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Bairro" obrigatório>
                  <input required value={formulario.neighborhood} onChange={(e) => alterar('neighborhood', e.target.value)} className={estiloInput} />
                </Campo>
              </div>
            </Secao>

            <Secao titulo="Horário e entrega">
              <div className="grid gap-4 md:grid-cols-2">
                <Campo rotulo="Abre às">
                  <input type="time" value={formulario.opens_at} onChange={(e) => alterar('opens_at', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Fecha às">
                  <input type="time" value={formulario.closes_at} onChange={(e) => alterar('closes_at', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Raio de entrega (km)">
                  <input type="number" min="0" step="0.1" value={formulario.delivery_radius_km} onChange={(e) => alterar('delivery_radius_km', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Tempo estimado (minutos)">
                  <input type="number" min="0" step="1" value={formulario.estimated_delivery_minutes} onChange={(e) => alterar('estimated_delivery_minutes', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Pedido mínimo (R$)">
                  <input type="number" min="0" step="0.01" value={formulario.min_order_value} onChange={(e) => alterar('min_order_value', e.target.value)} className={estiloInput} />
                </Campo>
                <Campo rotulo="Taxa de entrega (R$)">
                  <input type="number" min="0" step="0.01" value={formulario.delivery_fee} onChange={(e) => alterar('delivery_fee', e.target.value)} className={estiloInput} />
                </Campo>
              </div>
              <label className="mt-5 flex items-center gap-3 font-medium">
                <input type="checkbox" checked={formulario.is_open} onChange={(e) => alterar('is_open', e.target.checked)} className="h-5 w-5 accent-amber-700" />
                Padaria disponível para receber pedidos
              </label>
            </Secao>

            <Secao titulo="Pagamento">
              <Campo rotulo="Chave Pix">
                <input value={formulario.pix_key} onChange={(e) => alterar('pix_key', e.target.value)} className={estiloInput} />
              </Campo>
            </Secao>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg px-6 py-3 font-bold text-white shadow disabled:opacity-50"
                style={{ backgroundColor: palette.light.accent }}
              >
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

const estiloInput = 'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-700 focus:outline-none'

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-xl font-bold">{titulo}</h2>
      {children}
    </section>
  )
}

function Campo({
  rotulo,
  obrigatório = false,
  children,
}: {
  rotulo: string
  obrigatório?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      <span>{rotulo}{obrigatório && <span className="text-red-600"> *</span>}</span>
      {children}
    </label>
  )
}
