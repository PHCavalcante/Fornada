import logo from "../../assets/logo.png";
import { palette } from "../../theme";
import { Link, useNavigate } from "@tanstack/react-router";
import Step1Dados from "../../components/forms/Step1Dados";
import { useState } from "react";
import Step2Endereco from "../../components/forms/Step2Endereco";
import Step3Entrega from "../../components/forms/Step3Entrega";
import Step4Configuracoes from "../../components/forms/Step4Configuracoes.";
import Step5Finalizacao from "../../components/forms/Step5Finalizacao";
import { useAuth } from "../../contexts/AuthContext";
import { CADASTRO_INICIAL, type CadastroBakery } from "../../types/bakery";
import { cnpjDisponivel, criarBakery, geocodificarEnderecoPadaria, padariaDoProprietarioExiste, salvarCadastroPendente, validarStep } from "../../utils/bakery";
import { mensagemDeErro, validatePassword } from "../../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const { signUp, session, profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<CadastroBakery>(CADASTRO_INICIAL);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  function update<K extends keyof CadastroBakery>(campo: K, valor: CadastroBakery[K]) {
    setForm(atual => ({ ...atual, [campo]: valor }));
  }

  const steps = [Step1Dados, Step2Endereco, Step3Entrega, Step4Configuracoes, Step5Finalizacao];
  const StepAtual = steps[currentStep];

  const ultimoStep = steps.length - 1;

  function avancar() {
    setErro(null);

    const erroDoStep = validarStep(currentStep, form);
    if (erroDoStep) {
      setErro(erroDoStep);
      return;
    }

    if (currentStep === ultimoStep) {
      void finalizar();
      return;
    }

    setCurrentStep(s => s + 1);
  }

  function voltar() {
    setErro(null);
    setCurrentStep(s => Math.max(0, s - 1));
  }

  async function finalizar() {
    setErro(null);

    const erroDeSenha = validatePassword(form.password, form.confirmPassword);
    if (erroDeSenha) {
      setErro(erroDeSenha);
      return;
    }

    setEnviando(true);

    try {
      const ownerIdSessaoAtual = session
        && profile?.role === "owner"
        && session.user.email?.toLowerCase() === form.email.trim().toLowerCase()
        ? session.user.id
        : null;

      if (ownerIdSessaoAtual && await padariaDoProprietarioExiste(ownerIdSessaoAtual)) {
        navigate({ to: "/bakery/Dashboard", replace: true });
        return;
      }

      if (!(await cnpjDisponivel(form.cnpj))) {
        setErro("Já existe uma padaria cadastrada com este CNPJ.");
        setEnviando(false);
        return;
      }

      const coordenadas = await geocodificarEnderecoPadaria(form);

      let ownerId: string;

      if (ownerIdSessaoAtual) {
        ownerId = ownerIdSessaoAtual;
      } else {
        const resultado = await signUp({
          email: form.email.trim(),
          password: form.password,
          role: "owner",
          fullName: form.name.trim(),
          phone: form.phone.trim(),
        });

        // Sem sessão, o Supabase exigiu a confirmação por e-mail: os dados ficam
        // guardados e a padaria é criada no primeiro login.
        if (resultado.confirmationRequired || !resultado.session) {
          salvarCadastroPendente(form, coordenadas);
          setEmailEnviado(true);
          setEnviando(false);
          return;
        }

        ownerId = resultado.session.user.id;
      }

      await criarBakery(ownerId, form, coordenadas);
      navigate({ to: "/bakery/Dashboard", replace: true });
    } catch (erroCadastro) {
      setErro(mensagemDeErro(erroCadastro));
      setEnviando(false);
    }
  }

  if (emailEnviado) {
    return (
      <div className="flex flex-col h-full items-center px-9.5 text-center">
        <div className="flex flex-col mt-9.5 items-center">
          <img src={logo} alt="Logo" className="select-none" draggable={false} />
          <span className="text-xl" style={{ color: palette.light.accent }}>
            {"Placeholder"}
          </span>
        </div>
        <h1 className="text-2xl font-bold mt-10">Confira seu e-mail</h1>
        <p className="text-gray-600 mt-2.5 max-w-80">
          Enviamos um link de confirmação para {form.email}. Depois de confirmar, entre em
          {" "}
          <Link to="/bakery/Login" className="font-semibold underline" viewTransition>
            Entrar
          </Link>{" "}
          e o cadastro da padaria será concluído automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center px-9.5 overflow-y-auto pb-6">
      <div className="flex flex-col mt-9.5 items-center">
        <img src={logo} alt="Logo" className="select-none" draggable={false} />
        <span className="text-xl" style={{ color: palette.light.accent }}>
          {"Placeholder"}
        </span>
      </div>
      <h1 className="text-2xl font-bold mt-10">Registre sua padaria</h1>
       <div className="flex items-center justify-center mt-6">
        {steps.map((_, index) => (
          <div className="flex items-center" key={index}>
            <div
              className={`flex w-7 h-7 border rounded-full items-center content-center justify-center ${
                index <= currentStep ? "bg-black text-white" : ""
              }`}
            >
              {index + 1}
            </div>

            {index < steps.length - 1 && (
              <div
                className={`w-8 h-px bg-black ${
                  index < currentStep ? "active" : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <StepAtual form={form} update={update} />
      {erro && <p className="text-red-600 text-sm text-center mt-4">{erro}</p>}
      <div className="flex gap-4 mt-6">
        {currentStep > 0 && (
          <button
            type="button"
            disabled={enviando}
            onClick={voltar}
            className="w-40 h-10 rounded-lg border border-black disabled:opacity-60"
          >
            Voltar
          </button>
        )}
        <button
          type="button"
          disabled={enviando}
          className="w-80 h-10 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: palette.light.accent }}
          onClick={avancar}
        >
          {enviando
            ? "Criando conta..."
            : currentStep === ultimoStep
              ? "Finalizar"
              : "Próximo"}
        </button>
      </div>
      <div className="mt-4 text-sm py-10">
        <span className="text-gray-600">Já possui conta? </span>
        <Link to="/bakery/Login" viewTransition>Faça Login</Link>
      </div>
    </div>
  );
}
