import { useCallback, useState } from 'react';

type Coordenadas = { lat: number; lng: number };
type LocalizacaoSalva = {
  origem: 'gps' | 'cep';
  coordenadas: Coordenadas | null;
  endereco: string;
  rua: string | null;
  cep: string | null;
};

const CHAVE_LOCALIZACAO = 'tcc:localizacao-cliente:v1';

async function fetchComTimeout(url: string, timeoutMs = 10000) {
  const controlador = new AbortController();
  const temporizador = window.setTimeout(() => controlador.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controlador.signal });
  } finally {
    window.clearTimeout(temporizador);
  }
}

function lerLocalizacaoSalva(): LocalizacaoSalva | null {
  try {
    const valor = localStorage.getItem(CHAVE_LOCALIZACAO);
    if (!valor) return null;

    const localizacao: unknown = JSON.parse(valor);
    if (
      typeof localizacao !== 'object' || localizacao === null ||
      !('endereco' in localizacao) || typeof localizacao.endereco !== 'string' ||
      !('origem' in localizacao) || !['gps', 'cep'].includes(String(localizacao.origem))
    ) return null;

    return localizacao as LocalizacaoSalva;
  } catch {
    return null;
  }
}

function salvarLocalizacao(localizacao: LocalizacaoSalva) {
  try {
    localStorage.setItem(CHAVE_LOCALIZACAO, JSON.stringify(localizacao));
  } catch {
    // A localização continua disponível nesta sessão mesmo se o navegador bloquear o armazenamento.
  }
}

export function useLocalizacao() {
  const [localizacao, setLocalizacao] = useState<LocalizacaoSalva | null>(lerLocalizacaoSalva);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const reverterGeocodificacao = async (lat: number, lng: number) => {
    const resposta = await fetchComTimeout(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
    );
    if (!resposta.ok) throw new Error('Falha ao obter endereço.');
    const dados = await resposta.json();
    if (typeof dados.display_name !== 'string') throw new Error('Endereço inválido.');
    return {
      endereco: dados.display_name as string,
      rua: (dados.address?.road ?? dados.address?.neighbourhood ?? null) as string | null,
    };
  };

  const pegarLocalizacao = useCallback((): Promise<boolean> => {
    setCarregando(true);
    setErro(null);

    if (!window.isSecureContext) {
      setErro('A localização automática exige uma conexão segura (HTTPS). Você pode informar seu CEP.');
      setCarregando(false);
      return Promise.resolve(false);
    }

    if (!('geolocation' in navigator)) {
      setErro('Este navegador não oferece localização automática. Você pode informar seu CEP.');
      setCarregando(false);
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          const { latitude, longitude } = posicao.coords;
          const localizacaoGps: LocalizacaoSalva = {
            origem: 'gps',
            coordenadas: { lat: latitude, lng: longitude },
            endereco: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            rua: null,
            cep: null,
          };
          salvarLocalizacao(localizacaoGps);
          setLocalizacao(localizacaoGps);
          setCarregando(false);
          resolve(true);

          // O ponto GPS já está salvo e disponível. O endereço é apenas um complemento.
          void reverterGeocodificacao(latitude, longitude).then(({ endereco, rua }) => {
            const salva = lerLocalizacaoSalva();
            if (
              salva?.origem !== 'gps' ||
              salva.coordenadas?.lat !== latitude ||
              salva.coordenadas?.lng !== longitude
            ) return;

            const localizacaoComEndereco = { ...localizacaoGps, endereco, rua };
            salvarLocalizacao(localizacaoComEndereco);
            setLocalizacao(localizacaoComEndereco);
          }).catch(() => {
            // As coordenadas continuam válidas mesmo se o serviço de endereço falhar.
          });
        },
        (falha) => {
          const mensagens: Record<number, string> = {
            1: 'O acesso à localização foi negado. Libere a permissão no navegador ou informe seu CEP.',
            2: 'O dispositivo não conseguiu determinar sua localização. Tente novamente ou informe seu CEP.',
            3: 'A localização demorou para responder. Tente novamente ou informe seu CEP.',
          };
          setErro(mensagens[falha.code] ?? 'Não foi possível obter sua localização. Você pode informar seu CEP.');
          setCarregando(false);
          resolve(false);
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 },
      );
    });
  }, []);

  const buscarCep = useCallback(async (cepInformado: string): Promise<boolean> => {
    const cep = cepInformado.replace(/\D/g, '');
    if (cep.length !== 8) {
      setErro('CEP inválido. Digite os 8 dígitos do CEP.');
      return false;
    }

    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetchComTimeout(`https://viacep.com.br/ws/${cep}/json/`);
      if (!resposta.ok) throw new Error('Falha na requisição.');
      const dados = await resposta.json();
      if (dados.erro === true) throw new Error('CEP não encontrado.');

      const partes = [dados.logradouro, dados.bairro, dados.localidade, dados.uf]
        .filter((parte): parte is string => typeof parte === 'string' && parte.length > 0);
      const endereco = `${partes.join(', ')}${partes.length ? ' — ' : ''}CEP ${dados.cep ?? cep}`;
      const novaLocalizacao: LocalizacaoSalva = {
        origem: 'cep',
        coordenadas: null,
        endereco,
        rua: typeof dados.logradouro === 'string' && dados.logradouro ? dados.logradouro : null,
        cep,
      };

      salvarLocalizacao(novaLocalizacao);
      setLocalizacao(novaLocalizacao);
      return true;
    } catch {
      setErro('CEP não encontrado ou serviço indisponível. Verifique o número e tente novamente.');
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const limparLocalizacao = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE_LOCALIZACAO);
    } catch {
      // A tela ainda pode reiniciar a localização nesta sessão.
    }
    setLocalizacao(null);
    setErro(null);
  }, []);

  return {
    coordenadas: localizacao?.coordenadas ?? null,
    enderecoCompleto: localizacao?.endereco ?? null,
    rua: localizacao?.rua ?? null,
    cepSalvo: localizacao?.cep ?? null,
    origem: localizacao?.origem ?? null,
    erro,
    carregando,
    pegarLocalizacao,
    buscarCep,
    limparLocalizacao,
  };
}
