import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../../../utils/supabase'
import type { BakeryForm } from '../../../types/bakery'
import ClientHeader from '../../../components/ClientHeader'
import { palette } from '../../../theme'
import logo from '../../../assets/logo.png'
import location from '../../../assets/location.svg'

export const Route = createFileRoute("/client/bakery/$bakery")({
  //   loader: ({ params }) => {

  // }
  component: RouteComponent,
})

function RouteComponent() {
  const { bakery }: { bakery: BakeryForm } = Route.useParams()

  return (
    <div className='flex flex-col h-full'>
      <ClientHeader title="" showClearButton={false} turnAbsolute={true} />
      <div className="flex w-full h-24 relative shadow-md" style={{ backgroundColor: palette.light.primary }}>
        <img src={logo} alt='Logo padaria' width={150} height={150} className='rounded-full shadow-lg bg-white absolute -bottom-5 left-1/2 transform -translate-x-1/2' /> {/* logo apenas de placeholder */}
      </div>
      <h1 className='text-center mt-11 font-semibold text-[20px]'>{"Placeholder nome"}</h1>
      {/* <span>{}</span> lugar das estrelas */}
      <div className='flex self-center gap-0.75 items-center mt-2 opacity-60'>
        <span className='font-semibold'>{"2km"}</span>
        <img src={location} alt='Distância' />
      </div>
    </div>
  );
}
