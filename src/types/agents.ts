export type AgentGroup = 'input' | 'orchestration' | 'response' | 'public' | 'support';

export type AgentOperationalStatus = 'standby' | 'active' | 'alert' | 'transmitting';

export interface EmergencyAgent {
  id: string;
  name: string;
  group: AgentGroup;
  role: string;
  inputDescription: string;
  outputDescription: string;
  status: AgentOperationalStatus;
  statusText: string;
  exampleMessage: string;
  lastActiveTimestamp?: string;
  requiresHumanAuthorization?: boolean;
}

export interface AgentLogMessage {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  stageT: string;
  content: string;
  type: 'INFO' | 'ACTION' | 'ALERT' | 'AUTHORIZATION_REQUEST';
  authorized?: boolean;
}
