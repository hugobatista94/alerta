import { describe, it, expect, vi, afterEach } from 'vitest';
import { findSupportPoints } from './supportPoints';
import * as nominatim from './nominatim';
import * as overpass from './overpass';

const point = { id: '1', name: 'Delegacia', lat: 0, lon: 0, distanceKm: 0.1 };

describe('findSupportPoints', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses Nominatim results when it succeeds, without calling Overpass', async () => {
    vi.spyOn(nominatim, 'findNearbySupportPointsNominatim').mockResolvedValue([point]);
    const overpassSpy = vi.spyOn(overpass, 'findNearbySupportPoints');

    await expect(findSupportPoints({ lat: 0, lon: 0 })).resolves.toEqual([point]);
    expect(overpassSpy).not.toHaveBeenCalled();
  });

  it('falls back to Overpass when Nominatim fails', async () => {
    vi.spyOn(nominatim, 'findNearbySupportPointsNominatim').mockRejectedValue(new Error('503'));
    vi.spyOn(overpass, 'findNearbySupportPoints').mockResolvedValue([point]);

    await expect(findSupportPoints({ lat: 0, lon: 0 })).resolves.toEqual([point]);
  });

  it('throws when both sources fail', async () => {
    vi.spyOn(nominatim, 'findNearbySupportPointsNominatim').mockRejectedValue(new Error('503'));
    vi.spyOn(overpass, 'findNearbySupportPoints').mockRejectedValue(new Error('504'));

    await expect(findSupportPoints({ lat: 0, lon: 0 })).rejects.toThrow('504');
  });
});
