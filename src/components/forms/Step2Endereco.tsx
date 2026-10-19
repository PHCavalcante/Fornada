import type { StepProps } from "./types";

export default function Step2Endereco({ form, update }: StepProps) {
    return (
        <div className="flex flex-col gap-4 mt-6">
            <div className="flex gap-4">
            <div className="flex flex-col">
                <label htmlFor="cep">CEP</label>
                <input
                    id="cep"
                    name="cep"
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => update("cep", e.target.value)}
                    className="w-22 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="street">Rua</label>
                <input
                    id="street"
                    name="street"
                    type="text"
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                    className="h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            </div>
            <div className="flex flex-col">
                <label htmlFor="adress_number">Número</label>
                <input
                    id="adress_number"
                    name="adress_number"
                    type="text"
                    value={form.adress_number}
                    onChange={(e) => update("adress_number", e.target.value)}
                    className="w-24 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            <div className="flex gap-4">
            <div className="flex flex-col">
                <label htmlFor="complement">Complemento</label>
                <input
                    id="complement"
                    name="complement"
                    type="text"
                    value={form.complement}
                    onChange={(e) => update("complement", e.target.value)}
                    className="h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            </div>
            <div className="flex flex-col">
                <label htmlFor="neighborhood">Bairro</label>
                <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => update("neighborhood", e.target.value)}
                    className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            <div className="flex gap-4">
            <div className="flex flex-col">
                <label htmlFor="city">Cidade</label>
                <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
            </div>
        </div>
    );
}
