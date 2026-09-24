import { haversineDistanceKm, OSM_USER_AGENT, type LatLon, type SupportPoint } from './overpass';

interface NominatimResult {
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
  };
}

const KM_PER_DEGREE_LAT = 111.32;

function composeAddress(address?: NominatimResult['address']): string | undefined {
  if (!address) return undefined;
  const streetLine = address.road
    ? [address.road, address.house_number].filter(Boolean).join(', ')
    : undefined;
  const parts = [streetLine, address.suburb].filter(Boolean);
  return parts.length > 0 ? parts.join(' — ') : undefined;
}

const MAX_POINTS = 5;
const INITIAL_SEARCH_KM = 2;

// Nominatim answers in well under a second, while the public Overpass
// instances regularly time out — so it is the primary source.
export async function findNearbySupportPointsNominatim(
  origin: LatLon,
  radiusMeters = 5000
): Promise<SupportPoint[]> {
  const radiusKm = radiusMeters / 1000;
  // Nominatim ranks by importance, not distance, and caps results at 40 —
  // a small box first keeps the closest stations from being cut off.
  const searchRadii = radiusKm > INITIAL_SEARCH_KM ? [INITIAL_SEARCH_KM, radiusKm] : [radiusKm];

  let points: SupportPoint[] = [];
  for (const searchKm of searchRadii) {
    points = await searchPoliceWithin(origin, searchKm);
    if (points.length >= MAX_POINTS) break;
  }
  return points.slice(0, MAX_POINTS);
}

async function searchPoliceWithin(origin: LatLon, radiusKm: number): Promise<SupportPoint[]> {
  const dLat = radiusKm / KM_PER_DEGREE_LAT;
  const dLon = radiusKm / (KM_PER_DEGREE_LAT * Math.cos((origin.lat * Math.PI) / 180));
  const viewbox = [origin.lon - dLon, origin.lat + dLat, origin.lon + dLon, origin.lat - dLat].join(',');

  const params = new URLSearchParams({
    q: 'police',
    format: 'jsonv2',
    addressdetails: '1',
    limit: '40',
    bounded: '1',
    viewbox,
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': OSM_USER_AGENT, 'Accept-Language': 'pt-BR' },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Nominatim respondeu com status ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];

  return results
    .map((result): SupportPoint => {
      const lat = Number(result.lat);
      const lon = Number(result.lon);
      return {
        id: String(result.osm_id),
        name: result.name || 'Delegacia de Polícia',
        lat,
        lon,
        distanceKm: haversineDistanceKm(origin, { lat, lon }),
        address: composeAddress(result.address),
      };
    })
    .filter((point) => Number.isFinite(point.distanceKm) && point.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
