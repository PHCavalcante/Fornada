import { palette } from "../theme";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "@tanstack/react-router";
import dashboardLogo from "../assets/dashboard.svg"
import ordersLogo from "../assets/orders.svg";
import exit from "../assets/exit.svg";
import { useLocation } from "@tanstack/react-router";
import manager from "../assets/manager.svg";
import catalog from "../assets/catalog.svg";

export default function Menu() {
    const location = useLocation();
    const navigate = useNavigate();
    
    function logOut() {
        if (confirm("Você tem certeza que deseja sair?")) {
            // implementar a lógica de logout
            navigate({ to: "/bakery/login", replace: true})
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
            <Link to={"/bakery/dashboard"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/dashboard" ? palette.light.primary : "transparent" }} className="flex w-61.5 items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={dashboardLogo} alt="Dashboard"/>
                Dashboard
            </Link>
            <Link to={"/bakery/orders"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/orders" ? palette.light.primary : "transparent" }} className="flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={ordersLogo} alt="Pedidos"/>
                Pedidos
            </Link>
              <Link to={"/bakery/management"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/management" ? palette.light.primary : "transparent" }} className="flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={manager} alt="Gerência"/>
                Gerência
            </Link>
              <Link to={"/bakery/catalog"} viewTransition style={{ backgroundColor: location.pathname === "/bakery/catalog" ? palette.light.primary : "transparent" }} className="flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg mb-4">
                <img src={catalog} alt="Catálogo"/>
                Catálogo
            </Link>
        </div>
        <button onClick={logOut} className="mt-auto mb-4 cursor-pointer flex items-center gap-3.5 text-white text-[20px] font-bold px-4 py-2 rounded-lg">
            <img src={exit} alt="botão sair" />    
            Sair
        </button>
        </div>
    );
}