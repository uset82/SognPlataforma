import React, { useState } from 'react';

import { CommandRail } from './CommandRail';
import { AlertBar } from './AlertBar';
import { TMinusMeridian } from './TMinusMeridian';
import { ScenarioScrubber } from './ScenarioScrubber';
import { useIncident } from '../../state/IncidentContext';

import { IncidentDashboard } from '../modules/IncidentDashboard';
import { RiskMap } from '../modules/RiskMap';
import { AgentOrchestration } from '../modules/AgentOrchestration';
import { PublicAlert } from '../modules/PublicAlert';
import { MedicalRescue } from '../modules/MedicalRescue';
import { CivilianTriage } from '../modules/CivilianTriage';
import { FjordLink } from '../modules/FjordLink';
import { ConceptPitch } from '../modules/ConceptPitch';

import s from './shell.module.css';

const ModuleOutlet: React.FC = () => {
  const { activeModule } = useIncident();
  switch (activeModule) {
    case 'gis-map':
      return <RiskMap />;
    case 'agents':
      return <AgentOrchestration />;
    case 'public-alert':
      return <PublicAlert />;
    case 'medical':
      return <MedicalRescue />;
    case 'triage':
      return <CivilianTriage />;
    case 'fjordlink':
      return <FjordLink />;
    case 'presentation':
      return <ConceptPitch />;
    case 'dashboard':
    default:
      return <IncidentDashboard />;
  }
};

export const AppShell: React.FC = () => {
  const [railCollapsed, setRailCollapsed] = useState(false);
  /* On a phone the expanded scenario bar wraps to three rows and eats ~140px
     before any content — so it starts collapsed to its single-line summary and
     opens on tap. Desktop keeps it open, where the height is affordable. */
  const [scrubCollapsed, setScrubCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches
  );
  const { activeModule } = useIncident();

  return (
    <div className={s.shell}>
      <CommandRail collapsed={railCollapsed} onToggle={() => setRailCollapsed((v) => !v)} />

      <header className={s.header}>
        <AlertBar />
        {/* The signature element: present on every module. */}
        <TMinusMeridian />
      </header>

      {/* Keying on the module remounts the outlet, which replays the entry
          stagger and guarantees map instances never leak between screens. */}
      <main className={s.main} key={activeModule}>
        <ModuleOutlet />
      </main>

      <footer className={s.footer}>
        <ScenarioScrubber collapsed={scrubCollapsed} onToggle={() => setScrubCollapsed((v) => !v)} />
      </footer>
    </div>
  );
};
