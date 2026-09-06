import { Incident, SafeZone, HazardZone, EvacuationRoute, VesselTelemetry } from '../types/incident';
import { CivilianHelpRequest, SafeMusterRecord } from '../types/civilian';
import { LandingStatusCard } from '../types/landing';
import { AgentLogMessage } from '../types/agents';

export const INITIAL_SAFE_ZONE: SafeZone = {
  id: 'safe-zone-flam-school',
  name: 'Flåm School Safe Area',
  distanceMeters: 650,
  walkMinutes: 8,
  status: 'OPEN_AND_CONFIRMED',
  shortDescription: 'Primary municipal evacuation reception point, designated heating shelter & medical triage.',
  address: 'Nedre Flåm 12, 5743 Flåm',
  elevationMeters: 28,
  capacity: 850,
  currentOccupancy: 312,
  facilities: ['First Aid Post', 'Heated Hall', 'Emergency Blankets', 'Satellite Uplink', 'Drinking Water'],
  latitude: 60.8652,
  longitude: 7.1145,
  confirmedTimestamp: '2026-09-06T15:15:00Z',
};

export const INITIAL_HAZARD_ZONES: HazardZone[] = [
  {
    id: 'zone-a-waterfront',
    name: 'Zone A - Primary Impact Waterfront',
    level: 'CRITICAL_IMPACT',
    polygon: [
      { latitude: 60.8635, longitude: 7.1120 },
      { latitude: 60.8648, longitude: 7.1180 },
      { latitude: 60.8612, longitude: 7.1220 },
      { latitude: 60.8598, longitude: 7.1140 },
    ],
    estimatedPeopleInside: 1840,
    isEvacuationOrdered: true,
    color: '#B83A32',
    fillColor: 'rgba(184, 58, 50, 0.22)',
  },
  {
    id: 'zone-b-warning',
    name: 'Zone B - Secondary Warning & Debris Buffer',
    level: 'WARNING_PERIMETER',
    polygon: [
      { latitude: 60.8655, longitude: 7.1090 },
      { latitude: 60.8670, longitude: 7.1230 },
      { latitude: 60.8580, longitude: 7.1260 },
      { latitude: 60.8575, longitude: 7.1110 },
    ],
    estimatedPeopleInside: 1003,
    isEvacuationOrdered: false,
    color: '#D97706',
    fillColor: 'rgba(217, 119, 6, 0.16)',
  },
];

export const INITIAL_DEFAULT_ROUTE: EvacuationRoute = {
  routeId: 'route-north-flam-school',
  destinationSafeZone: INITIAL_SAFE_ZONE,
  remainingDistanceMeters: 650,
  estimatedWalkingMinutes: 8,
  primaryInstruction: 'CONTINUE NORTH ON FLÅMSVEGEN',
  secondaryInstruction: 'Avoid harbour promenade; turn left past bakery toward school muster yard.',
  routeStatus: 'CLEAR',
  blockedAreas: ['Waterfront Quay 1 & 2', 'Harbourfront Promenade'],
  waypoints: [
    { latitude: 60.8628, longitude: 7.1140 },
    { latitude: 60.8638, longitude: 7.1142 },
    { latitude: 60.8647, longitude: 7.1144 },
    { latitude: 60.8652, longitude: 7.1145 },
  ],
  verifiedTimestamp: '2026-09-06T15:20:00Z',
};

export const INITIAL_VESSEL: VesselTelemetry = {
  name: 'M/S Viking Glory',
  callSign: 'LAKX9',
  mmsi: '257832000',
  vesselType: 'Passenger Cruise Ferry (218m)',
  latitude: 60.8760,
  longitude: 7.1280,
  speedKnots: 5.2,
  headingDegrees: 194,
  bearingToHarborDegrees: 196,
  distanceToHarborNm: 1.9,
  passengersOnBoard: 2240,
  crewOnBoard: 180,
  steeringStatus: 'TOTAL_LOSS',
  estimatedTimeToImpactSeconds: 900,
};

export const INITIAL_INCIDENT: Incident = {
  id: 'inc-2026-f03',
  code: 'INC-2026-F03: FLÅM VESSEL CRITICAL DRIFT',
  title: 'Passenger Vessel Uncontrolled Drift Toward Flåm Waterfront',
  shortDescription: 'M/S Viking Glory has suffered complete rudder hydraulic failure and is drifting toward the primary cruise pier and civilian promenade.',
  type: 'VESSEL_COLLISION',
  severity: 'CRITICAL',
  status: 'ACTIVE',
  locationName: 'Indre Sogn / Aurlandsfjorden / Flåm',
  affectedZoneName: 'Zone A - Waterfront & Flåm Kai',
  createdTimestamp: '2026-09-06T15:17:00Z',
  lastVerifiedTimestamp: '2026-09-06T15:32:00Z',
  vessel: INITIAL_VESSEL,
  zones: INITIAL_HAZARD_ZONES,
  primarySafeZone: INITIAL_SAFE_ZONE,
  defaultRoute: INITIAL_DEFAULT_ROUTE,
  civiliansNotifiedCount: 2843,
  civiliansSafeCount: 418,
  distressCount: 5,
};

