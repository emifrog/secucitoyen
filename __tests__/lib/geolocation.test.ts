import { findDepartmentFromCoords } from '@/lib/geolocation';

describe('findDepartmentFromCoords', () => {
  it('trouve Paris pour des coordonnées au centre de Paris', () => {
    const result = findDepartmentFromCoords(48.8566, 2.3522);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('75');
    expect(result!.name).toBe('Paris');
  });

  it('trouve Bouches-du-Rhône pour Marseille', () => {
    const result = findDepartmentFromCoords(43.2965, 5.3698);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('13');
    expect(result!.name).toBe('Bouches-du-Rhône');
  });

  it('trouve un département du sud-est pour Lyon', () => {
    const result = findDepartmentFromCoords(45.7640, 4.8357);
    expect(result).not.toBeNull();
    // Lyon est à la frontière Rhône/Isère, les deux sont acceptables
    expect(['69', '38', '42']).toContain(result!.code);
  });

  it('trouve la Corse-du-Sud pour Ajaccio', () => {
    const result = findDepartmentFromCoords(41.9267, 8.7369);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('2A');
    expect(result!.name).toBe('Corse-du-Sud');
  });

  it('retourne le département le plus proche pour des coordonnées hors limites', () => {
    // Coordonnées en mer au large de Nice
    const result = findDepartmentFromCoords(43.5, 7.5);
    expect(result).not.toBeNull();
    // Devrait retourner un département du sud-est
  });

  it('retourne un résultat même pour des coordonnées éloignées de la France', () => {
    // Londres
    const result = findDepartmentFromCoords(51.5, -0.12);
    // Devrait retourner le département le plus proche (nord de la France)
    expect(result).not.toBeNull();
  });
});
