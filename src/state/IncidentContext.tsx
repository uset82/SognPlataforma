import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Incident } from '../types/incident';
import { EmergencyAgent, AgentLogMessage } from '../types/agents';
import { TimelineStage, PlaybackSpeed } from '../types/scenario';
import {
  CivilianHelpRequest,
  SafeMusterRecord,
  HelpRequestState,
  HelpCondition,
  TriageSeverity,
} from '../types/civilian';
import { LandingStatusCard } from '../types/landing';
import { INITIAL_SAFE_ZONE, INITIAL_INCIDENT, INITIAL_HELP_REQUESTS, INITIAL_MUSTER_RECORDS, INITIAL_LANDING_STATUS_CARD, INITIAL_LOG_MESSAGES } from '../data/initialIncident';
import { INITIAL_AGENTS } from '../data/agents';
import { SCENARIO_TIMELINE } from '../data/scenario';
import {
  fetchSimulatorState,
  triggerBackendFlamScenario,
  triggerBackendReroute,
  endBackendScenario,
  acknowledgeBackendHelp,
} from '../services/simulatorSync';
import { distanceMeters } from '../lib/geo';

/* ---------------------------------------------------------------------------
   Triage normalisation.

   The civilian app posts the long-form codes from its own HelpCondition union
   ('I_AM_TRAPPED', 'I_AM_INJURED', ...). Earlier code compared these against
   short codes ('TRAPPED', 'INJURED'), so every live signal fell through to
   OTHER_URGENT_HELP / URGENT — a trapped civilian reached the console as a
   low-priority "other" request. Match on substrings so both wire formats work.
   --------------------------------------------------------------------------- */
const normaliseCondition = (raw: string): HelpCondition => {
  const c = (raw || '').toUpperCase();
  if (c.includes('TRAPPED')) return 'I_AM_TRAPPED';
  if (c.includes('INJURED')) return 'I_AM_INJURED';
  if (c.includes('CANNOT_WALK') || c.includes('NON_AMBULATORY')) return 'I_CANNOT_WALK';
  if (c.includes('WITH_PEOPLE')) return 'I_AM_WITH_PEOPLE_WHO_NEED_HELP';
  return 'OTHER_URGENT_HELP';
};

const severityFor = (condition: HelpCondition): TriageSeverity => {
  switch (condition) {
    case 'I_AM_TRAPPED':
    case 'I_AM_INJURED':
      return 'CRITICAL';
    case 'I_CANNOT_WALK':
    case 'I_AM_WITH_PEOPLE_WHO_NEED_HELP':
      return 'URGENT';
    default:
      return 'STANDARD';
  }
};

export type PlatformModule =
  | 'dashboard'
  | 'gis-map'
  | 'agents'
  | 'public-alert'
  | 'medical'
  | 'triage'
  | 'fjordlink'
  | 'presentation';
export type ConnectivityMode = 'NORMAL' | 'LIMITED' | 'OFFLINE';

interface IncidentContextValue {
  incident: Incident;
  currentStage: TimelineStage;
  stageIndex: number;
  totalStages: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  agents: EmergencyAgent[];
  logMessages: AgentLogMessage[];
  helpRequests: CivilianHelpRequest[];
  musterRecords: SafeMusterRecord[];
  landingCard: LandingStatusCard;
  connectivityMode: ConnectivityMode;
  activeModule: PlatformModule;
  isAlertBroadcasted: boolean;
  unacknowledgedDistressCount: number;

  /* Actions */
  playScenario: () => void;
  pauseScenario: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStage: (index: number) => void;
  resetScenario: () => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  acknowledgeHelpRequest: (id: string, notes?: string) => void;
  updateHelpRequestState: (id: string, state: HelpRequestState) => void;
  broadcastPublicAlert: () => void;
  authorizeAgentMessage: (messageId: string) => void;
  addCustomAgentLog: (agentName: string, content: string, type?: 'ALERT' | 'INFO') => void;
  updateLandingCard: (partial: Partial<LandingStatusCard>) => void;
  setConnectivityMode: (mode: ConnectivityMode) => void;
  setActiveModule: (mod: PlatformModule) => void;
}

