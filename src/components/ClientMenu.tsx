import { Link } from "@tanstack/react-router";
import home from "../assets/home.svg";
import orders from "../assets/orders.svg";
import profile from "../assets/profile.svg";
import search from "../assets/search.svg";
import { useLocation } from "@tanstack/react-router";

export default function ClientMenu() {
    const location = useLocation();

    return (
        <div className="flex w-full items-center mt-auto justify-between px-4 py-2">
            <Link to="/" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === "/" ? "#000" : "#888" }}>
                <img src={home} alt="Início"/>
                Home
            </Link>
            <Link to="/client/orders" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === "/client/orders" ? "#000" : "#888" }}>
                <img src={orders} width={20} className="invert" alt="Pedidos" style={{ opacity: location.pathname === "/client/orders" ? "100%" : "75%" }} />
                Pedidos
            </Link>
             <Link to="/client/orders" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === "/client/orders" ? "#000" : "#888" }}>
                <img src={search} width={20} alt="Pedidos" style={{ opacity: location.pathname === "/client/orders" ? "100%" : "75%" }} />
                Busca
            </Link>
            {/* <Link to="/client/search">Busca</Link> */}
            <Link to="/client/profile" className="flex flex-col items-center" viewTransition style={{ color: location.pathname === "/client/profile" ? "#000" : "#888" }}>
                <img src={profile} alt="Perfil" style={{ opacity: location.pathname === "/client/profile" ? "100%" : "75%" }} />
                Perfil
            </Link>
        </div>
    );
}