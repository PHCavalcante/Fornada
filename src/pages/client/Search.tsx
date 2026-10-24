import { useEffect, useMemo, useState } from 'react'
import BakeryCard from '../../components/BakeryCard'
import ClientHeader from '../../components/ClientHeader'
import ClientMenu from '../../components/ClientMenu'
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
    <div className="flex h-full min-h-0 flex-col">
      <ClientHeader title="Busca" />
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <label htmlFor="busca-padaria" className="sr-only">Buscar padarias por nome ou localização</label>
        <input
          id="busca-padaria"
          type="search"
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          placeholder="Nome, bairro ou cidade"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-700"
        />
        {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        {carregando ? (
          <p className="py-10 text-center text-gray-600">Buscando padarias...</p>
        ) : resultados.length === 0 ? (
          <p className="py-10 text-center text-gray-600">
            {termo ? 'Nenhuma padaria corresponde à busca.' : 'Nenhuma padaria aberta encontrada.'}
          </p>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
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
      </main>
      <ClientMenu />
    </div>
  )
}
