export type MapLocation = {
  id: string;
  name: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  type: 'emirate' | 'city' | 'country';
  /** Which side of the dot the label sits; defaults to right. */
  labelSide?: 'left' | 'right';
};

export const UAE_EMIRATES: MapLocation[] = [
  {
    id: 'abu-dhabi',
    name: 'ABU DHABI',
    coordinates: [54.3773, 24.4539],
    type: 'emirate'
  },
  {
    id: 'dubai',
    name: 'DUBAI',
    coordinates: [55.2708, 25.2048],
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
  { id: 'doha', name: 'DOHA', coordinates: [51.5310, 25.2854], type: 'city' },
  { id: 'manama', name: 'MANAMA', coordinates: [50.5860, 26.2235], type: 'city', labelSide: 'left' },
  { id: 'kuwait-city', name: 'KUWAIT CITY', coordinates: [47.9774, 29.3759], type: 'city' },
  { id: 'riyadh', name: 'RIYADH', coordinates: [46.6753, 24.7136], type: 'city' },
  { id: 'jeddah', name: 'JEDDAH', coordinates: [39.1925, 21.4858], type: 'city' },
  { id: 'muscat', name: 'MUSCAT', coordinates: [58.4059, 23.5880], type: 'city' },
  { id: 'amman', name: 'AMMAN', coordinates: [35.9106, 31.9539], type: 'city' },
  { id: 'cairo', name: 'CAIRO', coordinates: [31.2357, 30.0444], type: 'city' },
  // Country markers sit on the geographic centre, not on any one city.
  { id: 'india', name: 'INDIA', coordinates: [78.9629, 20.5937], type: 'country' },
  { id: 'malaysia', name: 'MALAYSIA', coordinates: [101.9758, 4.2105], type: 'country' }
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
