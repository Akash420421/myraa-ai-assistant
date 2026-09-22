/**
 * Character system orchestrator.
 *
 * Owns the stage, the loaded model and every animation subsystem, and runs
 * them in the one order that produces correct results:
 *
 *   1. reset the pose to rest and clear the morph accumulator
 *   2. procedural idle          -> pose
 *   3. behaviour director       -> pose
 *   4. gaze                     -> pose
 *   5. apply the composed pose to the skeleton
 *   6. face (expression, blink, visemes) -> morph accumulator
 *   7. commit vertex morphs, then bone morphs additively on top of the pose
 *   8. solve grants (append-parent inheritance)
 *   9. refresh world matrices
 *  10. simulate spring physics, which reads those matrices and writes back
 *  11. frame the camera, refresh lighting uniforms, render
 *
 * Steps 8 and 10 must come after the pose and morphs: grants inherit the
 * *animated* rotation of their source, and physics needs the fully-posed
 * skeleton to derive inertia from.
 */
import * as THREE from 'three';
import type { CharacterConfig } from '../config/types';
import { loadPmx } from '../loaders/PmxLoader';
import type { PmxModel } from '../loaders/pmxTypes';
import {
  createAnimeMaterial,
  resolveMaterialRole,
  setAnimeMaterialReflectionStrength,
} from '../materials/AnimeMaterial';
import { createOutlineMesh } from '../materials/OutlineMesh';
import { AnimeLightingRig } from '../lighting/AnimeLightingRig';
import { Stage } from './Stage';
import { MorphController } from '../face/MorphController';
import { FaceController } from '../face/FaceController';
import { LipSync, type VisemeWeights } from '../face/LipSync';
import { PoseBuffer } from '../animation/PoseBuffer';
import { ProceduralIdle } from '../animation/ProceduralIdle';
import { GazeController, type GazeMode } from '../animation/GazeController';
import { PerformanceController } from '../animation/PerformanceController';
import { GrantSolver } from '../animation/GrantSolver';
import { SpringBonePhysics } from '../physics/SpringBonePhysics';
import { BehaviourDirector } from '../behaviour/BehaviourDirector';
import type { CharacterActivity } from '../behaviour/behaviours';

export interface CharacterSystemOptions {
  canvas: HTMLCanvasElement;
  config: CharacterConfig;
  onProgress?: (phase: string, ratio: number) => void;
  onError?: (error: Error) => void;
}

/** Per-frame inputs from the application. */
export interface CharacterFrameInput {
  activity: CharacterActivity;
  emotion: string;
  /** Analyser carrying MYRAA's voice, used for lip sync. */
  outputAnalyser: AnalyserNode | null;
  /** Analyser carrying the user's microphone, used for listening reactions. */
  inputAnalyser: AnalyserNode | null;
}

/** Longest frame the simulation will accept, to survive tab stalls. */
const MAX_DELTA = 1 / 20;

export class CharacterSystem {
  readonly stage: Stage;
  private readonly config: CharacterConfig;

  private model: PmxModel | null = null;
  private lighting: AnimeLightingRig | null = null;
  private morphs: MorphController | null = null;
  private face: FaceController | null = null;
  private pose: PoseBuffer | null = null;
  private idle: ProceduralIdle | null = null;
  private performance: PerformanceController | null = null;
  private gaze: GazeController | null = null;
  private grants: GrantSolver | null = null;
  private physics: SpringBonePhysics | null = null;
  private behaviours: BehaviourDirector | null = null;
  private readonly lipSync: LipSync;

  private readonly clock = new THREE.Clock();
  private rafHandle = 0;
  private running = false;
  private disposed = false;
  private lastFrameTime = 0;

  /** Smoothed 0..1 measure of how much the mouth should follow speech. */
  private speechAuthority = 0;
  private currentActivity: CharacterActivity = 'idle';
  /** 1.0 is the authored look; runtime UI may scale reflected light 0..2. */
  private reflectionStrength = 1;

  private readonly focusPoint = new THREE.Vector3();
  /** Latest pointer position in normalised device coordinates. */
  private readonly pointerNdc = new THREE.Vector2();
  private readonly gazePoint = new THREE.Vector3();
  private eyeTracking = false;
  private readonly frameInput: CharacterFrameInput = {
    activity: 'idle',
    emotion: 'idle',
    outputAnalyser: null,
    inputAnalyser: null,
  };

  private readonly onProgress?: (phase: string, ratio: number) => void;
  private readonly onError?: (error: Error) => void;

