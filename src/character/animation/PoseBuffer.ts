/**
 * Additive pose accumulator.
 *
 * Every animation source (breathing, sway, gaze, behaviours) writes *offsets*
 * from the rest pose into this buffer rather than setting bone transforms
 * directly. At the end of the frame the buffer composes all contributions and
 * applies them once.
 *
 * That is what makes blending seamless: two layers touching the same bone
 * simply sum, so a nod during a weight shift produces both, and a behaviour
 * fading out never snaps because its contribution scales continuously to zero.
 *
 * Bones are reset to their captured rest transform each frame, so nothing
 * drifts over time no matter how long the app runs.
 */
import * as THREE from 'three';
import type { PmxModel } from '../loaders/pmxTypes';

interface RestTransform {
  bone: THREE.Bone;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

export class PoseBuffer {
  /** Rest transforms for every bone this buffer is allowed to touch. */
  private readonly rest = new Map<string, RestTransform>();
  /** Accumulated rotation per bone for the current frame. */
  private readonly rotations = new Map<string, THREE.Quaternion>();
  /** Accumulated translation per bone for the current frame. */
  private readonly translations = new Map<string, THREE.Vector3>();

  private readonly _quat = new THREE.Quaternion();
  private readonly _euler = new THREE.Euler();
  private readonly _identity = new THREE.Quaternion();

  constructor(private readonly model: PmxModel) {}

  /**
   * Register a bone as driveable and capture its rest transform.
   * Safe to call repeatedly; the first call wins.
   */
  register(boneName: string | undefined): boolean {
    if (!boneName || this.rest.has(boneName)) return !!boneName && this.rest.has(boneName);
    const index = this.model.boneIndexByName.get(boneName);
    if (index === undefined) return false;
    const bone = this.model.bones[index];
    if (!bone) return false;
    this.rest.set(boneName, {
      bone,
      position: bone.position.clone(),
      quaternion: bone.quaternion.clone(),
    });
    return true;
  }

  /** Register many bones at once, ignoring any the model does not have. */
  registerAll(boneNames: (string | undefined)[]): void {
    for (const name of boneNames) this.register(name);
  }

  has(boneName: string | undefined): boolean {
    return !!boneName && this.rest.has(boneName);
  }

  /**
   * Fold a rotation offset into a bone's stored REST transform, so every
   * later layer treats it as the neutral pose rather than an animation on top
   * of one. Used to replace the model's authored A-pose with a natural stance.
   */
  bakeIntoRest(boneName: string | undefined, x = 0, y = 0, z = 0): void {
    if (!boneName) return;
    const rest = this.rest.get(boneName);
    if (!rest) return;
    this._euler.set(x, y, z, 'XYZ');
    this._quat.setFromEuler(this._euler);
    rest.quaternion.multiply(this._quat);
    // Publish immediately so callers can capture derived state from it.
    rest.bone.quaternion.copy(rest.quaternion);
  }

  /** Clear the frame's accumulated offsets. */
  begin(): void {
    this.rotations.clear();
    this.translations.clear();
  }

  /** Add a rotation offset, in radians, about the bone's local axes. */
  addEuler(
    boneName: string | undefined,
    x: number,
    y: number,
    z: number,
    weight = 1
  ): void {
    if (!boneName || weight === 0 || !this.rest.has(boneName)) return;
    if (x === 0 && y === 0 && z === 0) return;
    this._euler.set(x * weight, y * weight, z * weight, 'XYZ');
    this._quat.setFromEuler(this._euler);
    this.addQuaternion(boneName, this._quat);
  }

  /** Add a rotation offset as a quaternion. */
  addQuaternion(boneName: string | undefined, quat: THREE.Quaternion, weight = 1): void {
    if (!boneName || !this.rest.has(boneName)) return;
    let acc = this.rotations.get(boneName);
    if (!acc) {
      acc = new THREE.Quaternion();
      this.rotations.set(boneName, acc);
    }
    if (weight >= 0.999) {
      acc.multiply(quat);
    } else {
      this._quat.copy(this._identity).slerp(quat, weight);
      acc.multiply(this._quat);
    }
  }

  /** Add a translation offset in the bone's local space. */
  addTranslation(
    boneName: string | undefined,
    x: number,
    y: number,
    z: number,
    weight = 1
  ): void {
    if (!boneName || weight === 0 || !this.rest.has(boneName)) return;
    let acc = this.translations.get(boneName);
    if (!acc) {
      acc = new THREE.Vector3();
      this.translations.set(boneName, acc);
    }
    acc.x += x * weight;
    acc.y += y * weight;
    acc.z += z * weight;
  }

  /**
   * Write rest pose + accumulated offsets onto the skeleton.
   * Call once per frame, after all layers have contributed.
   */
  apply(): void {
    for (const [name, rest] of this.rest) {
      const rotation = this.rotations.get(name);
      const translation = this.translations.get(name);

      rest.bone.quaternion.copy(rest.quaternion);
      if (rotation) rest.bone.quaternion.multiply(rotation);

      rest.bone.position.copy(rest.position);
      if (translation) rest.bone.position.add(translation);
    }
  }

  /** Bone names this buffer drives, for diagnostics. */
  get drivenBones(): string[] {
    return [...this.rest.keys()];
  }
}
