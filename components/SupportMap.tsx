'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { SupportPoint } from '@/lib/overpass';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface SupportMapProps {
  origin: { lat: number; lon: number };
  points: SupportPoint[];
}

export default function SupportMap({ origin, points }: SupportMapProps) {
  // Frame the user and every support point; fall back to a fixed zoom when alone.
  const bounds =
    points.length > 0
      ? L.latLngBounds([
          [origin.lat, origin.lon],
          ...points.map((point): [number, number] => [point.lat, point.lon]),
        ])
      : undefined;

  return (
    // MapContainer ignores `bounds` whenever center+zoom are set.
    <MapContainer
      center={bounds ? undefined : [origin.lat, origin.lon]}
      zoom={bounds ? undefined : 14}
      bounds={bounds}
      // Extra top padding: markers are 41px tall and anchored at their tip.
      boundsOptions={{ paddingTopLeft: [24, 56], paddingBottomRight: [24, 16] }}
      scrollWheelZoom={false}
      className="h-[220px] sm:h-[280px] lg:h-[320px]"
      style={{ width: '100%', borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[origin.lat, origin.lon]} icon={markerIcon}>
        <Popup>Você está aqui</Popup>
      </Marker>
      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lon]} icon={markerIcon}>
          <Popup>
            {point.name}
            {point.address && (
              <>
                <br />
                <span style={{ fontSize: '0.85em', opacity: 0.8 }}>{point.address}</span>
              </>
            )}
            <br />
            {point.distanceKm.toFixed(1)} km de distância
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
