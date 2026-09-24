import { NextResponse } from 'next/server';
import { parseOrigin } from '@/lib/overpass';
import { findSupportPoints } from '@/lib/supportPoints';

// Nominatim (8s) plus two Overpass fallbacks (12s each).
export const maxDuration = 40;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const origin = parseOrigin(body);
  if (!origin) {
    return NextResponse.json({ error: 'Localização inválida' }, { status: 400 });
  }

  try {
    const points = await findSupportPoints(origin);
    return NextResponse.json({ points });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível buscar pontos de apoio próximos' },
      { status: 502 }
    );
  }
}
