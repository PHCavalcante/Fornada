-- Execute no SQL Editor do Supabase antes de publicar a Edge Function
-- supabase/functions/delete-customer-account/index.ts.
-- A função fica acessível somente com a chave secreta/service_role no servidor.

create or replace function public.delete_customer_account_data(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  related_order_ids uuid[];
begin
  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = target_user_id
      and profile.role::text = 'customer'
  ) then
    raise exception 'Only customer accounts can be deleted through this flow.'
      using errcode = '42501';
  end if;

  if exists (
    select 1 from public.bakeries as bakery where bakery.owner_id = target_user_id
  ) then
    raise exception 'Transfer or remove the bakery before deleting this account.'
      using errcode = '23503';
  end if;

  select coalesce(array_agg(order_row.id), array[]::uuid[])
    into related_order_ids
  from public.orders as order_row
  where order_row.customer_id = target_user_id;

  delete from public.reviews as review
  where review.customer_id = target_user_id
     or review.order_id = any(related_order_ids);

  delete from public.order_status_history as history
  where history.order_id = any(related_order_ids);

  delete from public.order_items as item
  where item.order_id = any(related_order_ids);

  delete from public.orders as order_row
  where order_row.id = any(related_order_ids);

  delete from public.favorite_bakeries as favorite
  where favorite.profile_id = target_user_id;

  delete from public.favorite_products as favorite
  where favorite.profile_id = target_user_id;

  delete from public.profiles as profile
  where profile.id = target_user_id;
end;
$$;

revoke all on function public.delete_customer_account_data(uuid) from public;
revoke all on function public.delete_customer_account_data(uuid) from anon, authenticated;
grant execute on function public.delete_customer_account_data(uuid) to service_role;
