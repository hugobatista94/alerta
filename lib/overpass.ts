export interface LatLon {
  lat: number;
  lon: number;
}

export interface SupportPoint extends LatLon {
  id: string;
  name: string;
  distanceKm: number;
  address?: string;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: LatLon, b: LatLon): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:suburb'?: string;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function composeAddress(tags?: OverpassElement['tags']): string | undefined {
  if (!tags) return undefined;
  const street = tags['addr:street'];
  const houseNumber = tags['addr:housenumber'];
  const suburb = tags['addr:suburb'];

  const streetLine = street
    ? [street, houseNumber].filter(Boolean).join(', ')
    : undefined;

  const parts = [streetLine, suburb].filter(Boolean);
  return parts.length > 0 ? parts.join(' — ') : undefined;
}

export async function findNearbySupportPoints(
  origin: LatLon,
  radiusMeters = 5000
): Promise<SupportPoint[]> {
  const query = `[out:json][timeout:15];(node["amenity"="police"](around:${radiusMeters},${origin.lat},${origin.lon});way["amenity"="police"](around:${radiusMeters},${origin.lat},${origin.lon}););out center;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Overpass API respondeu com status ${response.status}`);
  }

  const data = (await response.json()) as OverpassResponse;

  return data.elements
    .map((element): SupportPoint | null => {
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (lat === undefined || lon === undefined) return null;
      return {
        id: String(element.id),
        name: element.tags?.name ?? 'Delegacia de Polícia',
        lat,
        lon,
        distanceKm: haversineDistanceKm(origin, { lat, lon }),
        address: composeAddress(element.tags),
      };
    })
    .filter((point): point is SupportPoint => point !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);
}
