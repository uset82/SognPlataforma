import React from 'react';
import { IncidentProvider } from './state/IncidentContext';
import { AppShell } from './components/shell/AppShell';
import './styles/base.css';

export const App: React.FC = () => (
  <IncidentProvider>
    <AppShell />
  </IncidentProvider>
);

export default App;
