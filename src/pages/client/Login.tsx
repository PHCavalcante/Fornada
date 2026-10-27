import logo from "../../assets/logo.png";
import { palette } from "../../theme";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
    <div className="flex flex-col h-full items-center px-9.5">
      <div className="flex flex-col mt-9.5 items-center">
        <img src={logo} alt="Logo" className="select-none" draggable={false} />
        <span className="text-xl" style={{ color: palette.light.accent }}>
          {"Fornada"}
        </span>
      </div>
      <h1 className="text-2xl font-bold mt-10">Bem-vindo de volta!</h1>
      <p className="text-gray-600 text-center mt-2.5">Faça login em sua conta</p>
      <form className="flex flex-col gap-4 mt-6" onSubmit={entrar}>
        <div className="flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
            className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
          />
        </div>
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="w-80 h-12 text-white rounded-lg mt-2 hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: palette.light.accent }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-8 text-sm">
        <span className="text-gray-600">Não possui conta? </span>
        <Link to="/client/Register" className="font-semibold" viewTransition>
          Registre-se
        </Link>
      </div>
    </div>
  );
}
