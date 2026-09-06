import type { Coordinates, HazardZone, EvacuationRoute } from '../types/incident';

/* ============================================================================
   GeoJSON adapters.
   The existing data layer already stores true Flam coordinates, so nothing is
   invented here — these are pure shape conversions from the domain types in
   src/types/incident.ts into what MapLibre sources expect.
   ============================================================================ */

/** GeoJSON is [lng, lat] — the reverse of how the domain types read. */
export const toLngLat = (c: Coordinates): [number, number] => [c.longitude, c.latitude];

export const toLngLatArray = (cs: Coordinates[]): Array<[number, number]> => cs.map(toLngLat);

export type Feature<G, P = Record<string, unknown>> = {
  type: 'Feature';
  geometry: G;
  properties: P;
};

export type FeatureCollection<G, P = Record<string, unknown>> = {
  type: 'FeatureCollection';
  features: Array<Feature<G, P>>;
};

type PolygonGeom = { type: 'Polygon'; coordinates: Array<Array<[number, number]>> };
type LineGeom = { type: 'LineString'; coordinates: Array<[number, number]> };
type PointGeom = { type: 'Point'; coordinates: [number, number] };

export const emptyCollection = <G,>(): FeatureCollection<G> => ({
  type: 'FeatureCollection',
  features: [],
});

/** Polygons must be explicitly closed for MapLibre to fill them correctly. */
const closeRing = (ring: Array<[number, number]>): Array<[number, number]> => {
  if (ring.length === 0) return ring;
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  return fx === lx && fy === ly ? ring : [...ring, [fx, fy]];
};

export interface ZoneProps extends Record<string, unknown> {
  id: string;
  name: string;
  level: HazardZone['level'];
  color: string;
  fillColor: string;
  people: number;
  evacuating: boolean;
}

export const zonesToGeoJSON = (zones: HazardZone[]): FeatureCollection<PolygonGeom, ZoneProps> => ({
  type: 'FeatureCollection',
  features: zones.map((z) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [closeRing(toLngLatArray(z.polygon))],
    },
    properties: {
      id: z.id,
      name: z.name,
      level: z.level,
      color: z.color,
      fillColor: z.fillColor,
      people: z.estimatedPeopleInside,
      evacuating: z.isEvacuationOrdered,
    },
  })),
});

export const routeToGeoJSON = (route: EvacuationRoute): FeatureCollection<LineGeom> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: toLngLatArray(route.waypoints) },
      properties: { status: route.routeStatus, id: route.routeId },
    },
  ],
});

export const pointsToGeoJSON = <P extends Record<string, unknown>>(
  items: Array<{ coordinates: Coordinates } & { props: P }>
): FeatureCollection<PointGeom, P> => ({
  type: 'FeatureCollection',
  features: items.map((it) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: toLngLat(it.coordinates) },
    properties: it.props,
  })),
});

/* ---------------------------------------------------------------------------
   Vessel drift cone.
   Projects a wedge ahead of the vessel along its heading, widening by the
   scenario's uncertainty angle. Uses an equirectangular approximation, which
   is accurate well past the few kilometres this incident spans.
   --------------------------------------------------------------------------- */
const EARTH_R_NM = 3440.065;

export const projectCoordinate = (
  origin: Coordinates,
  bearingDeg: number,
  distanceNm: number
): Coordinates => {
  const latRad = (origin.latitude * Math.PI) / 180;
  const bRad = (bearingDeg * Math.PI) / 180;
  const dLat = ((distanceNm * Math.cos(bRad)) / EARTH_R_NM) * (180 / Math.PI);
  const dLon =
    ((distanceNm * Math.sin(bRad)) / (EARTH_R_NM * Math.cos(latRad))) * (180 / Math.PI);
  return { latitude: origin.latitude + dLat, longitude: origin.longitude + dLon };
};

export const driftConeToGeoJSON = (
  origin: Coordinates,
  headingDeg: number,
  distanceNm: number,
  spreadDeg: number
): FeatureCollection<PolygonGeom> => {
  const half = spreadDeg / 2;
  const steps = 16;
  const arc: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i += 1) {
    const bearing = headingDeg - half + (spreadDeg * i) / steps;
    arc.push(toLngLat(projectCoordinate(origin, bearing, distanceNm)));
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [closeRing([toLngLat(origin), ...arc])] },
        properties: {},
      },
    ],
  };
};

/** Great-circle-ish bearing, used to orient the vessel icon toward the quay. */
export const bearingBetween = (from: Coordinates, to: Coordinates): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(to.longitude - from.longitude)) * Math.cos(toRad(to.latitude));
  const x =
    Math.cos(toRad(from.latitude)) * Math.sin(toRad(to.latitude)) -
    Math.sin(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.cos(toRad(to.longitude - from.longitude));
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
};

/* ---------------------------------------------------------------------------
   Bounds
   --------------------------------------------------------------------------- */
export type Bounds = [[number, number], [number, number]];

/** [[west, south], [east, north]] over every supplied coordinate. */
export const boundsOf = (coords: Coordinates[]): Bounds | null => {
  if (coords.length === 0) return null;
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  coords.forEach((c) => {
    if (c.longitude < w) w = c.longitude;
    if (c.longitude > e) e = c.longitude;
    if (c.latitude < s) s = c.latitude;
    if (c.latitude > n) n = c.latitude;
  });
  return [
    [w, s],
    [e, n],
  ];
};
