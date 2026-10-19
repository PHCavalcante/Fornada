import type { CadastroBakery } from '../../types/bakery'

export interface StepProps {
  form: CadastroBakery
  update: <K extends keyof CadastroBakery>(campo: K, valor: CadastroBakery[K]) => void
}