  constructor(options: CharacterSystemOptions) {
    this.config = options.config;
    this.onProgress = options.onProgress;
    this.onError = options.onError;
    this.stage = new Stage(options.canvas, this.config.render, this.config.camera);
    this.lipSync = new LipSync(this.config.lipSync);
  }

  get isLoaded(): boolean {
    return this.model !== null;
  }

  /** Diagnostics for the settings panel / dev overlay. */
  get diagnostics(): Record<string, unknown> {
    return {
      character: this.config.displayName,
      loaded: this.isLoaded,
      bones: this.model?.bones.length ?? 0,
      vertexMorphs: this.model?.vertexMorphs.size ?? 0,
      boneMorphs: this.model?.boneMorphs.size ?? 0,
      physicsNodes: this.physics?.nodeCount ?? 0,
      physicsGroups: this.physics?.groupBreakdown ?? {},
      grants: this.grants?.count ?? 0,
      behaviour: this.behaviours?.currentName ?? null,
      expression: this.face?.expression ?? null,
      gaze: this.gaze?.currentMode ?? null,
    };
  }

  async load(): Promise<void> {
    try {
      const model = await loadPmx({
        modelUrl: this.config.modelUrl,
        textureMapUrl: this.config.textureMapUrl,
        onProgress: this.onProgress,
        createMaterial: (raw, textureLoader) => {
          const role = resolveMaterialRole(raw.name, this.config.materialRoles);
          const tuning = this.config.materialTuning[role] ?? {};
          return createAnimeMaterial(raw, role, tuning, textureLoader, this.stage.maxAnisotropy);
        },
      });

      if (this.disposed) return;
      this.model = model;
      this.applyReflectionStrength();

      // ---- scene assembly -------------------------------------------------
      const root = new THREE.Group();
      root.name = `character:${this.config.id}`;
      root.scale.setScalar(this.config.scale);
      root.position.y = this.config.groundOffset;

      const shadows = this.config.lighting.shadow.enabled;
      model.mesh.castShadow = shadows;
      model.mesh.receiveShadow = shadows;
      root.add(model.mesh);

      if (this.config.outline?.enabled) {
        const outline = createOutlineMesh(
          model,
          (name) => resolveMaterialRole(name, this.config.materialRoles),
          (role) => this.config.materialTuning[role] ?? {},
          { scale: this.config.outline.scale ?? 1 }
        );
        if (outline) root.add(outline);
      }

      // Hide any materials the config asks to suppress.
      if (this.config.hiddenMaterials?.length) {
        const hidden = new Set(this.config.hiddenMaterials);
        const materials = model.mesh.material as THREE.Material[];
        model.materials.forEach((info, i) => {
          if (hidden.has(info.name)) materials[i].visible = false;
        });
      }

      this.stage.scene.add(root);

      // ---- lighting -------------------------------------------------------
      this.lighting = new AnimeLightingRig(this.config.lighting);
      this.stage.scene.add(this.lighting.group);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const radius = box.getSize(new THREE.Vector3()).length() * 0.5;
      this.lighting.frame(center, radius);

      // ---- animation systems ---------------------------------------------
      // Order matters: PoseBuffer and GrantSolver capture the rest pose, so
      // they must be constructed before anything moves a bone.
      this.morphs = new MorphController(model);

      this.pose = new PoseBuffer(model);
      this.pose.registerAll(Object.values(this.config.bones));

      // Replace the model's authored A-pose with a relaxed stance BEFORE
      // anything captures a rest state, so the natural pose becomes the
      // baseline every other system works relative to.
      if (this.config.basePose) {
        for (const [slot, offset] of Object.entries(this.config.basePose)) {
          const boneName = this.config.bones[slot as keyof typeof this.config.bones];
          this.pose.bakeIntoRest(boneName, offset.x ?? 0, offset.y ?? 0, offset.z ?? 0);
        }
      }

      // Constructed after the base pose so inherited rotations are measured
      // from the natural stance, not the A-pose.
      this.grants = new GrantSolver(model);

      // Bone morphs (eyebrows) and grant targets are written additively on top
      // of the pose each frame, so they must be reset each frame too.
      for (const bone of this.morphs.morphedBones) this.pose.register(bone.name);
      this.pose.registerAll(this.grants.affectedBoneNames);

      this.face = new FaceController(this.morphs, this.config.morphs, this.config.idle);
      this.idle = new ProceduralIdle(this.config.bones, this.config.idle);
      this.performance = new PerformanceController();
      this.gaze = new GazeController(model, this.config.bones, this.config.idle);
      this.behaviours = new BehaviourDirector(this.config.behaviour);

      this.physics = new SpringBonePhysics(model, this.config.physics);
      model.mesh.updateMatrixWorld(true);
      this.physics.reset();

      this.updateFocus();
      this.onProgress?.('Ready', 1);
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /** Push the latest application state. Cheap; safe to call every render. */
  setFrameInput(input: Partial<CharacterFrameInput>): void {
    Object.assign(this.frameInput, input);
  }

  setPointer(x: number, y: number): void {
    this.pointerNdc.set(x, y);
    this.stage.setPointer(x, y);
  }

  // ---- user camera control (forwarded to the stage) -----------------------

  orbitBy(deltaYaw: number, deltaPitch: number): void {
    this.stage.orbitBy(deltaYaw, deltaPitch);
  }

  zoomBy(delta: number): void {
    this.stage.zoomBy(delta);
  }

  setViewLocked(locked: boolean): void {
    this.stage.setLocked(locked);
  }

  get isViewLocked(): boolean {
    return this.stage.isLocked;
  }

  /**
   * Scale only additive material reflections (specular, hair bands, sphere-map
   * shine and rim). Diffuse illumination, shadows and exposure stay untouched.
   */
  setReflectionStrength(strength: number): void {
    this.reflectionStrength = THREE.MathUtils.clamp(strength, 0, 2);
    this.applyReflectionStrength();
  }

  private applyReflectionStrength(): void {
    if (!this.model) return;
    const materials = this.model.mesh.material;
    for (const material of Array.isArray(materials) ? materials : [materials]) {
      setAnimeMaterialReflectionStrength(material, this.reflectionStrength);
    }
  }

  resetView(): void {
    this.stage.resetView();
  }

  /** Snap to a named viewpoint around the character. */
  setView(preset: 'front' | 'back' | 'left' | 'right' | 'threeQuarter'): void {
    const yaw = {
      front: 0,
      threeQuarter: Math.PI * 0.22,
      right: Math.PI * 0.5,
      back: Math.PI,
      left: -Math.PI * 0.5,
    }[preset];
    this.stage.setOrbit(yaw, 0);
  }

  /**
   * When enabled, her eyes (and a little head follow) track the mouse pointer
   * instead of running the automatic gaze behaviour.
   */
  setEyeTracking(enabled: boolean): void {
    this.eyeTracking = enabled;
  }

  get isEyeTracking(): boolean {
    return this.eyeTracking;
  }

  resize(width: number, height: number): void {
    this.stage.resize(width, height);
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.start();
    this.lastFrameTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
    this.rafHandle = 0;
  }

  private tick = (): void => {
    if (!this.running || this.disposed) return;
    this.rafHandle = requestAnimationFrame(this.tick);

    const now = performance.now();
    // Throttle to the configured target frame rate. A companion app shares
    // the GPU with everything else on the desktop; there is no reason to
    // render faster than the character can be perceived to move.
    const minInterval = 1000 / this.config.render.targetFps - 1;
    if (now - this.lastFrameTime < minInterval) return;

    const delta = Math.min((now - this.lastFrameTime) / 1000, MAX_DELTA);
    this.lastFrameTime = now;

    try {
      this.update(delta);
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.stop();
    }
  };

  /** Resolve the camera focus point from the configured bone. */
  private updateFocus(): void {
    const model = this.model;
    if (!model) return;
    const index = model.boneIndexByName.get(this.config.camera.targetBone);
    const bone = index !== undefined ? model.bones[index] : undefined;
    if (bone) {
      bone.getWorldPosition(this.focusPoint);
    } else {
      model.mesh.getWorldPosition(this.focusPoint);
    }
    this.focusPoint.y += this.config.camera.targetOffset;
    this.stage.setFocus(this.focusPoint);
  }

  private update(delta: number): void {
    const {
      model, pose, morphs, face, idle, performance, gaze, grants,
      physics, behaviours, lighting,
    } = this;
    if (
      !model || !pose || !morphs || !face || !idle || !performance ||
      !gaze || !grants || !physics || !behaviours || !lighting
    ) {
      return;
    }

    const input = this.frameInput;
    this.currentActivity = input.activity;

    // ---- speech authority -------------------------------------------------
    // How much the lip-sync engine owns the mouth, eased so the mouth does not
    // pop between talking and not talking.
    const wantsSpeech = input.activity === 'talking';
    this.speechAuthority = THREE.MathUtils.lerp(
      this.speechAuthority,
      wantsSpeech ? 1 : 0,
      1 - Math.exp(-8 * delta)
    );

    const visemes: VisemeWeights = this.lipSync.update(
      wantsSpeech ? input.outputAnalyser : null,
      delta,
      wantsSpeech
    );

    // ---- 1. reset ---------------------------------------------------------
    pose.begin();
    morphs.begin();

    // ---- 2-4. pose layers -------------------------------------------------
    // A selected emotion is a deliberate performance. Random idle behaviours
    // fade away so a cheerful overlay cannot turn embarrassed or sad into a
    // generic smile.
    const explicitEmotion = input.emotion !== 'idle';
    behaviours.setEnabled(!explicitEmotion);

    idle.setIntensity(behaviours.idleIntensity);
    idle.update(delta, pose);

    performance.update({
      delta,
      activity: this.currentActivity,
      emotion: input.emotion,
      pose,
      bones: this.config.bones,
    });

    behaviours.update({
      delta,
      activity: this.currentActivity,
      pose,
      bones: this.config.bones,
    });

    gaze.setEmotion(input.emotion);

    if (this.eyeTracking) {
      // Project the pointer into the world at roughly the character's depth,
      // so her eyes converge on where the cursor actually appears on screen.
      this.gazePoint
        .set(this.pointerNdc.x, this.pointerNdc.y, 0.5)
        .unproject(this.stage.camera);
      gaze.lookAt(this.gazePoint);
    } else {
      // Explicit emotions own gaze direction. Shy and sad performances look
      // away, curious/confused eyes explore, and confident emotions reconnect
      // with the viewer. Each mode still contains changing fixation points.
      const emotionalGaze: GazeMode | undefined =
        input.emotion === 'embarrassed' ||
        input.emotion === 'sad' ||
        input.emotion === 'thinking'
          ? 'away'
          : input.emotion === 'curious' || input.emotion === 'confused'
            ? 'wander'
            : input.emotion === 'idle'
              ? undefined
              : 'user';
      const behaviourGaze = explicitEmotion ? undefined : behaviours.gazeOverride;
      const gazeMode: GazeMode =
        behaviourGaze ??
        emotionalGaze ??
        (this.currentActivity === 'thinking'
          ? 'away'
          : this.currentActivity === 'idle'
            ? 'wander'
            : 'user');
      gaze.setMode(gazeMode);
    }
    gaze.update(delta, pose, this.stage.camera.position);

    // ---- 5. commit the pose ----------------------------------------------
    pose.apply();

    // ---- 6. face ----------------------------------------------------------
    const targetExpression =
      input.emotion === 'idle' && this.currentActivity === 'listening'
        ? 'listening'
        : input.emotion === 'idle' && this.currentActivity === 'thinking'
          ? 'thinking'
          : input.emotion;
    const expressionBlend =
      targetExpression === 'surprised' || targetExpression === 'excited'
        ? 0.24
        : targetExpression === 'embarrassed' || targetExpression === 'sad'
          ? 0.38
          : 0.32;
    face.setExpression(targetExpression, expressionBlend);
    if (gaze.consumeBlinkRequest() || behaviours.consumeBlinkRequest()) face.triggerBlink();

    face.update({
      delta,
      visemes,
      speechAuthority: this.speechAuthority,
      overlay: explicitEmotion ? undefined : behaviours.overlay,
      overlayWeight: explicitEmotion ? 0 : behaviours.overlayWeight,
    });

    // ---- 7. morphs --------------------------------------------------------
    morphs.commitVertexMorphs();
    // Bone morphs stack on top of the pose that was just applied.
    morphs.commitBoneMorphs();

    // ---- 8. grants --------------------------------------------------------
    grants.solve();

    // ---- 9. world matrices ------------------------------------------------
    model.mesh.updateMatrixWorld(true);

    // ---- 10. physics ------------------------------------------------------
    physics.update(delta);

    // ---- 11. camera, lighting, render -------------------------------------
    this.updateFocus();
    this.stage.update(delta);
    lighting.update(this.stage.camera);
    this.stage.render();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();

    this.physics?.dispose();
    this.lighting?.dispose();

    if (this.model) {
      this.model.mesh.geometry.dispose();
      const materials = this.model.mesh.material;
      for (const material of Array.isArray(materials) ? materials : [materials]) {
        const m = material as THREE.Material & {
          map?: THREE.Texture | null;
          gradientMap?: THREE.Texture | null;
        };
        m.map?.dispose();
        m.gradientMap?.dispose();
        m.dispose();
      }
      this.stage.scene.clear();
      this.model = null;
    }

    this.stage.dispose();
  }
}
