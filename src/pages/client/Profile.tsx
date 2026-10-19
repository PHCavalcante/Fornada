import ClientHeader from "../../components/ClientHeader";
import profile from "../../assets/profile.svg";
import { palette } from "../../theme";
import trash from "../../assets/trash.svg";
import arrow from "../../assets/arrow.svg";

export default function Profile() {
    return (
        <div className="flex flex-col h-full">
            <ClientHeader title="Perfil" />
            <div className="flex flex-col items-center px-5 w-full h-full bg-white rounded-t-4xl shadow-[0px_-2px_4px_2px_rgba(0,_0,_0,_0.1)]">
                <div className="flex mt-9 rounded-full w-20 h-20 items-center justify-center" style={{ backgroundColor: palette.light.secondary }}>
                    <img src={profile} width={40} height={40} alt="Foto do usuário" />
                </div>
                <p className="mt-3.5 font-semibold text-[16px]">{"Nome Placeholder"}</p>
                <div className="flex justify-between items-center w-full mt-9">
                    <div className="flex flex-col">
                        <p className="font-bold">Dados pessoais</p>
                        <span className="text-sm">Visualize ou edite suas informações pessoais</span>
                    </div>
                    <button>
                        <img src={arrow} alt="Ir para a página de edição" />
                    </button>
                </div>
                 <div className="flex justify-between items-center w-full mt-9">
                    <div className="flex flex-col">
                        <p className="font-bold">Dados de entrega</p>
                        <span className="text-sm">Visualize ou altere a forma e endereço de entrega</span>
                    </div>
                    <button>
                        <img src={arrow} alt="Ir para a página de edição" />
                    </button>
                </div>
                 <div className="flex justify-between items-center w-full mt-9">
                    <div className="flex flex-col">
                        <p className="font-bold">Dados e privacidade</p>
                        <span className="text-sm">Contratos de privacidad, LGPD e mais</span>
                    </div>
                    <button>
                        <img src={arrow} alt="Ir para a página de edição" />
                    </button>
                </div>
                <button className="flex mt-auto mb-8 items-center justify-center gap-3.75 w-40 h-12 rounded-lg bg-red-600 text-white">
                    Deletar Conta
                    <img src={trash} alt="Deletar Conta" />
                </button>
            </div>
        </div>
    );
}