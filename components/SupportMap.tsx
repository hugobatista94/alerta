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
  return (
    <MapContainer
      center={[origin.lat, origin.lon]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: '260px', width: '100%', borderRadius: '1rem' }}
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
            <br />
            {point.distanceKm.toFixed(1)} km de distância
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
