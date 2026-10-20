import ClientMenu from "../../components/ClientMenu";
import ClientHeader from "../../components/ClientHeader";

export default function Orders() {
    const orders = [] // Placeholder para dados de pedidos

    return (
        <div className="flex flex-col h-full">
            <ClientHeader title="Pedidos" showClearButton={orders.length > 0} />
            {orders.length === 0 && 
            <p className="text-center text-lg my-auto">
                Nenhum pedido encontrado
            </p>}
            <ClientMenu />
        </div>
    );
}