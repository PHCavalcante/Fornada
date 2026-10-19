import type { StepProps } from "./types";

export default function Step5Finalizacao({ form, update }: StepProps) {
    return (
        <div className="flex flex-col gap-4 mt-6">
            <div className="flex flex-col">
                <label htmlFor="logoDaPadaria">Logo da padaria</label>
                <input
                    id="logoDaPadaria"
                    name="logoDaPadaria"
                    type="file"
                    className="w-80 h-12 rounded-lg bg-black text-white px-4 py-2"
                    title="Selecione o arquivo de logo da padaria"
                    accept="image/*"
                    disabled
                />
                <span className="text-xs text-gray-600 mt-1">
                    Upload de imagens disponível em breve.
                </span>
            </div>
            <div className="flex flex-col">
                <label htmlFor="bannerDaPadaria">Banner da padaria</label>
                <input
                    id="bannerDaPadaria"
                    name="bannerDaPadaria"
                    type="file"
                    className="w-80 h-12 rounded-lg bg-black text-white px-4 py-2"
                    title="Selecione o arquivo de banner da padaria"
                    accept="image/*"
                    disabled
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="description">Descrição</label>
                <input
                    id="description"
                    name="description"
                    type="text"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                />
            </div>
        </div>
    );
}