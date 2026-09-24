'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { NATIONAL_SUPPORT_CHANNELS } from '@/lib/supportChannels';
import { fetchNearbySupportPoints } from '@/lib/nearbySupport';
import type { SupportPoint } from '@/lib/overpass';

const SupportMap = dynamic(() => import('./SupportMap'), { ssr: false });

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export function SupportCard() {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [origin, setOrigin] = useState<{ lat: number; lon: number } | null>(null);
  const [points, setPoints] = useState<SupportPoint[]>([]);

  function handleFindNearby() {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextOrigin = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setOrigin(nextOrigin);
        try {
          const nearby = await fetchNearbySupportPoints(nextOrigin);
          setPoints(nearby);
          setStatus('granted');
        } catch {
          setStatus('error');
        }
      },
      () => setStatus('denied'),
      { timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <section className="rounded-2xl bg-alerta-charcoal p-5 sm:p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Rede de apoio</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {NATIONAL_SUPPORT_CHANNELS.map((channel) => (
          <li key={channel.name}>
            <p className="font-medium">{channel.name}</p>
            <p className="text-alerta-light/70">{channel.description}</p>
            {channel.url && (
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center underline text-alerta-light hover:text-alerta-red"
              >
                Abrir canal
              </a>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleFindNearby}
        disabled={status === 'loading'}
        className="mt-4 min-h-[44px] rounded-lg bg-alerta-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {status === 'loading' ? 'Localizando...' : 'Ver apoio perto de mim'}
      </button>

      {status === 'denied' && (
        <p className="mt-3 text-sm text-alerta-light/70">
          Localização não autorizada. Você ainda pode usar os canais nacionais
          listados acima.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-alerta-light/70">
          Não foi possível buscar pontos de apoio próximos agora. Tente
          novamente mais tarde.
        </p>
      )}
      {status === 'granted' && origin && (
        <div className="mt-4">
          <SupportMap origin={origin} points={points} />
          <ul className="mt-3 space-y-2 text-sm">
            {points.map((point) => (
              <li key={point.id}>
                <p>
                  {point.name} — {point.distanceKm.toFixed(1)} km
                </p>
                {point.address && (
                  <p className="text-xs text-alerta-light/60">{point.address}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
