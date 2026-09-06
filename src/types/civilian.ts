import { Coordinates } from './incident';

export type HelpCondition = 
  | 'I_AM_INJURED'
  | 'I_AM_TRAPPED'
  | 'I_CANNOT_WALK'
  | 'I_AM_WITH_PEOPLE_WHO_NEED_HELP'
  | 'OTHER_URGENT_HELP';

export type TriageSeverity = 'CRITICAL' | 'URGENT' | 'STANDARD' | 'NON_URGENT';

export type HelpRequestState =
  | 'RECEIVED'
  | 'DISPATCHED'
  | 'ACKNOWLEDGED'
  | 'RESCUED';

export interface CivilianHelpRequest {
  id: string;
  civilianAlias: string;
  deviceToken?: string;
  condition: HelpCondition;
  severity: TriageSeverity;
  coordinates: Coordinates;
  distanceToHospitalMeters: number;
  locationDescription: string;
  timestamp: string;
  state: HelpRequestState;
  responderNotes?: string;
}

export interface SafeMusterRecord {
  id: string;
  civilianAlias: string;
  safeZoneId: string;
  safeZoneName: string;
  timestamp: string;
  isWithFamily: boolean;
}
