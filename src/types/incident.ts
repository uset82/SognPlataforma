export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'STANDBY';

export type EvacuationState = 'NONE' | 'INSIDE_AFFECTED_AREA' | 'EVACUATING' | 'SAFE';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface VesselTelemetry {
  name: string;
  callSign: string;
  mmsi: string;
  vesselType: string;
  latitude: number;
  longitude: number;
  speedKnots: number;
  headingDegrees: number;
  bearingToHarborDegrees: number;
  distanceToHarborNm: number;
  passengersOnBoard: number;
  crewOnBoard: number;
  steeringStatus: 'OPERATIONAL' | 'DEGRADED' | 'TOTAL_LOSS';
  estimatedTimeToImpactSeconds: number;
}

export interface SafeZone {
  id: string;
  name: string;
  distanceMeters: number;
  walkMinutes: number;
  status: 'OPEN_AND_CONFIRMED' | 'STANDBY' | 'FULL';
  shortDescription: string;
  address?: string;
  elevationMeters?: number;
  capacity: number;
  currentOccupancy: number;
  facilities?: string[];
  latitude: number;
  longitude: number;
  confirmedTimestamp: string;
}

export interface HazardZone {
  id: string;
  name: string;
  level: 'CRITICAL_IMPACT' | 'WARNING_PERIMETER' | 'SAFE_HAVEN';
  polygon: Coordinates[];
  estimatedPeopleInside: number;
  isEvacuationOrdered: boolean;
  color: string;
  fillColor: string;
}

export interface EvacuationRoute {
  routeId: string;
  destinationSafeZone: SafeZone;
  remainingDistanceMeters: number;
  estimatedWalkingMinutes: number;
  primaryInstruction: string;
  secondaryInstruction: string;
  routeStatus: 'CLEAR' | 'CAUTION' | 'BLOCKED' | 'HAZARD_REROUTED';
  blockedAreas?: string[];
  waypoints: Coordinates[];
  verifiedTimestamp: string;
}

export interface Incident {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  type: 'VESSEL_COLLISION' | 'LANDSLIDE' | 'FLOOD' | 'HARBOR_INCIDENT' | 'DRILL';
  severity: IncidentSeverity;
  status: IncidentStatus;
  locationName: string;
  affectedZoneName: string;
  createdTimestamp: string;
  lastVerifiedTimestamp: string;
  vessel: VesselTelemetry;
  zones: HazardZone[];
  primarySafeZone: SafeZone;
  defaultRoute: EvacuationRoute;
  civiliansNotifiedCount: number;
  civiliansSafeCount: number;
  distressCount: number;
}
