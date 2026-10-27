import type { StepProps } from "./types";

export default function Step2Endereco({ form, update }: StepProps) {
    return (
        <div className="mt-6 flex w-full min-w-0 flex-col gap-4">
            <div className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] gap-3">
            <div className="flex min-w-0 flex-col">
                <label htmlFor="cep">CEP</label>
                <input
                    id="cep"
                    name="cep"
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => update("cep", e.target.value)}
                    className="h-12 w-full min-w-0 rounded-lg border border-black px-3 focus:outline-none focus:ring-2"
                />
            </div>
            <div className="flex min-w-0 flex-col">
                <label htmlFor="street">Rua</label>
                <input
                    id="street"
                    name="street"
                    type="text"
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                    className="h-12 w-full min-w-0 rounded-lg border border-black px-3 focus:outline-none focus:ring-2"
                />
            </div>
            </div>
            <div className="flex min-w-0 flex-col">
                <label htmlFor="adress_number">Número</label>
                <input
                    id="adress_number"
                    name="adress_number"
                    type="text"
                    value={form.adress_number}
                    onChange={(e) => update("adress_number", e.target.value)}
                    className="h-12 w-full max-w-32 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            <div className="flex min-w-0">
            <div className="flex w-full min-w-0 flex-col">
                <label htmlFor="complement">Complemento</label>
                <input
                    id="complement"
                    name="complement"
                    type="text"
                    value={form.complement}
                    onChange={(e) => update("complement", e.target.value)}
                    className="h-12 w-full rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            </div>
            <div className="flex min-w-0 flex-col">
                <label htmlFor="neighborhood">Bairro</label>
                <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => update("neighborhood", e.target.value)}
                    className="h-12 w-full rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            <div className="flex min-w-0">
            <div className="flex w-full min-w-0 flex-col">
                <label htmlFor="city">Cidade</label>
                <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="h-12 w-full rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            </div>
        </div>
    );
}
