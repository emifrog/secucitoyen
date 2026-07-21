/**
 * @jest-environment node
 */
import { calculateIFM, getNiveau } from '@/lib/fire-index';

describe('calculateIFM', () => {
  it('donne un indice élevé par temps chaud, sec et venteux', () => {
    const ifm = calculateIFM(40, 10, 40, 0);
    expect(ifm).toBeGreaterThan(75);
    expect(ifm).toBeLessThanOrEqual(100);
  });

  it('donne un indice faible par temps froid, humide et calme', () => {
    const ifm = calculateIFM(5, 95, 2, 10);
    expect(ifm).toBeLessThan(20);
    expect(ifm).toBeGreaterThanOrEqual(0);
  });

  it('la pluie réduit l\'indice à conditions égales', () => {
    const sec = calculateIFM(35, 20, 20, 0);
    const pluvieux = calculateIFM(35, 20, 20, 10);
    expect(pluvieux).toBeLessThan(sec);
  });

  it('borne les facteurs (jamais > 100 ni < 0)', () => {
    expect(calculateIFM(100, 0, 100, 0)).toBeLessThanOrEqual(100);
    expect(calculateIFM(-20, 100, 0, 50)).toBeGreaterThanOrEqual(0);
  });
});

describe('getNiveau', () => {
  it('applique les seuils de la zone à haute sensibilité', () => {
    expect(getNiveau(80, 'haute')).toBe('extreme');
    expect(getNiveau(60, 'haute')).toBe('tres_eleve');
    expect(getNiveau(40, 'haute')).toBe('eleve');
    expect(getNiveau(25, 'haute')).toBe('modere');
    expect(getNiveau(10, 'haute')).toBe('faible');
  });

  it('est plus tolérant en zone normale qu\'en zone haute', () => {
    // Même IFM, mais seuils plus hauts en zone normale ⇒ niveau moindre.
    expect(getNiveau(40, 'haute')).toBe('eleve');
    expect(getNiveau(40, 'normale')).toBe('modere');
  });
});
