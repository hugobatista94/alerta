import { findNearbySupportPointsNominatim } from './nominatim';
import { findNearbySupportPoints, type LatLon, type SupportPoint } from './overpass';

// Server-side lookup used by /api/nearby: Nominatim first, Overpass as fallback.
export async function findSupportPoints(origin: LatLon): Promise<SupportPoint[]> {
  try {
    return await findNearbySupportPointsNominatim(origin);
  } catch {
    return findNearbySupportPoints(origin);
  }
}
