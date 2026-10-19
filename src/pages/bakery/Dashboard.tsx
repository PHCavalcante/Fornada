import Menu from "../../components/Menu"
import { palette } from "../../theme";
import { useAuth } from "../../contexts/AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="flex">
      <Menu />
      <div className="flex flex-col ml-14.75">
        <h1 className="font-bold text-3xl mt-11.25 mb-4" style={{ color: palette.light.accent }}>Dashboard</h1>
        {profile && <p className="mb-16 text-gray-700">Bem-vindo, {profile.full_name}</p>}
        <div className="flex gap-11.75">
          <div style={{ backgroundColor: palette.light.accent }} className="flex min-w-51.25 flex-col items-center gap-4 p-4 rounded-lg h-fit text-white text-[20px] font-bold mr-14.75 shadow-[0px_4px_4px_0px_#00000055]">
            <p className="text-[24px]">Lucro total</p>
            <p className="text-[32px]">{`R$ 0,00`}</p>
          </div>
          <div style={{ backgroundColor: palette.light.accent }} className="flex flex-col items-center gap-2 p-4 rounded-lg h-fit text-white text-[14px] font-bold shadow-[0px_4px_4px_0px_#00000055]">
            <p>Pedidos entregues</p>
            <p className="text-[20px]">{`0`}</p>
          </div>
          <div style={{ backgroundColor: palette.light.accent }} className="flex flex-col items-center gap-2 p-4 rounded-lg h-fit text-white text-[14px] font-bold shadow-[0px_4px_4px_0px_#00000055]">
            <p>Pedidos em espera</p>
            <p className="text-[20px]">{`0`}</p>
          </div>
          <div style={{ backgroundColor: palette.light.accent }} className="flex flex-col items-center gap-2 p-4 rounded-lg h-fit text-white text-[14px] font-bold shadow-[0px_4px_4px_0px_#00000055]">
            <p>Pedidos cancelados</p>
            <p className="text-[20px]">{`0`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
