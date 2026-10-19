import Menu from "../../components/Menu";
import { palette } from "../../theme";
import calendar from "../../assets/caledar.svg";
import clock from "../../assets/clock.svg";
import money from "../../assets/money.svg";


function OrderCard() {
  return (
    <div className="flex  flex-col w-60 bg-white rounded-lg p-3 shadow-md">
      <div className="flex justify-between mb-5">
        <p className="font-bold text-[20px]">{"#01"}</p>
        <span className="rounded-full p-2" style={{ backgroundColor: palette.light.secondary, color: palette.light.primary }}>{"Pronto"}</span>
      </div>
      <div>
        <div className="flex gap-1">
          <img src={calendar} alt="Data do pedido" />
          <p>{"03/10/2026"}</p>
        </div>
        <div className="flex gap-1">
          <img src={clock} alt="Horário do pedido" />
          <p>{"16:33"}</p>
        </div>
        <div className="flex gap-1">
          <img src={money} alt="Valor do pedido" />
          <p>{"R$ 6,33"}</p>
        </div>
      </div>
      <button className="text-white rounded-lg py-1.5 px-2 mt-4 self-center mx-auto cursor-pointer" style={{ backgroundColor: palette.light.primary }}>Marcar como {"Pronto"}</button>
    </div>
  );
}

export default function Orders() {
  const orders =[] // mock só pra placeholder
  return (
    <div className="flex">
      <Menu />
      <div className="flex w-full flex-col ml-14.75">
        <h1 className="font-bold text-3xl mt-11.25 mb-24" style={{ color: palette.light.accent }}>Pedidos</h1>
        <div className="flex flex-wrap gap-4">
          {orders.length === 0 ? (
            <p className="text-xl text-center mx-auto font-bold">Sem pedidos no momento</p>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
