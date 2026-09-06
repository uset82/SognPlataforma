import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

import { useIncident } from '../../state/IncidentContext';
import { Button, Eyebrow, Pill } from '../primitives';
import type { PlaybackSpeed } from '../../types/scenario';
import s from './shell.module.css';

/**
 * The meridian, expanded. Drives the T-15 → T-0 drill.
 * Collapses to a single strip so the console can reclaim the height.
 */
export const ScenarioScrubber: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
}> = ({ collapsed, onToggle }) => {
  const {
    currentStage,
    stageIndex,
    totalStages,
    isPlaying,
    playbackSpeed,
    playScenario,
    pauseScenario,
    stepForward,
    stepBackward,
    resetScenario,
    setPlaybackSpeed,
  } = useIncident();

  if (collapsed) {
    return (
      <button type="button" className={s.scrubToggle} onClick={onToggle}>
        <ChevronUp size={13} strokeWidth={2} />
        Scenario F-03 · {currentStage.t} · stage {stageIndex + 1} of {totalStages}
      </button>
    );
  }

  return (
    <div className={s.scrubber}>
      <div className={s.transport}>
        <Button
          size="sm"
          variant="ghost"
          onClick={stepBackward}
          disabled={stageIndex === 0}
          aria-label="Previous stage"
          icon={<SkipBack size={14} strokeWidth={1.8} />}
        />
        <Button
          size="md"
          variant={isPlaying ? 'default' : 'critical'}
          onClick={isPlaying ? pauseScenario : playScenario}
          icon={isPlaying ? <Pause size={14} strokeWidth={2} /> : <Play size={14} strokeWidth={2} />}
        >
          {isPlaying ? 'Pause' : 'Run playbook'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={stepForward}
          disabled={stageIndex >= totalStages - 1}
          aria-label="Next stage"
          icon={<SkipForward size={14} strokeWidth={1.8} />}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={resetScenario}
          aria-label="Reset scenario"
          icon={<RotateCcw size={14} strokeWidth={1.8} />}
        />
      </div>

      <div className={s.stageInfo}>
        <span className={s.stageTitleRow}>
          <Pill tone="critical">{currentStage.t}</Pill>
          <span className={s.stageTitle}>{currentStage.title}</span>
          <Eyebrow muted>
            {stageIndex + 1} / {totalStages}
          </Eyebrow>
        </span>
        <span className={s.stageDesc}>{currentStage.description}</span>
      </div>

      <div className={s.speedGroup}>
        {([1, 2, 5] as PlaybackSpeed[]).map((sp) => (
          <Button
            key={sp}
            size="sm"
            variant="ghost"
            on={playbackSpeed === sp}
            onClick={() => setPlaybackSpeed(sp)}
          >
            {sp}×
          </Button>
        ))}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onToggle}
        aria-label="Collapse scenario bar"
        icon={<ChevronDown size={14} strokeWidth={2} />}
      />
    </div>
  );
};
