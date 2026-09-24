import { describe, it, expect, vi, afterEach } from 'vitest';
import { findNearbySupportPointsNominatim } from './nominatim';

describe('findNearbySupportPointsNominatim', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches police stations inside a bounded box around the origin', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    await findNearbySupportPointsNominatim({ lat: -23.55, lon: -46.63 });

    const [url, init] = fetchMock.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://nominatim.openstreetmap.org');
    expect(parsed.searchParams.get('q')).toBe('police');
    expect(parsed.searchParams.get('bounded')).toBe('1');
    const [left, top, right, bottom] = parsed.searchParams.get('viewbox')!.split(',').map(Number);
    expect(left).toBeLessThan(-46.63);
    expect(right).toBeGreaterThan(-46.63);
    expect(top).toBeGreaterThan(-23.55);
    expect(bottom).toBeLessThan(-23.55);
    expect(init.headers['User-Agent']).toMatch(/^ALERTA\//);
  });

  it('parses results, drops points outside the radius, sorts by distance and keeps 5', async () => {
    const origin = { lat: 0, lon: 0 };
    const near = (i: number) => ({
      osm_id: i,
      lat: String(0.001 * i),
      lon: '0',
      name: `Delegacia ${i}`,
      address: { road: 'Rua A', house_number: String(i), suburb: 'Centro' },
    });
    const results = [near(6), near(2), near(1), near(5), near(3), near(4)];
    results.push({ osm_id: 99, lat: '0.2', lon: '0.2', name: 'Longe', address: {} as never });
    results.push({ osm_id: 100, lat: '0.0005', lon: '0', name: '', address: {} as never });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => results }));

    const points = await findNearbySupportPointsNominatim(origin, 5000);

    expect(points).toHaveLength(5);
    expect(points[0]).toMatchObject({ id: '100', name: 'Delegacia de Polícia' });
    expect(points[1]).toMatchObject({ id: '1', name: 'Delegacia 1', address: 'Rua A, 1 — Centro' });
    expect(points.some((point) => point.name === 'Longe')).toBe(false);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].distanceKm).toBeGreaterThanOrEqual(points[i - 1].distanceKm);
    }
  });

  it('searches a small area first and only widens it when fewer than 5 points are found', async () => {
    const result = (i: number) => ({ osm_id: i, lat: String(0.001 * i), lon: '0', name: `D${i}` });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [result(1), result(2)] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [result(1), result(2), result(3), result(4), result(5), result(6)],
      });
    vi.stubGlobal('fetch', fetchMock);

    const points = await findNearbySupportPointsNominatim({ lat: 0, lon: 0 }, 5000);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const width = (call: number) => {
      const [left, , right] = new URL(fetchMock.mock.calls[call][0]).searchParams
        .get('viewbox')!
        .split(',')
        .map(Number);
      return right - left;
    };
    expect(width(0)).toBeLessThan(width(1));
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('limit')).toBe('40');
    expect(points.map((point) => point.name)).toEqual(['D1', 'D2', 'D3', 'D4', 'D5']);
  });

  it('does not widen the search when the small area already has 5 points', async () => {
    const result = (i: number) => ({ osm_id: i, lat: String(0.001 * i), lon: '0', name: `D${i}` });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [1, 2, 3, 4, 5].map(result),
    });
    vi.stubGlobal('fetch', fetchMock);

    await findNearbySupportPointsNominatim({ lat: 0, lon: 0 }, 5000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when Nominatim responds with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(findNearbySupportPointsNominatim({ lat: 0, lon: 0 })).rejects.toThrow(
      'Nominatim respondeu com status 503'
    );
  });
});
