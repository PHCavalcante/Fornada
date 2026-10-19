import type { StepProps } from "./types";
import { PASSWORD_MIN_LENGTH } from "../../utils/auth";

export default function Step1Dados({ form, update }: StepProps) {
    return (
        <div className="flex flex-col gap-4 mt-6">
           <div className="flex flex-col">
          <label htmlFor="name">Nome da padaria</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-80 h-10 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
         <div className="flex flex-col">
          <label htmlFor="phone">Telefone/Whatsapp</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-80 h-10 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
         <div className="flex flex-col">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => update("cnpj", e.target.value)}
            className="w-80 h-10 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-80 h-10 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-80 h-10 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className="w-80 h-10 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
      </div>
    );
}