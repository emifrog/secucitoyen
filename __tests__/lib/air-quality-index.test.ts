/**
 * @jest-environment node
 */
import { getAqiLevel, getAqiDescription } from '@/lib/sources/air-quality';

// Bandes de l'indice européen de qualité de l'air (EAQI) :
// 0-20 bon, 20-40 moyen, 40-60 dégradé, 60-80 mauvais, 80-100 très mauvais,
// > 100 extrêmement mauvais. Les anciens seuils (50/100/150) étaient ceux de
// l'US AQI : un indice européen de 90 (« mauvais ») s'affichait en jaune.

describe('getAqiLevel — bandes EAQI', () => {
  it.each([
    [0, 'vert'],
    [20, 'vert'],
    [40, 'vert'],
    [41, 'jaune'],
    [60, 'jaune'],
    [61, 'orange'],
    [80, 'orange'],
    [81, 'rouge'],
    [90, 'rouge'],
    [120, 'rouge'],
  ])('EAQI %i → %s', (aqi, expected) => {
    expect(getAqiLevel(aqi)).toBe(expected);
  });

  it('niveau et description sont cohérents (jamais « mauvais » en jaune)', () => {
    expect(getAqiDescription(90)).toMatch(/très mauvaise/i);
    expect(getAqiLevel(90)).toBe('rouge');
    expect(getAqiDescription(70)).toMatch(/mauvaise/i);
    expect(getAqiLevel(70)).toBe('orange');
  });
});
