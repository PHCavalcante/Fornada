import locationIcon from '../../assets/location.svg';
import { useEffect, useState, type FormEvent } from 'react';
import BakeryCard from '../../components/BakeryCard';
import ClientMenu from '../../components/ClientMenu';
import { palette } from '../../theme';
import { useLocalizacao } from '../../utils/GetLocation';
import { buscarPadariasAbertas, type PadariaPublica } from '../../utils/clientCatalog';

export default function Home() {
  const {
    enderecoCompleto,
    rua,
    cepSalvo,
    origem,
    coordenadas,
    erro,
    carregando,
    pegarLocalizacao,
    buscarCep,
  } = useLocalizacao();
  const [cep, setCep] = useState(cepSalvo ?? '');
  const [editandoLocalizacao, setEditandoLocalizacao] = useState(!enderecoCompleto);
  const [detalhesLocalizacaoAbertos, setDetalhesLocalizacaoAbertos] = useState(false);
  const [padarias, setPadarias] = useState<PadariaPublica[]>([]);
  const [carregandoPadarias, setCarregandoPadarias] = useState(false);
  const [erroPadarias, setErroPadarias] = useState<string | null>(null);
  const latitude = coordenadas?.lat ?? null;
  const longitude = coordenadas?.lng ?? null;

  useEffect(() => {
    if (!enderecoCompleto) return;
    let ativo = true;
    setCarregandoPadarias(true);
    setErroPadarias(null);
    const ponto = latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;
    buscarPadariasAbertas(ponto)
      .then((resultado) => { if (ativo) setPadarias(resultado) })
      .catch((falha: unknown) => {
        if (ativo) setErroPadarias(falha instanceof Error ? falha.message : 'Não foi possível carregar as padarias.')
      })
      .finally(() => { if (ativo) setCarregandoPadarias(false) });
    return () => { ativo = false };
  }, [enderecoCompleto, latitude, longitude]);

  useEffect(() => {
    if (!detalhesLocalizacaoAbertos) return;

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setDetalhesLocalizacaoAbertos(false);
    }

    window.addEventListener('keydown', fecharComEscape);
    return () => window.removeEventListener('keydown', fecharComEscape);
  }, [detalhesLocalizacaoAbertos]);

  async function usarLocalizacaoAtual() {
    if (await pegarLocalizacao()) setEditandoLocalizacao(false);
  }

  async function salvarCep(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (await buscarCep(cep)) setEditandoLocalizacao(false);
  }

  if (editandoLocalizacao || !enderecoCompleto) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-[#fffaf5] px-6 text-center">
        <img src={locationIcon} width={48} height={68} alt="" className="rounded-3xl bg-orange-100 p-3 shadow-sm" />
        <div className="max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Onde você está?</h1>
          <p className="mt-2 leading-6 text-gray-600">
            Informe sua localização para encontrar padarias próximas. Você pode usar o GPS ou seu CEP.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void usarLocalizacaoAtual()}
          disabled={carregando}
          className="w-full max-w-xs rounded-2xl px-4 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
          style={{ backgroundColor: palette.light.accent }}
        >
          {carregando ? 'Obtendo localização...' : 'Usar localização do dispositivo'}
        </button>

        <div className="w-full max-w-xs rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-gray-500">ou informe seu CEP</p>
          <form className="flex flex-col gap-3" onSubmit={(evento) => void salvarCep(evento)}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={9}
              placeholder="00000-000"
              aria-label="CEP"
              value={cep}
              onChange={(evento) => setCep(evento.target.value.replace(/\D/g, '').slice(0, 8))}
              className="h-12 rounded-xl border border-gray-200 px-4 text-center outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
            <button
              type="submit"
              disabled={carregando}
              className="h-12 rounded-xl border border-orange-200 font-semibold text-gray-800 transition hover:bg-orange-50 disabled:opacity-60"
            >
              {carregando ? 'Buscando CEP...' : 'Usar este CEP'}
            </button>
          </form>
        </div>

        {erro && <p role="alert" className="max-w-sm rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
        {enderecoCompleto && (
          <button
            type="button"
            onClick={() => setEditandoLocalizacao(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900"
          >
            Cancelar e manter localização atual
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffaf5]">
      <div className="flex items-start justify-center px-5 pt-5">
        <button
          type="button"
          onClick={() => setDetalhesLocalizacaoAbertos(true)}
          aria-label="Ver detalhes da localização"
          className="flex min-h-12 w-full max-w-xl items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <img src={locationIcon} alt="" className="h-5 w-5 shrink-0" />
          <span className="min-w-0 truncate">{rua ?? enderecoCompleto}</span>
        </button>
      </div>

      {detalhesLocalizacaoAbertos && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setDetalhesLocalizacaoAbertos(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhes-localizacao"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-orange-100"
          >
            <h2 id="titulo-detalhes-localizacao" className="text-xl font-bold text-gray-900">
              Sua localização
            </h2>
            <p className="mt-3 break-words leading-6 text-gray-700">{enderecoCompleto}</p>
            {rua && <p className="mt-1 text-sm text-gray-500">{rua}</p>}
            {origem === 'cep' && (
              <p className="mt-3 text-sm text-amber-700">
                Localização aproximada pelo CEP. Use o GPS para informar um ponto mais preciso.
              </p>
            )}
            {origem === 'gps' && coordenadas && !rua && (
              <p className="mt-3 text-sm text-gray-500">Localização obtida pelo GPS.</p>
            )}
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setDetalhesLocalizacaoAbertos(false);
                  setEditandoLocalizacao(true);
                }}
                className="rounded-xl border border-orange-200 px-4 py-3 font-semibold text-gray-800 transition hover:bg-orange-50"
              >
                Alterar localização
              </button>
              <button
                type="button"
                onClick={() => setDetalhesLocalizacaoAbertos(false)}
                className="rounded-xl px-4 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="mx-5 min-h-0 flex-1 overflow-y-auto py-6">
        <h1 className="mb-4 mt-8 text-xl font-bold tracking-tight text-gray-900">Padarias próximas</h1>
        {/* {coordenadas === null && origem === 'cep' && (
          <p className="mb-4 text-sm text-gray-600">Mostrando padarias abertas. Use o GPS para calcular distância e disponibilidade de entrega.</p>
        )} */}
        {erroPadarias && <p role="alert" className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{erroPadarias}</p>}
        {carregandoPadarias ? (
          <p className="rounded-2xl border border-orange-100 bg-white px-4 py-8 text-center text-gray-600 shadow-sm">Buscando padarias...</p>
        ) : padarias.length === 0 && !erroPadarias ? (
          <p className="rounded-3xl border border-dashed border-orange-200 bg-white px-5 py-10 text-center leading-6 text-gray-600">Nenhuma padaria aberta encontrada por enquanto.</p>
        ) : (
          <div className="flex flex-col gap-3 pb-4 [&>div]:rounded-2xl [&>div]:border [&>div]:border-orange-100 [&>div]:bg-white [&>div]:p-3 [&>div]:shadow-sm">
            {padarias.map((padaria) => (
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

      <ClientMenu />
    </div>
  );
}
