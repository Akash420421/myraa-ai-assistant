/**
 * React host for the 3D character.
 *
 * Owns the canvas and the CharacterSystem lifecycle, and forwards application
 * state into the render loop. Deliberately re-renders as little as possible:
 * per-frame data is pushed through a ref into the running loop rather than
 * through React state, so the animation never depends on React's scheduler.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, TriangleAlert } from 'lucide-react';
import { CharacterSystem } from './core/CharacterSystem';
import { getCharacterConfig } from './config/registry';
import type { CharacterActivity } from './behaviour/behaviours';

export interface MyraaCharacterProps {
  /** Which character to display. Defaults to the registry default. */
  characterId?: string;
  /** What she is currently doing, which drives gaze and behaviour selection. */
  activity: CharacterActivity;
  /** Emotional expression to hold. */
  emotion: string;
  /** MYRAA's voice output, used for lip sync. */
  outputAnalyser: AnalyserNode | null;
  /** The user's microphone, used for listening reactions. */
  inputAnalyser: AnalyserNode | null;
  className?: string;
  /**
   * Enable the WASD / Q / E / L / F / R / 1-4 camera and gaze controls.
   * Defaults on; turn it off if the host app needs those keys.
   */
  controlsEnabled?: boolean;
  /** Show the on-screen control hint overlay. */
  showControlHint?: boolean;
  /** Reflected-highlight scale from 0 (matte) to 2 (strong). Defaults to 1. */
  reflectionStrength?: number;
}

interface LoadState {
  phase: string;
  ratio: number;
  error: string | null;
}

