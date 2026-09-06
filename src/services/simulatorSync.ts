export interface SimulatorState {
  activeIncident: any | null;
  registeredDevices: Array<{ deviceId: string; pushToken?: string }>;
  helpRequests: Array<{
    id: string;
    condition: string;
    deviceId: string;
    approximateLocation?: { latitude: number; longitude: number; accuracyMeters?: number };
    timestamp: string;
    state: string;
    responderNotes?: string;
  }>;
  safeReports: Array<{
    id: string;
    deviceId: string;
    timestamp: string;
    safeZoneName: string;
  }>;
  agentLogs: Array<{
    id: string;
    agent: string;
    message: string;
    timestamp: string;
  }>;
  isDegradedConnection: boolean;
}

export async function fetchSimulatorState(): Promise<SimulatorState | null> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function triggerBackendFlamScenario(): Promise<boolean> {
  try {
    const res = await fetch('/api/scenario/flam', { method: 'POST' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function triggerBackendReroute(): Promise<boolean> {
  try {
    const res = await fetch('/api/scenario/reroute', { method: 'POST' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function endBackendScenario(): Promise<boolean> {
  try {
    const res = await fetch('/api/scenario/end', { method: 'POST' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function acknowledgeBackendHelp(id: string): Promise<boolean> {
  try {
    const res = await fetch('/api/help/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
