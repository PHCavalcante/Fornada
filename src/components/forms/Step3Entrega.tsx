import type { StepProps } from "./types";

export default function Step3Entrega({ form, update }: StepProps) {
    return (
        <div className="flex flex-col gap-4 mt-6">
            <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                    <label htmlFor="opens_at">Abre as</label>
                    <input
                        id="opens_at"
                        name="opens_at"
                        type="time"
                        value={form.opens_at}
                        onChange={(e) => update("opens_at", e.target.value)}
                        className="w-22 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="closes_at">Fecha as</label>
                    <input
                        id="closes_at"
                        name="closes_at"
                        type="time"
                        value={form.closes_at}
                        onChange={(e) => update("closes_at", e.target.value)}
                        className="w-22 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                    />
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <label htmlFor="delivery_radius_km">Raio entrega (Km)</label>
                    <input
                        id="delivery_radius_km"
                        name="delivery_radius_km"
                        type="text"
                        inputMode="decimal"
                        placeholder="5"
                        value={form.delivery_radius_km}
                        onChange={(e) => update("delivery_radius_km", e.target.value)}
                        className="w-22 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="estimated_delivery_minutes">Tempo de entrega (min)</label>
                    <input
                        id="estimated_delivery_minutes"
                        name="estimated_delivery_minutes"
                        type="text"
                        inputMode="numeric"
                        placeholder="40"
                        value={form.estimated_delivery_minutes}
                        onChange={(e) => update("estimated_delivery_minutes", e.target.value)}
                        className="w-20 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                    />
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <label htmlFor="min_order_value">Pedido mínimo (R$)</label>
                    <input
                        id="min_order_value"
                        name="min_order_value"
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={form.min_order_value}
                        onChange={(e) => update("min_order_value", e.target.value)}
                        className="w-40 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="delivery_fee">Taxa de entrega (R$)</label>
                    <input
                        id="delivery_fee"
                        name="delivery_fee"
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={form.delivery_fee}
                        onChange={(e) => update("delivery_fee", e.target.value)}
                        className="w-40 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
                    />
                </div>
            </div>
        </div>
    );
}