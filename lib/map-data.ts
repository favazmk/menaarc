export type MapLocation = {
  id: string;
  name: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  type: 'emirate' | 'city';
  /** Which side of the dot the label sits; defaults to right. */
  labelSide?: 'left' | 'right';
};

/**
 * Coordinates are each place's city node in OpenStreetMap, checked against its
 * geocoder: one source for every marker, so none sits in a suburb or at the
 * middle of an island while its neighbours sit downtown.
 */
export const UAE_EMIRATES: MapLocation[] = [
  {
    id: 'dubai',
    name: 'DUBAI',
    coordinates: [55.2924, 25.2647],
    type: 'emirate'
  },
  {
    id: 'abu-dhabi',
    name: 'ABU DHABI',
    coordinates: [54.3774, 24.4538],
    type: 'emirate'
  },
  {
    id: 'sharjah',
    name: 'SHARJAH',
    coordinates: [55.4211, 25.3461],
    type: 'emirate',
    // Left, so it clears the Ajman dot just north-east of it.
    labelSide: 'left'
  },
  {
    id: 'ajman',
    name: 'AJMAN',
    coordinates: [55.4451, 25.3937],
    type: 'emirate'
  },
  {
    id: 'umm-al-quwain',
    name: 'UMM AL QUWAIN',
    coordinates: [55.5475, 25.552],
    type: 'emirate'
  },
  {
    id: 'ras-al-khaimah',
    name: 'RAS AL KHAIMAH',
    coordinates: [55.9382, 25.7738],
    type: 'emirate'
  },
  {
    id: 'fujairah',
    name: 'FUJAIRAH',
    coordinates: [56.3355, 25.1245],
    type: 'emirate'
  }
];

export const LOCATIONS: MapLocation[] = [
  ...UAE_EMIRATES,
  { id: 'riyadh', name: 'RIYADH', coordinates: [46.716, 24.6389], type: 'city' },
  { id: 'jeddah', name: 'JEDDAH', coordinates: [39.1742, 21.5504], type: 'city' },
  { id: 'kuwait-city', name: 'KUWAIT CITY', coordinates: [47.9734, 29.3797], type: 'city' },
  { id: 'muscat', name: 'MUSCAT', coordinates: [58.5938, 23.6124], type: 'city' },
  { id: 'bengaluru', name: 'BENGALURU', coordinates: [77.5901, 12.9768], type: 'city' },
  { id: 'singapore', name: 'SINGAPORE', coordinates: [103.8519, 1.2899], type: 'city' },
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