export const MyraaCharacter: React.FC<MyraaCharacterProps> = ({
  characterId,
  activity,
  emotion,
  outputAnalyser,
  inputAnalyser,
  className,
  controlsEnabled = true,
  showControlHint = true,
  reflectionStrength = 1,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const systemRef = useRef<CharacterSystem | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  const [load, setLoad] = useState<LoadState>({ phase: 'Starting', ratio: 0, error: null });
  const [viewLocked, setViewLocked] = useState(false);
  const [eyeTracking, setEyeTracking] = useState(false);

  // ---- system lifecycle ---------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // The canvas is created per system instance rather than rendered by React.
    // A WebGLRenderer takes ownership of its canvas' GL context, so reusing one
    // canvas across mounts means a second renderer inherits a context whose
    // programs the first renderer already disposed - which silently corrupts
    // shader compilation. React StrictMode mounts twice in development, so this
    // is the normal path, not an edge case.
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 w-full h-full';
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 1s ease';
    container.appendChild(canvas);
    canvasElRef.current = canvas;

    let cancelled = false;
    const config = getCharacterConfig(characterId);

    const system = new CharacterSystem({
      canvas,
      config,
      onProgress: (phase, ratio) => {
        if (!cancelled) setLoad({ phase, ratio, error: null });
      },
      onError: (error) => {
        console.error('[MyraaCharacter]', error);
        if (!cancelled) setLoad((prev) => ({ ...prev, error: error.message }));
      },
    });
    systemRef.current = system;

    // Dev-only handle for inspecting the live character from the console.
    if (import.meta.env.DEV) {
      (window as unknown as { __myraa?: CharacterSystem }).__myraa = system;
    }

    system.resize(container.clientWidth, container.clientHeight);

    system
      .load()
      .then(() => {
        if (cancelled) return;
        system.start();
      })
      .catch(() => {
        // Already surfaced through onError.
      });

    return () => {
      cancelled = true;
      systemRef.current = null;
      system.dispose();
      canvas.remove();
      if (canvasElRef.current === canvas) canvasElRef.current = null;
    };
  }, [characterId]);

  // Fade the canvas in once the character is ready to be seen.
  useEffect(() => {
    const canvas = canvasElRef.current;
    if (canvas) canvas.style.opacity = load.ratio >= 1 && !load.error ? '1' : '0';
  }, [load.ratio, load.error]);

  // ---- responsive sizing --------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      systemRef.current?.resize(width, height);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ---- pointer parallax + eye tracking ------------------------------------
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    systemRef.current?.setPointer(x, y);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove]);

  // ---- camera + gaze keyboard controls ------------------------------------
  //
  // WASD orbits freely (so any angle, including her back and either side),
  // Q/E dolly, L locks the view in place, F toggles eye tracking, R resets,
  // and 1-4 snap to fixed viewpoints. Held keys are integrated per frame so
  // movement is smooth rather than key-repeat steppy.
  useEffect(() => {
    if (!controlsEnabled) return;
    const held = new Set<string>();
    let raf = 0;
    let last = performance.now();

    const ORBIT_SPEED = 1.9; // radians per second
    const ZOOM_SPEED = 14; // model units per second

    const step = () => {
      raf = requestAnimationFrame(step);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const system = systemRef.current;
      if (!system) return;

      let yaw = 0;
      let pitch = 0;
      if (held.has('a')) yaw -= ORBIT_SPEED * dt;
      if (held.has('d')) yaw += ORBIT_SPEED * dt;
      if (held.has('w')) pitch += ORBIT_SPEED * 0.6 * dt;
      if (held.has('s')) pitch -= ORBIT_SPEED * 0.6 * dt;
      if (yaw || pitch) system.orbitBy(yaw, pitch);

      let zoom = 0;
      if (held.has('q')) zoom += ZOOM_SPEED * dt;
      if (held.has('e')) zoom -= ZOOM_SPEED * dt;
      if (zoom) system.zoomBy(zoom);
    };
    raf = requestAnimationFrame(step);

    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const system = systemRef.current;
      if (!system) return;

      if ('wasdqe'.includes(key)) {
        held.add(key);
        event.preventDefault();
        return;
      }

      switch (key) {
        case 'l':
          system.setViewLocked(!system.isViewLocked);
          setViewLocked(system.isViewLocked);
          break;
        case 'f':
          system.setEyeTracking(!system.isEyeTracking);
          setEyeTracking(system.isEyeTracking);
          break;
        case 'r':
          system.resetView();
          break;
        case '1':
          system.setView('front');
          break;
        case '2':
          system.setView('threeQuarter');
          break;
        case '3':
          system.setView('right');
          break;
        case '4':
          system.setView('back');
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    const onKeyUp = (event: KeyboardEvent) => held.delete(event.key.toLowerCase());
    // Held keys must not stick if the window loses focus mid-press.
    const onBlur = () => held.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [controlsEnabled]);

  // ---- pause while hidden -------------------------------------------------
  // A desktop companion should not burn GPU while its window is in the
  // background.
  useEffect(() => {
    const onVisibility = () => {
      const system = systemRef.current;
      if (!system?.isLoaded) return;
      if (document.hidden) system.stop();
      else system.start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // ---- per-frame inputs ---------------------------------------------------
  useEffect(() => {
    systemRef.current?.setFrameInput({ activity, emotion, outputAnalyser, inputAnalyser });
  }, [activity, emotion, outputAnalyser, inputAnalyser]);

  useEffect(() => {
    systemRef.current?.setReflectionStrength(reflectionStrength);
  }, [characterId, reflectionStrength]);

  const toggleViewLock = () => {
    const system = systemRef.current;
    if (!system) return;
    system.setViewLocked(!system.isViewLocked);
    setViewLocked(system.isViewLocked);
  };

  const toggleEyeTracking = () => {
    const system = systemRef.current;
    if (!system) return;
    system.setEyeTracking(!system.isEyeTracking);
    setEyeTracking(system.isEyeTracking);
  };

  const selectView = (view: 'front' | 'threeQuarter' | 'right' | 'back') => {
    systemRef.current?.setView(view);
  };

  const ready = load.ratio >= 1 && !load.error;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className ?? ''}`}
    >
      {/* The WebGL canvas is appended imperatively by the effect above. */}

      {!ready && !load.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <Sparkles className="text-cyan-400 animate-pulse" size={28} />
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">
            {load.phase}
          </div>
          <div className="h-px w-40 bg-white/10 overflow-hidden rounded-full">
            <div
              className="h-full bg-cyan-400/70 transition-[width] duration-300"
              style={{ width: `${Math.round(load.ratio * 100)}%` }}
            />
          </div>
        </div>
      )}

      {ready && controlsEnabled && showControlHint && (
        <div className="absolute bottom-3 right-3 z-40 flex flex-col items-end gap-1.5 select-none">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={toggleViewLock}
              aria-pressed={viewLocked}
              title="Lock or unlock the current camera view (L)"
              className={`px-2 py-0.5 rounded-md border text-[9px] font-mono tracking-widest uppercase transition ${
                viewLocked
                  ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-amber-400/40 hover:text-amber-200'
              }`}
            >
              {viewLocked ? 'View locked' : 'View free'}
            </button>
            <button
              type="button"
              onClick={toggleEyeTracking}
              aria-pressed={eyeTracking}
              title="Toggle eyes following the mouse (F)"
              className={`px-2 py-0.5 rounded-md border text-[9px] font-mono tracking-widest uppercase transition ${
                eyeTracking
                  ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200'
              }`}
            >
              {eyeTracking ? 'Eyes tracking' : 'Eyes auto'}
            </button>
          </div>
          <div className="flex gap-1 pointer-events-auto">
            {(
              [
                ['Front', 'front'],
                ['¾', 'threeQuarter'],
                ['Side', 'right'],
                ['Back', 'back'],
              ] as const
            ).map(([label, view]) => (
              <button
                key={view}
                type="button"
                onClick={() => selectView(view)}
                disabled={viewLocked}
                title={`${label} camera preset`}
                className="min-w-9 px-1.5 py-0.5 rounded border border-white/10 bg-slate-950/60 text-[9px] font-mono uppercase tracking-wider text-slate-400 transition hover:border-fuchsia-400/40 hover:text-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="pointer-events-none px-2.5 py-1 rounded-md border border-white/5 bg-slate-950/50 backdrop-blur-sm text-[9px] font-mono tracking-wider text-slate-500">
            WASD rotate · Q/E zoom · L lock · F eyes · R reset · 1-4 views
          </div>
        </div>
      )}

      {load.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <TriangleAlert className="text-amber-400" size={26} />
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/80">
            Character failed to load
          </div>
          <p className="max-w-sm text-xs text-slate-400 leading-relaxed">{load.error}</p>
        </div>
      )}
    </div>
  );
};
