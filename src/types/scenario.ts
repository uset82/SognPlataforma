export type ScenarioHighlight = 
  | 'ship' 
  | 'orchestration' 
  | 'zones' 
  | 'response' 
  | 'public' 
  | 'evacuation' 
  | 'help' 
  | 'medical' 
  | 'resource'
  | 'standdown';

export interface TimelineStage {
  t: string; // e.g. 'T-15', 'T-14', etc.
  tSeconds: number; // e.g. 900, 840, etc.
  title: string;
  description: string;
  actors: string[];
  highlight: ScenarioHighlight;
  zoneStateUpdate?: {
    zoneAEvacuate?: boolean;
    zoneBEvacuate?: boolean;
    waterfrontBlocked?: boolean;
  };
  vesselUpdate?: {
    speedKnots: number;
    distanceNm: number;
    driftConeDegrees: number;
  };
}

export type PlaybackSpeed = 1 | 2 | 5;
