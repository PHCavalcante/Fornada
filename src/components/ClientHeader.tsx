import back from "../assets/back.svg";
import { Link } from "@tanstack/react-router";

type ClientBackRoute = "/" | "/client" | "/client/Orders";

type ClientHeaderProps = {
    showClearButton?: boolean;
    onClear?: () => void;
    title: string;
    turnAbsolute?: boolean;
    backTo?: ClientBackRoute;
};

export default function ClientHeader({ showClearButton, onClear, title, turnAbsolute, backTo = "/client" }: ClientHeaderProps) {
    return (
        <div className="flex items-center w-full justify-between px-6 py-4 z-10" style={{ position: turnAbsolute ? "absolute" : "static" }}>
            <Link to={backTo} aria-label="Voltar">
                <img src={back} width={18} height={16} alt="Botão Voltar" />
            </Link>
            <h1 className="font-bold">{title}</h1>
            {showClearButton && <button type="button" onClick={onClear} className="text-red-600">{"Limpar"}</button>}
            {showClearButton || <div />}
        </div>
    );
}
