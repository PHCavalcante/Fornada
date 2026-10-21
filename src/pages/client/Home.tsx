import locationIcon from '../../assets/location.svg';
import { useState, type FormEvent } from 'react';
import BakeryCard from '../../components/BakeryCard';
import ClientMenu from '../../components/ClientMenu';
import { palette } from '../../theme';
import { useLocalizacao } from '../../utils/GetLocation';

export default function Home() {
  const {
    enderecoCompleto,
    rua,
    cepSalvo,
    erro,
    carregando,
    pegarLocalizacao,
    buscarCep,
  } = useLocalizacao();
  const [cep, setCep] = useState(cepSalvo ?? '');
  const [editandoLocalizacao, setEditandoLocalizacao] = useState(!enderecoCompleto);

  async function usarLocalizacaoAtual() {
    if (await pegarLocalizacao()) setEditandoLocalizacao(false);
  }

  async function salvarCep(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (await buscarCep(cep)) setEditandoLocalizacao(false);
  }

  if (editandoLocalizacao || !enderecoCompleto) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <img src={locationIcon} width={48} height={68} alt="" />
        <div className="max-w-sm">
          <h1 className="text-xl font-bold">Onde você está?</h1>
          <p className="mt-2 text-gray-600">
            Informe sua localização para encontrar padarias próximas. Você pode usar o GPS ou seu CEP.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void usarLocalizacaoAtual()}
          disabled={carregando}
          className="w-full max-w-xs rounded-lg px-4 py-3 text-white disabled:opacity-60"
          style={{ backgroundColor: palette.light.accent }}
        >
          {carregando ? 'Obtendo localização...' : 'Usar localização do dispositivo'}
        </button>

        <div className="w-full max-w-xs">
          <p className="mb-3 text-sm text-gray-500">ou informe seu CEP</p>
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
              className="rounded-lg border px-4 py-3 text-center outline-none"
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg border border-gray-400 px-4 py-3 disabled:opacity-60"
            >
              {carregando ? 'Buscando CEP...' : 'Usar este CEP'}
            </button>
          </form>
        </div>

        {erro && <p role="alert" className="max-w-sm text-sm text-red-600">{erro}</p>}
        {enderecoCompleto && (
          <button
            type="button"
            onClick={() => setEditandoLocalizacao(false)}
            className="text-sm underline"
          >
            Cancelar e manter localização atual
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-center gap-2 px-4 pt-10 text-center">
        <img src={locationIcon} alt="" className="mt-1 h-5 w-5 shrink-0" />
        <div>
          <p className="wrap-break-word">{rua ?? enderecoCompleto}</p>
          {rua && <p className="mt-1 text-sm text-gray-500">{enderecoCompleto}</p>}
          <button
            type="button"
            onClick={() => setEditandoLocalizacao(true)}
            className="mt-2 text-sm underline"
          >
            Alterar localização
          </button>
        </div>
      </div>

      <div className="mx-5 my-auto flex flex-col gap-8 overflow-y-auto">
        <h1 className="text-lg font-bold">Padarias Próximas</h1>
        <div className="flex flex-col gap-6">
          <BakeryCard goTo="/client/bakery/teste1" />
          <BakeryCard goTo="/client/bakery/teste2" />
          <BakeryCard goTo="/client/bakery/teste3" />
        </div>
      </div>

      <ClientMenu />
    </div>
  );
}
