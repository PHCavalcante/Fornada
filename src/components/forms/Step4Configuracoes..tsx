import type { StepProps } from "./types";

export default function Step4Configuracoes({ form, update }: StepProps) {
    return (
         <div className="flex flex-col gap-4 mt-6">
           <div className="flex flex-col">
          <label htmlFor="pix_key">Chave PIX</label>
          <input
            id="pix_key"
            name="pix_key"
            type="text"
            value={form.pix_key}
            onChange={(e) => update("pix_key", e.target.value)}
            className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
      </div>
    );
}