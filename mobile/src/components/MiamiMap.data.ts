/** IDs/names match the seeded demo colonies; coordinates are invented, not rescue locations. */
export type MiamiMapPoint = { id: string; title: string; latitude: number; longitude: number };
export type MiamiMapProps = { points?: readonly MiamiMapPoint[]; selectedId?: string | null; onSelect?: (id: string) => void };
export const MIAMI_CENTER = { latitude: 25.7617, longitude: -80.1918 };
export const FICTIONAL_MAP_POINTS: readonly MiamiMapPoint[] = [
  { id: 'colony-1', title: 'Mangrove Lantern', latitude: 25.7691, longitude: -80.1967 },
  { id: 'colony-2', title: 'Coral Courtyard', latitude: 25.7600, longitude: -80.2100 },
  { id: 'colony-3', title: 'Banyan Cove', latitude: 25.7750, longitude: -80.2050 },
];
