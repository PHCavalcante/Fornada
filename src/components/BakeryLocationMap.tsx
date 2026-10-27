import { useEffect, useRef } from 'react'
import { divIcon, latLng } from 'leaflet'
import type { LatLngExpression, Marker as LeafletMarker } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const CENTRO_PAULO_AFONSO: LatLngExpression = [-9.3986, -38.2216]
const iconeMarcador = divIcon({
  className: 'bakery-map-pin',
  html: '<span aria-hidden="true"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
})

function CentralizarMapa({ ponto }: { ponto: { lat: number; lng: number } | null }) {
  const mapa = useMap()
  const latitude = ponto?.lat ?? null
  const longitude = ponto?.lng ?? null
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      mapa.setView([latitude, longitude], Math.max(mapa.getZoom(), 16))
    }
  }, [mapa, latitude, longitude])
  return null
}

function CliqueNoMapa({ aoSelecionar }: { aoSelecionar: (ponto: { lat: number; lng: number }) => void }) {
  useMapEvents({ click: (evento) => aoSelecionar({ lat: evento.latlng.lat, lng: evento.latlng.lng }) })
  return null
}

export default function BakeryLocationMap({
  ponto,
  aoSelecionar,
}: {
  ponto: { lat: number; lng: number } | null
  aoSelecionar: (ponto: { lat: number; lng: number }) => void
}) {
  const marcadorRef = useRef<LeafletMarker | null>(null)
  const centro: LatLngExpression = ponto ? [ponto.lat, ponto.lng] : CENTRO_PAULO_AFONSO

  function terminarArrasto() {
    const posicao = marcadorRef.current?.getLatLng()
    if (posicao) aoSelecionar({ lat: posicao.lat, lng: posicao.lng })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <MapContainer center={centro} zoom={ponto ? 16 : 13} className="h-72 w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CentralizarMapa ponto={ponto} />
        <CliqueNoMapa aoSelecionar={aoSelecionar} />
        {ponto && (
          <Marker
            position={latLng(ponto.lat, ponto.lng)}
            icon={iconeMarcador}
            draggable
            ref={marcadorRef}
            eventHandlers={{ dragend: terminarArrasto }}
          />
        )}
      </MapContainer>
    </div>
  )
}
