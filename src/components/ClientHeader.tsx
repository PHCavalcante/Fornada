import back from "../assets/back.svg";
import { Link } from "@tanstack/react-router";

type ClientHeaderProps = {
    showClearButton?: boolean;
    title: string;
};

export default function ClientHeader({ showClearButton, title }: ClientHeaderProps) {
    return (
        <div className="flex items-center w-full justify-between px-6 py-4">
            <Link to="..">
                <img src={back} width={18} height={16} alt="Botão Voltar" />
            </Link>
            <h1 className="font-bold">{title}</h1>
            {showClearButton && <button className="text-red-600">{"Limpar"}</button>}
            {showClearButton || <div />}
        </div>
    );
}