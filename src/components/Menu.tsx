import { palette } from "../theme";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "@tanstack/react-router";
import dashboardLogo from "../assets/dashboard.svg"
import ordersLogo from "../assets/orders.svg";
import exit from "../assets/exit.svg";
import { useLocation } from "@tanstack/react-router";
import manager from "../assets/manager.svg";
import catalog from "../assets/catalog.svg";
import { useAuth } from "../contexts/AuthContext";
import { mensagemDeErro } from "../utils/auth";
import { useState } from "react";

export default function Menu() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [erro, setErro] = useState<string | null>(null);

    async function logOut() {
        if (!confirm("Você tem certeza que deseja sair?")) return;
        try {
            await signOut();
            navigate({ to: "/bakery/Login", replace: true });
        } catch (erroLogout) {
            setErro(mensagemDeErro(erroLogout));
        }
    }

    return (
        <div style={{
            backgroundColor: palette.light.accent
        }}
        className="flex min-w-76.5 h-screen flex-col items-center shadow-[4px_0px_4px_0px_#00000055]"
        >
        <img src={Logo} alt="Logo" width={150} className="mt-4" draggable={false} />
        <span className="text-xl text-white">{"FORNADA"}</span>
        <div className="mt-20">
            <Link to={"/bakery/Dashboard"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/Dashboard" ? palette.light.primary : "transparent" }} className="flex w-61.5 items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={dashboardLogo} alt="Dashboard"/>
                Dashboard
            </Link>
            <Link to={"/bakery/Orders"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/Orders" ? palette.light.primary : "transparent" }} className="flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={ordersLogo} alt="Pedidos"/>
                Pedidos
            </Link>
              <Link to={"/bakery/Management"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/Management" ? palette.light.primary : "transparent" }} className="flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={manager} alt="Gerência"/>
                Gerência
            </Link>
              <Link to={"/bakery/Catalog"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/Catalog" ? palette.light.primary : "transparent" }} className="flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={catalog} alt="Catálogo"/>
                Catálogo
            </Link>
        </div>
        <button onClick={logOut} className="mt-auto mb-4 cursor-pointer flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg">
            <img src={exit} alt="botão sair" />    
            Sair
        </button>
        {erro && <p className="mb-2 text-sm text-white text-center">{erro}</p>}
        </div>
    );
}