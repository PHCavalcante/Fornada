import { supabase } from './supabase'

export const BUCKET_IMAGENS_PADARIA = 'bakery-images'
export const BUCKET_IMAGENS_PRODUTOS = 'product-images'

const TAMANHO_MAXIMO = 5 * 1024 * 1024
const EXTENSOES_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function validarImagem(file: File) {
  if (!EXTENSOES_POR_MIME[file.type]) {
    throw new Error('Escolha uma imagem JPG, PNG ou WebP.')
  }
  if (file.size > TAMANHO_MAXIMO) {
    throw new Error('A imagem deve ter no máximo 5 MB.')
  }
}

export async function enviarImagemPadaria(
  bakeryId: string,
  tipo: 'logo' | 'cover',
  file: File,
) {
  return enviarImagem(BUCKET_IMAGENS_PADARIA, `${bakeryId}/${tipo}`, file)
}

export async function enviarImagemProduto(bakeryId: string, file: File) {
  return enviarImagem(BUCKET_IMAGENS_PRODUTOS, `${bakeryId}/products`, file)
}

async function enviarImagem(bucket: string, pasta: string, file: File) {
  validarImagem(file)
  const extensao = EXTENSOES_POR_MIME[file.type]
  const caminho = `${pasta}/${crypto.randomUUID()}.${extensao}`
  const { error } = await supabase.storage.from(bucket).upload(caminho, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) throw new Error(error.message)

  return {
    path: caminho,
    publicUrl: supabase.storage.from(bucket).getPublicUrl(caminho).data.publicUrl,
  }
}

export async function removerImagemPublica(bucket: string, publicUrl: string | null) {
  if (!publicUrl) return
  const marcador = `/storage/v1/object/public/${bucket}/`
  const indice = publicUrl.indexOf(marcador)
  if (indice < 0) return

  const caminho = publicUrl.slice(indice + marcador.length)
  if (!caminho) return

  const { error } = await supabase.storage.from(bucket).remove([caminho])
  if (error) throw new Error(error.message)
}
