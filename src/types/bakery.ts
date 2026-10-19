export interface BakeryForm {
  name: string
  cnpj: string
  email: string
  phone: string
  description: string
  cep: string
  street: string
  adress_number: string
  complement: string
  neighborhood: string
  city: string
  opens_at: string
  closes_at: string
  delivery_radius_km: string
  estimated_delivery_minutes: string
  pix_key: string
  min_order_value: string
  delivery_fee: string
}

/** Campos do formulário + credenciais (que nunca vão para o banco nem para o localStorage). */
export interface CadastroBakery extends BakeryForm {
  password: string
  confirmPassword: string
}

export const CADASTRO_INICIAL: CadastroBakery = {
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  description: '',
  cep: '',
  street: '',
  adress_number: '',
  complement: '',
  neighborhood: '',
  city: '',
  opens_at: '',
  closes_at: '',
  delivery_radius_km: '',
  estimated_delivery_minutes: '',
  pix_key: '',
  min_order_value: '',
  delivery_fee: '',
  password: '',
  confirmPassword: '',
}
