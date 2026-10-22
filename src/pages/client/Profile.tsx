import { useState } from "react";
import ClientHeader from "../../components/ClientHeader";
import profileImagePlaceholder from "../../assets/profile.svg";
import { palette } from "../../theme";
import trash from "../../assets/trash.svg";
import arrow from "../../assets/arrow.svg";
import { useAuth } from "../../contexts/AuthContext";

type ProfileModalKey = "personal" | "delivery" | "privacy";

type ProfileModalContent = {
    title: string;
    summary: string;
    body: string;
};

const profileModalContent: Record<ProfileModalKey, ProfileModalContent> = {
    personal: {
        title: "Dados pessoais",
        summary: "Visualize ou edite suas informações pessoais.",
        body: "Aqui serão exibidos os dados do perfil, como nome, telefone, e-mail e informações gerais do usuário. Este modal é apenas visual e não possui integração com dados reais.",
    },
    delivery: {
        title: "Dados de entrega",
        summary: "Visualize ou altere a forma e endereço de entrega.",
        body: "Nesta área pode ser exibido o endereço principal, preferências de entrega, método de entrega e outras informações relevantes para a compra. Este bloco é apenas de demonstração visual.",
    },
    privacy: {
        title: "Dados e privacidade",
        summary: "Consulte as políticas, LGPD e demais informações de privacidade.",
        body: "Aqui podem aparecer informações sobre privacidade, consentimento, proteção de dados e termos do aplicativo. Esta tela foi criada apenas para apresentar o modal no fluxo do perfil.",
    },
};

export default function Profile() {
    const { profile } = useAuth();
    const [activeModal, setActiveModal] = useState<ProfileModalContent | null>(null);

    const openModal = (key: ProfileModalKey) => {
        setActiveModal(profileModalContent[key]);
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <ClientHeader title="Perfil" />
                <div className="flex flex-col items-center px-5 w-full h-full bg-white rounded-t-4xl shadow-[0px_-2px_4px_2px_rgba(0,0,0,0.1)]">
                    <div className="flex mt-9 rounded-full w-20 h-20 items-center justify-center" style={{ backgroundColor: palette.light.secondary }}>
                        <img src={profile?.avatar_url ?? profileImagePlaceholder} width={40} height={40} alt="Foto do usuário" />
                    </div>
                    <p className="mt-3.5 font-semibold text-[16px]">{profile?.full_name}</p>
                    <button className="flex justify-between items-center w-full mt-9" type="button" onClick={() => openModal("personal")} aria-label="Abrir dados pessoais">
                        <div className="flex flex-col items-start">
                            <p className="font-bold">Dados pessoais</p>
                            <span className="text-sm">Visualize ou edite suas informações pessoais</span>
                        </div>
                        <img src={arrow} alt="Ir para a página de edição" />
                    </button>
                    <button className="flex justify-between items-center w-full mt-9" type="button" onClick={() => openModal("delivery")} aria-label="Abrir dados de entrega">
                        <div className="flex flex-col items-start">
                            <p className="font-bold">Dados de entrega</p>
                            <span className="text-sm">Visualize ou altere a forma e endereço de entrega</span>
                        </div>
                        <img src={arrow} alt="Ir para a página de edição" />
                    </button>
                    <button className="flex justify-between items-center w-full mt-9" type="button" onClick={() => openModal("privacy")} aria-label="Abrir dados e privacidade">
                        <div className="flex flex-col items-start">
                            <p className="font-bold">Dados e privacidade</p>
                            <span className="text-sm">Contratos de privacidad, LGPD e mais</span>
                        </div>
                        <img src={arrow} alt="Ir para a página de edição" />
                    </button>
                    <button className="flex mt-auto mb-8 items-center justify-center gap-3.75 w-40 h-12 rounded-lg bg-red-600 text-white" type="button">
                        Deletar Conta
                        <img src={trash} alt="Deletar Conta" />
                    </button>
                </div>
            </div>

            {activeModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={activeModal.title}
                        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.18)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Perfil</p>
                                <h2 className="mt-1 text-xl font-bold text-zinc-900">{activeModal.title}</h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Fechar modal"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-700"
                                onClick={() => setActiveModal(null)}
                            >
                                ×
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-zinc-600">{activeModal.summary}</p>

                        <div className="mt-5 rounded-xl bg-zinc-50 p-4">
                            <p className="text-sm leading-6 text-zinc-700">{activeModal.body}</p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="rounded-lg bg-[#F1713A] px-4 py-2 text-sm font-semibold text-white"
                                onClick={() => setActiveModal(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}