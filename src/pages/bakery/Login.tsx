import logo from "../../assets/logo.png";
import { palette } from "../../theme";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { mensagemDeErro } from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const profile = await signIn(email.trim(), password);
      navigate({ to: profile.role === "owner" ? "/bakery/Dashboard" : "/", replace: true });
    } catch (erroLogin) {
      setErro(mensagemDeErro(erroLogin));
      setEnviando(false);
    }
  }

  return (
     <div className="flex h-full flex-col items-center overflow-y-auto px-4 pb-8 sm:px-8">
      <div className="mt-6 flex flex-col items-center sm:mt-9.5">
        <img src={logo} alt="Logo" className="select-none" draggable={false} />
        <span className="text-xl" style={{ color: palette.light.accent }}>
          {"Placeholder"}
        </span>
      </div>
      <h1 className="text-2xl font-bold mt-10">Entrar</h1>
      <form className="mt-6 flex w-full max-w-80 flex-col gap-4" onSubmit={entrar}>
        <div className="flex flex-col">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="mt-2 h-12 w-full rounded-lg text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: palette.light.accent }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-4 text-sm py-10">
        <span className="text-gray-600">Padaria não registrada? </span>
        <Link to="/bakery/Register" viewTransition>Registre-se</Link>
      </div>
    </div>
  );
}
