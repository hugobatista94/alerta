import type { LatLon, SupportPoint } from './overpass';

// Browser-side entry point: the OpenStreetMap lookup runs in /api/nearby because
// the upstream APIs require a User-Agent that browsers are not allowed to set.
export async function fetchNearbySupportPoints(origin: LatLon): Promise<SupportPoint[]> {
  const response = await fetch('/api/nearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(origin),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    throw new Error(`Busca de apoio próximo respondeu com status ${response.status}`);
  }

  const data = (await response.json()) as { points: SupportPoint[] };
  return data.points;
}