const IncidentContext = createContext<IncidentContextValue | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incident, setIncident] = useState<Incident>(INITIAL_INCIDENT);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [agents] = useState<EmergencyAgent[]>(INITIAL_AGENTS);
  const [logMessages, setLogMessages] = useState<AgentLogMessage[]>(INITIAL_LOG_MESSAGES);
  const [helpRequests, setHelpRequests] = useState<CivilianHelpRequest[]>(INITIAL_HELP_REQUESTS);
  const [musterRecords, setMusterRecords] = useState<SafeMusterRecord[]>(INITIAL_MUSTER_RECORDS);
  const [landingCard, setLandingCard] = useState<LandingStatusCard>(INITIAL_LANDING_STATUS_CARD);
  const [connectivityMode, setConnectivityMode] = useState<ConnectivityMode>('NORMAL');
  const [activeModule, setActiveModule] = useState<PlatformModule>('dashboard');
  const [isAlertBroadcasted, setIsAlertBroadcasted] = useState<boolean>(false);

  const currentStage = useMemo(() => SCENARIO_TIMELINE[stageIndex] || SCENARIO_TIMELINE[0], [stageIndex]);

  // Synchronize incident and vessel state when scenario stage changes
  useEffect(() => {
    const stage = SCENARIO_TIMELINE[stageIndex];
    if (!stage) return;

    setIncident((prev) => {
      const next = { ...prev };
      if (stage.vesselUpdate) {
        next.vessel = {
          ...next.vessel,
          speedKnots: stage.vesselUpdate.speedKnots,
          distanceToHarborNm: stage.vesselUpdate.distanceNm,
          estimatedTimeToImpactSeconds: stage.tSeconds,
        };
      }
      if (stage.zoneStateUpdate) {
        next.zones = next.zones.map((z) => {
          if (z.id === 'zone-a-waterfront' && stage.zoneStateUpdate?.zoneAEvacuate !== undefined) {
            return { ...z, isEvacuationOrdered: stage.zoneStateUpdate.zoneAEvacuate };
          }
          if (z.id === 'zone-b-warning' && stage.zoneStateUpdate?.zoneBEvacuate !== undefined) {
            return { ...z, isEvacuationOrdered: stage.zoneStateUpdate.zoneBEvacuate };
          }
          return z;
        });
        if (stage.zoneStateUpdate.waterfrontBlocked) {
          triggerBackendReroute();
          next.defaultRoute = {
            ...next.defaultRoute,
            routeStatus: 'HAZARD_REROUTED',
            primaryInstruction: 'REROUTED: FLÅMSVEGEN AROUND FRETHEIM',
            secondaryInstruction: 'Waterfront is physically cordoned off by Police. Follow green lighted signs.',
          };
        }
      }
      if (stage.t === 'T-7' || stageIndex >= 8) {
        setIsAlertBroadcasted(true);
      }
      return next;
    });

    // Add log entry for stage transition if not already present
    const existing = logMessages.some((m) => m.stageT === stage.t);
    if (!existing) {
      const newMsg: AgentLogMessage = {
        id: `msg-${Date.now()}-${stage.t}`,
        agentId: stage.actors[0]?.toLowerCase().replace(/\s+/g, '_') || 'main',
        agentName: stage.actors[0] || 'SYSTEM',
        timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        stageT: stage.t,
        content: stage.description,
        type: stage.highlight === 'help' || stage.highlight === 'ship' ? 'ALERT' : 'INFO',
      };
      setLogMessages((prev) => [newMsg, ...prev].slice(0, 30));
    }
  }, [stageIndex]);

  // Automated playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 4000 / playbackSpeed;
    const timer = setInterval(() => {
      setStageIndex((prev) => {
        if (prev >= SCENARIO_TIMELINE.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Periodic synchronization with simulator backend (port 4000)
  useEffect(() => {
    let isMounted = true;

    const syncWithBackend = async () => {
      const state = await fetchSimulatorState();
      if (!state || !isMounted) return;

      // Ingest live help requests from mobile app
      if (state.helpRequests && state.helpRequests.length > 0) {
        setHelpRequests((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          state.helpRequests.forEach((req) => {
            const mappedCondition = normaliseCondition(req.condition);
            const mappedSeverity = severityFor(mappedCondition);
            const mappedState = req.state === 'ACKNOWLEDGED' ? 'ACKNOWLEDGED' : 'RECEIVED';

            /* The app posts `location` as a place name today and as a coordinate
               object once GPS is granted. Read whichever arrived instead of
               silently dropping both onto one fallback pin. */
            const loc = req.approximateLocation;
            const hasFix =
              !!loc && typeof loc === 'object' && typeof loc.latitude === 'number';
            const lat = hasFix ? (loc as { latitude: number }).latitude : 60.8624;
            const lng = hasFix ? (loc as { longitude: number }).longitude : 7.1145;
            const where = hasFix
              ? 'Live GPS pin from citizen app'
              : typeof loc === 'string' && loc.trim()
                ? loc
                : 'Live signal — no GPS fix';
            const toSafeZone = distanceMeters(
              { latitude: lat, longitude: lng },
              { latitude: INITIAL_SAFE_ZONE.latitude, longitude: INITIAL_SAFE_ZONE.longitude }
            );

            const existing = map.get(req.id);
            if (existing) {
              map.set(req.id, {
                ...existing,
                state: mappedState,
                responderNotes: req.responderNotes || existing.responderNotes,
              });
            } else {
              map.set(req.id, {
                id: req.id,
                civilianAlias: req.deviceId,
                condition: mappedCondition,
                severity: mappedSeverity,
                coordinates: { latitude: lat, longitude: lng },
                distanceToHospitalMeters: toSafeZone,
                locationDescription: where,
                timestamp: req.timestamp,
                state: mappedState,
                responderNotes: req.responderNotes,
              });
            }
          });
          return Array.from(map.values());
        });
      }

      // Ingest safe check-ins
      if (state.safeReports && state.safeReports.length > 0) {
        setMusterRecords((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          state.safeReports.forEach((sr) => {
            if (!map.has(sr.id)) {
              map.set(sr.id, {
                id: sr.id,
                civilianAlias: sr.deviceId,
                safeZoneId: 'safe-flam-school',
                safeZoneName: sr.safeZoneName,
                timestamp: sr.timestamp,
                isWithFamily: false,
              });
            }
          });
          return Array.from(map.values());
        });
      }

      // Ingest live agent logs
      if (state.agentLogs && state.agentLogs.length > 0) {
        setLogMessages((prev) => {
          const map = new Map(prev.map((l) => [l.id, l]));
          state.agentLogs.forEach((al) => {
            if (!map.has(al.id)) {
              map.set(al.id, {
                id: al.id,
                agentId: al.agent.toLowerCase().replace(/\s+/g, '_'),
                agentName: al.agent,
                timestamp: al.timestamp,
                stageT: 'LIVE',
                content: al.message,
                type: al.message.includes('Distress') || al.message.includes('alert') ? 'ALERT' : 'INFO',
                authorized: true,
              });
            }
          });
          return Array.from(map.values()).slice(0, 40);
        });
      }

      // Ingest device connectivity
      if (state.isDegradedConnection) {
        setConnectivityMode('LIMITED');
      }
    };

    const interval = setInterval(syncWithBackend, 1500);
    syncWithBackend();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* Actions */
  const playScenario = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pauseScenario = useCallback(() => setIsPlaying(false), []);
  
  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setStageIndex((prev) => Math.min(prev + 1, SCENARIO_TIMELINE.length - 1));
  }, []);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setStageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const jumpToStage = useCallback((index: number) => {
    setIsPlaying(false);
    setStageIndex(Math.max(0, Math.min(index, SCENARIO_TIMELINE.length - 1)));
  }, []);

  const resetScenario = useCallback(() => {
    setIsPlaying(false);
    setStageIndex(0);
    setIncident(INITIAL_INCIDENT);
    setIsAlertBroadcasted(false);
    setHelpRequests(INITIAL_HELP_REQUESTS);
    setMusterRecords(INITIAL_MUSTER_RECORDS);
    endBackendScenario();
  }, []);

  const acknowledgeHelpRequest = useCallback((id: string, notes?: string) => {
    acknowledgeBackendHelp(id);
    setHelpRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              state: 'ACKNOWLEDGED',
              responderNotes: notes || 'Medical responder team acknowledged; en route to coordinates.',
            }
          : req
      )
    );
  }, []);

  const updateHelpRequestState = useCallback((id: string, state: HelpRequestState) => {
    setHelpRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, state } : req))
    );
  }, []);

  const broadcastPublicAlert = useCallback(() => {
    setIsAlertBroadcasted(true);
    triggerBackendFlamScenario();
    setIncident((prev) => ({
      ...prev,
      civiliansNotifiedCount: 2843,
    }));
    const alertMsg: AgentLogMessage = {
      id: `broadcast-${Date.now()}`,
      agentId: 'public_alert',
      agentName: 'PUBLIC ALERT AGENT',
      timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      stageT: currentStage.t,
      content: 'BROADCAST DISPATCHED: Emergency Push Notification broadcast to 2,843 smartphones in Zone A & B.',
      type: 'ALERT',
      authorized: true,
    };
    setLogMessages((prev) => [alertMsg, ...prev]);
  }, [currentStage.t]);

  const authorizeAgentMessage = useCallback((messageId: string) => {
    setLogMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, authorized: true } : m))
    );
  }, []);

  const addCustomAgentLog = useCallback((agentName: string, content: string, type: 'ALERT' | 'INFO' = 'INFO') => {
    const newMsg: AgentLogMessage = {
      id: `ai-msg-${Date.now()}`,
      agentId: agentName.toLowerCase().replace(/\s+/g, '_'),
      agentName: agentName.toUpperCase(),
      timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      stageT: currentStage.t,
      content,
      type,
      authorized: true,
    };
    setLogMessages((prev) => [newMsg, ...prev].slice(0, 50));
  }, [currentStage.t]);

  const updateLandingCard = useCallback((partial: Partial<LandingStatusCard>) => {
    setLandingCard((prev) => ({
      ...prev,
      ...partial,
      lastUpdatedTimestamp: new Date().toISOString(),
    }));
  }, []);

  const unacknowledgedDistressCount = useMemo(() => {
    return helpRequests.filter((r) => r.state === 'RECEIVED').length;
  }, [helpRequests]);

  const value = useMemo<IncidentContextValue>(
    () => ({
      incident,
      currentStage,
      stageIndex,
      totalStages: SCENARIO_TIMELINE.length,
      isPlaying,
      playbackSpeed,
      agents,
      logMessages,
      helpRequests,
      musterRecords,
      landingCard,
      connectivityMode,
      activeModule,
      isAlertBroadcasted,
      unacknowledgedDistressCount,
      playScenario,
      pauseScenario,
      stepForward,
      stepBackward,
      jumpToStage,
      resetScenario,
      setPlaybackSpeed,
      acknowledgeHelpRequest,
      updateHelpRequestState,
      broadcastPublicAlert,
      authorizeAgentMessage,
      addCustomAgentLog,
      updateLandingCard,
      setConnectivityMode,
      setActiveModule,
    }),
    [
      incident,
      currentStage,
      stageIndex,
      isPlaying,
      playbackSpeed,
      agents,
      logMessages,
      helpRequests,
      musterRecords,
      landingCard,
      connectivityMode,
      activeModule,
      isAlertBroadcasted,
      unacknowledgedDistressCount,
      playScenario,
      pauseScenario,
      stepForward,
      stepBackward,
      jumpToStage,
      resetScenario,
      setPlaybackSpeed,
      acknowledgeHelpRequest,
      updateHelpRequestState,
      broadcastPublicAlert,
      authorizeAgentMessage,
      addCustomAgentLog,
      updateLandingCard,
      setConnectivityMode,
      setActiveModule,
    ]
  );

  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>;
};

export const useIncident = (): IncidentContextValue => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};
