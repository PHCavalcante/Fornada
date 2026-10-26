import ClientHeader from '../../components/ClientHeader'

export default function TrackOrder() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ClientHeader title="Acompanhar pedido" />
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-amber-800">
              <path d="M7 3.75h7l4 4v12.5H7zM14 3.75v4h4M10 12h5M10 15.5h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </span>
          <h1 className="mt-5 text-xl font-bold">Acompanhe seu pedido</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            O acompanhamento ficará disponível quando a criação de pedidos estiver integrada.
          </p>
        </div>
      </main>
    </div>
  )
}
