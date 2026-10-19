import { useCallback, useState } from 'react';

export function useLocalizacao() {
  const [coordenadas, setCoordenadas] = useState<{lat: number, lng: number} | null>(null);
  const [enderecoCompleto, setEndereco] = useState<string | null>(null);
  const [rua, setRua] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const reverterGeocodificacao = async (lat: number, lng: number) => {
    const resposta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`
    );
    if (!resposta.ok) throw new Error("Falha ao obter endereço.");
    const dados = await resposta.json();
    if (typeof dados.display_name !== "string") throw new Error("Endereço inválido.");
    return {
      endereco: dados.display_name as string,
      rua: (dados.address?.road ?? dados.address?.neighbourhood ?? null) as string | null,
    };
  };

  const pegarLocalizacao = useCallback(() => {
    setCarregando(true);
    setErro(null);
    console.log("Iniciando obtenção de localização...");
    if (!("geolocation" in navigator)) {
      setErro("Seu navegador não suporta geolocalização.");
      setCarregando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        const { latitude, longitude } = posicao.coords;
        setCoordenadas({ lat: latitude, lng: longitude });
        try {
          const { endereco, rua } = await reverterGeocodificacao(latitude, longitude);
          setEndereco(endereco);
          setRua(rua);
        } catch {
          setEndereco(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setRua(null);
        }
        setCarregando(false);
      },
      () => {
        setErro("Não foi possível obter a localização automaticamente. Digite seu CEP.");
        setCarregando(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const buscarCep = useCallback(async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErro("CEP inválido. Digite os 8 dígitos do CEP.");
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!resposta.ok) throw new Error("Falha na requisição.");
      const dados = await resposta.json();
      if (dados.erro) throw new Error("CEP não encontrado.");
      const partes = [dados.logradouro, dados.bairro, dados.localidade, dados.uf]
        .filter(Boolean)
        .join(", ");
      setEndereco(`${partes} - CEP ${dados.cep}`);
      setRua(dados.logradouro);
      setCoordenadas(null);
    } catch {
      setErro("CEP não encontrado. Verifique e tente novamente.");
    }
    setCarregando(false);
  }, []);

  return { coordenadas, enderecoCompleto, rua, erro, carregando, pegarLocalizacao, buscarCep };
}