export const INITIAL_HELP_REQUESTS: CivilianHelpRequest[] = [
  {
    id: 'req-01',
    civilianAlias: 'Civilian #4182 (Tourist, Family of 3)',
    condition: 'I_AM_INJURED',
    severity: 'CRITICAL',
    coordinates: { latitude: 60.8629, longitude: 7.1148 },
    distanceToHospitalMeters: 420,
    locationDescription: 'Near Flåm railway ticket booth, twisted ankle, unable to carry child.',
    timestamp: '2026-09-06T15:26:12Z',
    state: 'RECEIVED',
    responderNotes: 'Nearest responder: Police Patrol 1 (180m away).',
  },
  {
    id: 'req-02',
    civilianAlias: 'Civilian #8921 (Local Resident)',
    condition: 'I_CANNOT_WALK',
    severity: 'URGENT',
    coordinates: { latitude: 60.8624, longitude: 7.1132 },
    distanceToHospitalMeters: 510,
    locationDescription: 'Aasengate 4, ground floor, wheelchair user without ramp assistance.',
    timestamp: '2026-09-06T15:27:45Z',
    state: 'DISPATCHED',
    responderNotes: 'Civil Defence auxiliary team dispatched for transport.',
  },
  {
    id: 'req-03',
    civilianAlias: 'Civilian #1104 (Elderly Couple)',
    condition: 'I_AM_WITH_PEOPLE_WHO_NEED_HELP',
    severity: 'STANDARD',
    coordinates: { latitude: 60.8636, longitude: 7.1152 },
    distanceToHospitalMeters: 380,
    locationDescription: 'Fretheim Fjordhytter cabin area, slow mobility.',
    timestamp: '2026-09-06T15:29:10Z',
    state: 'RECEIVED',
  },
  {
    id: 'req-04',
    civilianAlias: 'Civilian #6320 (Harbour Shop Worker)',
    condition: 'I_AM_TRAPPED',
    severity: 'URGENT',
    coordinates: { latitude: 60.8621, longitude: 7.1158 },
    distanceToHospitalMeters: 460,
    locationDescription: 'Storage shed beside Kai 1, security shutter jammed shut.',
    timestamp: '2026-09-06T15:30:05Z',
    state: 'RECEIVED',
    responderNotes: 'Fire crew with hydraulic cutters notified.',
  },
  {
    id: 'req-05',
    civilianAlias: 'Civilian #9450 (Backpacker)',
    condition: 'OTHER_URGENT_HELP',
    severity: 'STANDARD',
    coordinates: { latitude: 60.8640, longitude: 7.1165 },
    distanceToHospitalMeters: 310,
    locationDescription: 'Fjord park bench, lost passport and medication bag during rush.',
    timestamp: '2026-09-06T15:31:22Z',
    state: 'ACKNOWLEDGED',
    responderNotes: 'Directed to Red Cross desk at Flåm School.',
  },
];

export const INITIAL_MUSTER_RECORDS: SafeMusterRecord[] = [
  { id: 'mus-01', civilianAlias: 'Civilian #2201', safeZoneId: 'safe-zone-flam-school', safeZoneName: 'Flåm School Safe Area', timestamp: '15:22:10', isWithFamily: true },
  { id: 'mus-02', civilianAlias: 'Civilian #5190', safeZoneId: 'safe-zone-flam-school', safeZoneName: 'Flåm School Safe Area', timestamp: '15:23:44', isWithFamily: false },
  { id: 'mus-03', civilianAlias: 'Civilian #7812', safeZoneId: 'safe-zone-flam-school', safeZoneName: 'Flåm School Safe Area', timestamp: '15:25:01', isWithFamily: true },
  { id: 'mus-04', civilianAlias: 'Civilian #1044', safeZoneId: 'safe-zone-flam-school', safeZoneName: 'Flåm School Safe Area', timestamp: '15:27:18', isWithFamily: false },
];

export const INITIAL_LANDING_STATUS_CARD: LandingStatusCard = {
  id: 'card-viking-glory-landing',
  vesselName: 'M/S Viking Glory',
  callSign: 'LAKX9',
  assignedQuay: 'FLAM_CRUISE_KAI',
  quayDisplayName: 'Flåm Cruise Kai (Berth 1 - Deepwater)',
  totalPeopleToLand: 2420,
  conditionSummary: {
    uninjuredCount: 2392,
    minorInjuriesCount: 22,
    moderateInjuriesCount: 6,
    criticalCareCount: 0,
  },
  estimatedTimeOfBerthing: 'T-00:00 (Emergency Grounding/Mooring)',
  dockTeamPreparedness: 'READY_TO_RECEIVE',
  liaisonContact: 'Chief Officer Lindqvist (VHF Ch 16 / Sogn Safe Liaison)',
  lastUpdatedTimestamp: '2026-09-06T15:32:00Z',
};

export const INITIAL_LOG_MESSAGES: AgentLogMessage[] = [
  { id: 'msg-01', agentId: 'ship', agentName: 'SHIP AGENT', timestamp: '15:15:00', stageT: 'T-15', content: 'Vessel reporting loss of steering hydraulic pressure. Speed 5.2 knots.', type: 'ALERT' },
  { id: 'msg-02', agentId: 'main', agentName: 'MAIN ORCHESTRATOR', timestamp: '15:16:00', stageT: 'T-13', content: 'Scenario Playbook F-03 initiated. Distributing tasks across emergency network.', type: 'ACTION' },
  { id: 'msg-03', agentId: 'risk', agentName: 'RISK AGENT', timestamp: '15:17:30', stageT: 'T-12', content: 'Hazard geometry calculated: Zone A (immediate waterfront), Zone B (warning). 2,843 citizens at risk.', type: 'INFO' },
  { id: 'msg-04', agentId: 'response', agentName: 'RESPONSE AGENT', timestamp: '15:18:45', stageT: 'T-11', content: 'Police, fire, hospital, and port authorities notified via digital tasks.', type: 'INFO' },
  { id: 'msg-05', agentId: 'public_alert', agentName: 'PUBLIC ALERT AGENT', timestamp: '15:20:00', stageT: 'T-9', content: 'Civilian warning template F-03 ready. Requesting human commander sign-off.', type: 'AUTHORIZATION_REQUEST', authorized: true },
];
