import { supabase } from './supabase'

export async function buscarPadariaDoProprietario(ownerId: string) {
  const { data, error } = await supabase
    .from('bakeries')
    .select('id, name')
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as { id: string; name: string } | null
}
