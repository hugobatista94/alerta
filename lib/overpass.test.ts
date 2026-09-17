import { describe, it, expect, vi, afterEach } from 'vitest';
import { haversineDistanceKm, findNearbySupportPoints } from './overpass';

describe('haversineDistanceKm', () => {
  it('returns ~0 for the same point', () => {
    const point = { lat: -23.5505, lon: -46.6333 };
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it('returns approximately the known distance between São Paulo and Rio de Janeiro', () => {
    const saoPaulo = { lat: -23.5505, lon: -46.6333 };
    const rioDeJaneiro = { lat: -22.9068, lon: -43.1729 };
    const distance = haversineDistanceKm(saoPaulo, rioDeJaneiro);
    expect(distance).toBeGreaterThan(350);
    expect(distance).toBeLessThan(370);
  });
});

describe('findNearbySupportPoints', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses, calculates distance, and sorts Overpass results', async () => {
    const origin = { lat: -23.5505, lon: -46.6333 };
    const mockResponse = {
      elements: [
        { id: 1, lat: -23.6, lon: -46.7, tags: { name: 'Delegacia Distante' } },
        { id: 2, lat: -23.551, lon: -46.634, tags: { name: 'Delegacia Perto' } },
        { id: 3, center: { lat: -23.5515, lon: -46.6335 }, tags: {} },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const points = await findNearbySupportPoints(origin);

    expect(points).toHaveLength(3);
    expect(points[0].name).toBe('Delegacia Perto');
    expect(points[points.length - 1].name).toBe('Delegacia Distante');
    expect(points.some((point) => point.name === 'Delegacia de Polícia')).toBe(true);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].distanceKm).toBeGreaterThanOrEqual(points[i - 1].distanceKm);
    }
  });

  it('throws when the Overpass API responds with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(findNearbySupportPoints({ lat: 0, lon: 0 })).rejects.toThrow(
      'Overpass API respondeu com status 500'
    );
  });
});
