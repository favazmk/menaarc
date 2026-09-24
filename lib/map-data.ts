export type MapLocation = {
  id: string;
  name: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  type: 'emirate' | 'city';
  /** Which side of the dot the label sits; defaults to right. */
  labelSide?: 'left' | 'right';
};

export const UAE_EMIRATES: MapLocation[] = [
  {
    id: 'dubai',
    name: 'DUBAI',
    coordinates: [55.2708, 25.2048],
    type: 'emirate'
  },
  {
    id: 'abu-dhabi',
    name: 'ABU DHABI',
    coordinates: [54.3773, 24.4539],
    type: 'emirate'
  },
  {
    id: 'sharjah',
    name: 'SHARJAH',
    coordinates: [55.3873, 25.3463],
    type: 'emirate',
    // Left, so it clears the Ajman dot just north-east of it.
    labelSide: 'left'
  },
  {
    id: 'ajman',
    name: 'AJMAN',
    coordinates: [55.5136, 25.4052],
    type: 'emirate'
  },
  {
    id: 'umm-al-quwain',
    name: 'UMM AL QUWAIN',
    coordinates: [55.5552, 25.5647],
    type: 'emirate'
  },
  {
    id: 'ras-al-khaimah',
    name: 'RAS AL KHAIMAH',
    coordinates: [55.9762, 25.8007],
    type: 'emirate'
  },
  {
    id: 'fujairah',
    name: 'FUJAIRAH',
    coordinates: [56.3414, 25.1288],
    type: 'emirate'
  }
];

export const LOCATIONS: MapLocation[] = [
  ...UAE_EMIRATES,
  { id: 'riyadh', name: 'RIYADH', coordinates: [46.6753, 24.7136], type: 'city' },
  { id: 'jeddah', name: 'JEDDAH', coordinates: [39.1925, 21.4858], type: 'city' },
  { id: 'kuwait-city', name: 'KUWAIT CITY', coordinates: [47.9774, 29.3759], type: 'city' },
  { id: 'muscat', name: 'MUSCAT', coordinates: [58.4059, 23.588], type: 'city' },
  { id: 'bengaluru', name: 'BENGALURU', coordinates: [77.5946, 12.9716], type: 'city' },
  { id: 'singapore', name: 'SINGAPORE', coordinates: [103.8198, 1.3521], type: 'city' },
];

const DUBAI = LOCATIONS.find((l) => l.id === 'dubai')!.coordinates;

/** One line from the Dubai hub to every other location. */
export const ROUTES_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: 'FeatureCollection',
  features: LOCATIONS.filter((loc) => loc.id !== 'dubai').map((loc) => ({
    type: 'Feature',
    properties: { from: 'Dubai', to: loc.name },
    geometry: { type: 'LineString', coordinates: [DUBAI, loc.coordinates] },
  })),
};
