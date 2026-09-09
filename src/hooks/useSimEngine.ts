import { useCallback, useEffect, useRef, useState } from 'react';
import { SimEngine, type SimSnapshot } from '../lib/simEngine';
import type { ControlsState } from '../lib/types';

/**
 * React binding for the client simulation engine.
 * Optionally hydrates / validates against `/api/sim-state` (graceful fallback).
 */
export function useSimEngine() {
  const engineRef = useRef<SimEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimEngine({ status: 'running' });
  }
  const [snap, setSnap] = useState<SimSnapshot>(() => engineRef.current!.getSnapshot());

  useEffect(() => {
    const engine = engineRef.current!;
    const unsub = engine.subscribe(setSnap);
    engine.start();

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/sim-state');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          defaults?: Partial<ControlsState>;
        };
        if (cancelled) return;
        if (data.defaults) {
          const rest: Partial<ControlsState> = { ...data.defaults };
          delete rest.status; // keep auto-running client engine
          engine.setControls(rest);
        }
        engine.markServerValidated(true);
      } catch {
        if (!cancelled) engine.markServerValidated(false);
      }
    })();

    return () => {
      cancelled = true;
      unsub();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const setControls = useCallback((patch: Partial<ControlsState>) => {
    engineRef.current?.setControls(patch);
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  const replaceCartridges = useCallback(() => {
    engineRef.current?.replaceCartridges();
  }, []);

  const validateOnServer = useCallback(
    async (controls: Pick<ControlsState, 'inletTempC' | 'contaminationLoad' | 'fanSpeedPct'>) => {
      try {
        const res = await fetch('/api/sim-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inletTemp: controls.inletTempC,
            contamination: controls.contaminationLoad,
            fanSpeed: controls.fanSpeedPct,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        engineRef.current?.markServerValidated(true);
        return data as Record<string, unknown>;
      } catch {
        engineRef.current?.markServerValidated(false);
        return null;
      }
    },
    [],
  );

  return {
    snap,
    setControls,
    reset,
    replaceCartridges,
    validateOnServer,
  };
}
