import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchNearbySupportPoints } from './nearbySupport';

describe('fetchNearbySupportPoints', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the origin to the nearby API route and returns its points', async () => {
    const points = [{ id: '1', name: 'Delegacia', lat: 1, lon: 2, distanceKm: 0.4 }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ points }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchNearbySupportPoints({ lat: 1, lon: 2 });

    expect(result).toEqual(points);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/nearby');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ lat: 1, lon: 2 });
  });

  it('throws when the API route responds with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }));

    await expect(fetchNearbySupportPoints({ lat: 1, lon: 2 })).rejects.toThrow(
      'Busca de apoio próximo respondeu com status 502'
    );
  });
});
