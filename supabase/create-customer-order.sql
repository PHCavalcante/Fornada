-- Atomic customer checkout. Apply this function in the Supabase SQL Editor.
-- Prices, availability, delivery fee and totals are read from the database.
create or replace function public.create_customer_order(
  p_bakery_id uuid,
  p_items jsonb,
  p_delivery_latitude double precision,
  p_delivery_longitude double precision,
  p_delivery_address_text text,
  p_payment_method public.payment_method default 'pix'
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid;
  v_delivery_fee numeric;
  v_min_order_value numeric;
  v_delivery_radius_km numeric;
  v_bakery_latitude double precision;
  v_bakery_longitude double precision;
  v_subtotal numeric;
  v_requested_count integer;
  v_valid_count integer;
begin
  if v_customer_id is null then
    raise exception 'É necessário entrar na conta para fazer um pedido.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'O pedido precisa ter pelo menos um produto.';
  end if;

  if p_delivery_latitude is null or p_delivery_longitude is null
    or p_delivery_latitude not between -90 and 90
    or p_delivery_longitude not between -180 and 180 then
    raise exception 'A localização de entrega é inválida.';
  end if;

  select coalesce(delivery_fee, 0), coalesce(min_order_value, 0), delivery_radius_km, latitude, longitude
    into v_delivery_fee, v_min_order_value, v_delivery_radius_km, v_bakery_latitude, v_bakery_longitude
    from public.bakeries
    where id = p_bakery_id and is_open = true;

  if not found then
    raise exception 'Esta padaria não está disponível para receber pedidos.';
  end if;

  if v_delivery_radius_km is not null
    and v_bakery_latitude is not null and v_bakery_longitude is not null
    and 6371 * 2 * asin(sqrt(
      power(sin(radians(p_delivery_latitude - v_bakery_latitude) / 2), 2)
      + cos(radians(v_bakery_latitude)) * cos(radians(p_delivery_latitude))
      * power(sin(radians(p_delivery_longitude - v_bakery_longitude) / 2), 2)
    )) > v_delivery_radius_km then
    raise exception 'Seu endereço está fora do raio de entrega desta padaria.';
  end if;

  v_requested_count := jsonb_array_length(p_items);

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    group by item.value->>'product_id'
    having count(*) > 1
  ) then
    raise exception 'O pedido contém produtos repetidos. Revise seu carrinho.';
  end if;

  select count(*), coalesce(sum(product.price * (item.value->>'quantity')::integer), 0)
    into v_valid_count, v_subtotal
    from jsonb_array_elements(p_items) as item(value)
    join public.products as product
      on product.id = (item.value->>'product_id')::uuid
      and product.bakery_id = p_bakery_id
      and product.is_available = true
      and product.price = (item.value->>'unit_price')::numeric
    where (item.value->>'quantity')::integer > 0;

  if v_valid_count <> v_requested_count then
    raise exception 'Um produto ou preço mudou desde que você montou o carrinho. Revise seu pedido.';
  end if;

  if v_subtotal < v_min_order_value then
    raise exception 'O valor do pedido está abaixo do mínimo informado pela padaria.';
  end if;

  insert into public.orders (
    customer_id, bakery_id, delivery_latitude, delivery_longitude,
    delivery_address_text, payment_method, subtotal, delivery_fee, total
  ) values (
    v_customer_id, p_bakery_id, p_delivery_latitude, p_delivery_longitude,
    nullif(trim(p_delivery_address_text), ''), p_payment_method,
    v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, product_id, product_name, unit_price, quantity, subtotal
  )
  select
    v_order_id,
    product.id,
    product.name,
    product.price,
    (item.value->>'quantity')::integer,
    product.price * (item.value->>'quantity')::integer
  from jsonb_array_elements(p_items) as item(value)
  join public.products as product
    on product.id = (item.value->>'product_id')::uuid
    and product.bakery_id = p_bakery_id
    and product.is_available = true;

  return v_order_id;
end;
$$;

revoke all on function public.create_customer_order(uuid, jsonb, double precision, double precision, text, public.payment_method) from public, anon;
grant execute on function public.create_customer_order(uuid, jsonb, double precision, double precision, text, public.payment_method) to authenticated;
