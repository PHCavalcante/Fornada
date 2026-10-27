import { useEffect, useMemo, useState } from 'react'
import BakeryCard from '../../components/BakeryCard'
import ClientHeader from '../../components/ClientHeader'
import ClientMenu from '../../components/ClientMenu'
import { palette } from '../../theme'
import { useLocalizacao } from '../../utils/GetLocation'
import { buscarPadariasAbertas, type PadariaPublica } from '../../utils/clientCatalog'

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

export default function Search() {
  const { coordenadas } = useLocalizacao()
  const [termo, setTermo] = useState('')
  const [padarias, setPadarias] = useState<PadariaPublica[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const latitude = coordenadas?.lat ?? null
  const longitude = coordenadas?.lng ?? null

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)
    const ponto = latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null
    buscarPadariasAbertas(ponto)
      .then((resultado) => { if (ativo) setPadarias(resultado) })
      .catch((falha: unknown) => {
        if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível buscar padarias.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [latitude, longitude])

  const resultados = useMemo(() => {
    const busca = normalizar(termo.trim())
    if (!busca) return padarias
    return padarias.filter((padaria) => normalizar([
      padaria.name,
      padaria.street,
      padaria.neighborhood,
      padaria.city,
    ].join(' ')).includes(busca))
  }, [padarias, termo])

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffaf5]">
      <ClientHeader title="Buscar padarias" />
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mx-auto w-full max-w-xl">
          <section className="mb-6 rounded-3xl p-5 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${palette.light.accent}, #d88d4f)` }}>
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">CARDÁPIO PERTO DE VOCÊ</span>
            <h1 className="mt-3 text-2xl font-bold">Encontre sua próxima padaria</h1>
            <p className="mt-1 text-sm leading-5 text-white/90">Pesquise por nome, bairro ou cidade.</p>
          </section>

          <div className="relative">
            <label htmlFor="busca-padaria" className="sr-only">Buscar padarias por nome ou localização</label>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4.2 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
            <input
              id="busca-padaria"
              type="search"
              value={termo}
              onChange={(evento) => setTermo(evento.target.value)}
              placeholder="Ex.: Pão quentinho, Centro..."
              className="h-14 w-full rounded-2xl border border-orange-100 bg-white pl-12 pr-12 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
            {termo && (
              <button type="button" onClick={() => setTermo('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-600 hover:bg-gray-200">
                ×
              </button>
            )}
          </div>

          <div className="mb-3 mt-7 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Padarias abertas</h2>
              <p className="mt-0.5 text-sm text-gray-500">{termo.trim() ? 'Resultados da sua busca' : 'Explore as opções disponíveis'}</p>
            </div>
            {!carregando && !erro && (
              <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900" aria-live="polite">
                {resultados.length} {resultados.length === 1 ? 'padaria' : 'padarias'}
              </span>
            )}
          </div>

          {erro && <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
          {carregando ? (
            <div className="flex flex-col gap-4" aria-label="Carregando padarias">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex animate-pulse items-center gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-orange-50">
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-orange-100" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : !erro && resultados.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl" aria-hidden="true">⌕</span>
              <h3 className="mt-4 font-semibold text-gray-900">{termo.trim() ? 'Não encontramos essa padaria' : 'Nenhuma padaria aberta agora'}</h3>
              <p className="mt-1 max-w-xs text-sm leading-5 text-gray-500">
                {termo.trim() ? 'Tente outro nome, bairro ou cidade.' : 'Volte mais tarde para conferir novas opções.'}
              </p>
              {termo && <button type="button" onClick={() => setTermo('')} className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: palette.light.accent }}>Limpar busca</button>}
            </div>
          ) : !erro && (
            <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-white p-3 shadow-sm">
              {resultados.map((padaria) => (
                <BakeryCard
                  key={padaria.id}
                  id={padaria.id}
                  name={padaria.name}
                  address={`${padaria.street}, ${padaria.adress_number} · ${padaria.neighborhood}, ${padaria.city}`}
                  distanceKm={padaria.distance_km}
                  rating={Number(padaria.avg_rating)}
                  ratingCount={padaria.rating_count}
                  imageUrl={padaria.logo_url}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <ClientMenu />
    </div>
  )
}
