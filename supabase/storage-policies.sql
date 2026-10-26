-- Execute no SQL Editor do Supabase depois de criar os buckets bakery-images e product-images.
-- As imagens são públicas para leitura; upload e exclusão ficam limitados ao dono da padaria.

-- A consulta de propriedade precisa ignorar o RLS de bakeries para conseguir
-- validar o dono durante a avaliação da política de storage.objects.
create or replace function public.user_owns_bakery_storage_folder(folder text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.bakeries as bakery
    where bakery.id::text = folder
      and bakery.owner_id = (select auth.uid())
  );
$$;

revoke all on function public.user_owns_bakery_storage_folder(text) from public;
grant execute on function public.user_owns_bakery_storage_folder(text) to authenticated;

drop policy if exists "Bakery owners upload bakery images" on storage.objects;
create policy "Bakery owners upload bakery images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'bakery-images'
  and public.user_owns_bakery_storage_folder((storage.foldername(name))[1])
);

drop policy if exists "Bakery owners delete bakery images" on storage.objects;
create policy "Bakery owners delete bakery images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'bakery-images'
  and public.user_owns_bakery_storage_folder((storage.foldername(name))[1])
);

drop policy if exists "Bakery owners upload product images" on storage.objects;
create policy "Bakery owners upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and public.user_owns_bakery_storage_folder((storage.foldername(name))[1])
);

drop policy if exists "Bakery owners delete product images" on storage.objects;
create policy "Bakery owners delete product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and public.user_owns_bakery_storage_folder((storage.foldername(name))[1])
);
