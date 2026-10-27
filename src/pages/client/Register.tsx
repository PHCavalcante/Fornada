import logo from "../../assets/logo.png";
import { palette } from "../../theme";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";
import { mensagemDeErro, validatePassword } from "../../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  async function cadastrar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    const erroDeSenha = validatePassword(password, confirmPassword);
    if (erroDeSenha) {
      setErro(erroDeSenha);
      return;
    }

    setEnviando(true);

    try {
      const { confirmationRequired } = await signUp({
        email: email.trim(),
        password,
        role: "customer",
        fullName: fullName.trim(),
      });

      if (confirmationRequired) {
        setEmailEnviado(true);
        setEnviando(false);
        return;
      }

      navigate({ to: "/", replace: true });
    } catch (erroCadastro) {
      setErro(mensagemDeErro(erroCadastro));
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
      <h1 className="text-2xl font-bold mt-10">Crie sua conta</h1>

      {emailEnviado ? (
        <div className="flex flex-col items-center mt-10 text-center">
          <p className="font-semibold">Confira seu e-mail</p>
          <p className="text-gray-600 mt-2.5">
            Enviamos um link de confirmação para {email}. Depois de confirmar, você já pode entrar.
          </p>
          <Link to="/client/Login" className="mt-6 font-semibold underline" viewTransition>
            Voltar para o login
          </Link>
        </div>
      ) : (
        <>
          <form className="flex flex-col gap-4 mt-6" onSubmit={cadastrar}>
            <div className="flex flex-col">
              <label htmlFor="fullName">Nome completo</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-80 h-12 rounded-lg border border-black px-4 focus:outline-none focus:ring-2"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {enviando ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>
          <div className="mt-8 text-sm">
            <span className="text-gray-600">Já possui conta? </span>
            <Link to="/client/Login" className="font-semibold" viewTransition>
              Faça login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
