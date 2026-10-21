import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../../../utils/supabase'
import type { BakeryForm } from '../../../types/bakery'
import ClientHeader from '../../../components/ClientHeader'
import { palette } from '../../../theme'
import logo from '../../../assets/logo.png'
import location from '../../../assets/location.svg'
import { useState } from 'react'

export const Route = createFileRoute("/client/bakery/$bakery")({
  //   loader: ({ params }) => {

  // }
  component: RouteComponent,
})

function RouteComponent() {
  const { bakery }: { bakery: BakeryForm } = Route.useParams()
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
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
        <div className='px-5.5 mt-14'>
          <h1 className='font-semibold text-[18px]'>{"Placeholder categoria"}</h1>
          <button className='flex flex-col mt-7.5' onClick={() => {setOpenModal(true)}}>
            <img src={logo} alt='' /> {/* logo apenas de placeholder */}
            <p className='text-center'>{"Produto"}</p>
          </button>
        </div>
      </div>
      {openModal && (
        <div className='w-full h-full fixed inset-0 z-50 flex flex-col'>
            <img src={logo} className='w-full' alt="imagem do produto" />
            <div className='bg-white rounded-tl-4xl rounded-tr-4xl p-5.5 flex justify-between overflow-y-auto max-h-dvh h-dvh flex-1'>
              <div className='flex flex-col w-full'>
                <h1 className='font-semibold text-[20px]'>{"Placeholder nome"}</h1>
                <p className='text-[14px] text-gray-500'>{"Placeholder descrição"}</p>
                <span>{"R$ 0,00"}</span>
                <span className='font-semibold text-[16px] mt-auto'>Quantidade</span>
                <div className='w-full flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <button className='rounded-lg' style={{ color: palette.light.accent }}>{"-"}</button>
                    <span className='mx-2'>{"1"}</span>
                    <button className='rounded-lg' style={{ color: palette.light.accent }}>{"+"}</button>
                  </div>
                  <button style={{ backgroundColor: palette.light.accent }} className='text-white font-semibold rounded-lg h-10 px-4'>Adicionar ao pedido {"$0,00"}</button>
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
