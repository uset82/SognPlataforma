export interface LandingStatusCard {
  id: string;
  vesselName: string;
  callSign: string;
  assignedQuay: 'FLAM_CRUISE_KAI' | 'AURLAND_KAI' | 'GUDVANGEN_KAI' | 'UNDREDAL_KAI';
  quayDisplayName: string;
  totalPeopleToLand: number;
  conditionSummary: {
    uninjuredCount: number;
    minorInjuriesCount: number;
    moderateInjuriesCount: number;
    criticalCareCount: number;
  };
  estimatedTimeOfBerthing: string;
  dockTeamPreparedness: 'READY_TO_RECEIVE' | 'PREPARING_GANGWAY' | 'AMBULANCES_STAGED' | 'STANDBY';
  liaisonContact: string;
  lastUpdatedTimestamp: string;
}
