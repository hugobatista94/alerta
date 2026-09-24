import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  haversineDistanceKm,
  findNearbySupportPoints,
  parseOrigin,
  OVERPASS_ENDPOINTS,
} from './overpass';

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
        {
          id: 1,
          lat: -23.6,
          lon: -46.7,
          tags: {
            name: 'Delegacia Distante',
            'addr:street': 'Rua das Flores',
            'addr:housenumber': '123',
            'addr:suburb': 'Centro',
          },
        },
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

    const distante = points.find((point) => point.name === 'Delegacia Distante');
    expect(distante?.address).toBe('Rua das Flores, 123 — Centro');

    const perto = points.find((point) => point.name === 'Delegacia Perto');
    expect(perto?.address).toBeUndefined();
  });

  it('identifies itself and sends the query as form data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await findNearbySupportPoints({ lat: -23.55, lon: -46.63 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(OVERPASS_ENDPOINTS[0]);
    expect(init.method).toBe('POST');
    expect(init.headers['User-Agent']).toMatch(/^ALERTA\//);
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(init.body).toMatch(/^data=/);
    expect(decodeURIComponent(init.body.slice('data='.length))).toContain('amenity');
  });

  it('falls back to the next endpoint when one rejects the request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 406 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ elements: [{ id: 7, lat: 0.001, lon: 0.001, tags: { name: 'Plantão' } }] }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const points = await findNearbySupportPoints({ lat: 0, lon: 0 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(OVERPASS_ENDPOINTS[1]);
    expect(points[0].name).toBe('Plantão');
  });

  it('falls back to the next endpoint when one fails with a network error', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(findNearbySupportPoints({ lat: 0, lon: 0 })).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws when every Overpass endpoint responds with an error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(findNearbySupportPoints({ lat: 0, lon: 0 })).rejects.toThrow(
      'Overpass API respondeu com status 500'
    );
    expect(fetchMock).toHaveBeenCalledTimes(OVERPASS_ENDPOINTS.length);
  });
});

describe('parseOrigin', () => {
  it('accepts valid coordinates', () => {
    expect(parseOrigin({ lat: -23.55, lon: -46.63 })).toEqual({ lat: -23.55, lon: -46.63 });
  });

  it.each([
    [null],
    [{}],
    [{ lat: '10', lon: 20 }],
    [{ lat: 91, lon: 0 }],
    [{ lat: 0, lon: -181 }],
    [{ lat: Number.NaN, lon: 0 }],
  ])('rejects invalid input %j', (input) => {
    expect(parseOrigin(input)).toBeNull();
  });
});
