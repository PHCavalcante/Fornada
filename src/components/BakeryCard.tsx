import heart from '../assets/heart.svg'
import placeholder from '../assets/logo.png'
import { Link } from '@tanstack/react-router'

type BakeryCardProps = {
  id: string
  name: string
  address: string
  distanceKm: number | null
  rating: number
  ratingCount: number
  imageUrl: string | null
}

export default function BakeryCard({
  id,
  name,
  address,
  distanceKm,
  rating,
  ratingCount,
  imageUrl,
}: BakeryCardProps) {
  return (
    <div className="flex items-center gap-6.25">
      <Link
        to="/client/bakery/$bakery"
        params={{ bakery: id }}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <img
          src={imageUrl || placeholder}
          alt={`Imagem da ${name}`}
          className="h-24 w-24 shrink-0 select-none rounded-lg object-cover"
          draggable={false}
        />
        <div className="min-w-0">
          <h2 className="truncate">{name}</h2>
          <span className="text-sm text-gray-600">
            {address} - <span className="font-bold">{distanceKm === null ? 'Distância indisponível' : `${distanceKm.toFixed(1)} km`}</span>
          </span>
          <div className="text-sm text-gray-600">
            {ratingCount > 0 ? `★ ${rating.toFixed(1)} (${ratingCount} avaliações)` : 'Ainda sem avaliações'}
          </div>
        </div>
      </Link>
      <button type="button" aria-label={`Favoritar ${name}`}>
        <img src={heart} alt="" className="h-5 w-5 select-none" draggable={false} />
      </button>
    </div>
  )
}
