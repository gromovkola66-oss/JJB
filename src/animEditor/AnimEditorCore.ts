import * as THREE from 'three';
import { ModelData } from '../modelEditor/ModelEditorCore';

// === ТИПЫ ===

export interface Bone {
  id: string;
  name: string;
  parentId: string | null;
  position: { x: number; y: number; z: number }; // relative to parent
  voxelKeys: string[]; // which voxels this bone controls
  color: number; // visual color for bone
}

export interface BoneTransform {
  boneId: string;
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
}

export interface Keyframe {
  time: number; // 0-1 normalized
  transforms: BoneTransform[];
}

export interface AnimationClip {
  name: string;
  duration: number; // seconds
  keyframes: Keyframe[];
  loop: boolean;
}

export interface AnimationData {
  bones: Bone[];
  clips: AnimationClip[];
  modelData: ModelData;
}

// === ШАБЛОНЫ СКЕЛЕТОВ ===

export function createHumanoidSkeleton(): Bone[] {
  return [
    { id: 'root', name: 'Корпус', parentId: null, position: { x: 0, y: 10, z: 0 }, voxelKeys: [], color: 0xffff00 },
    { id: 'head', name: 'Голова', parentId: 'root', position: { x: 0, y: 5, z: 0 }, voxelKeys: [], color: 0xff0000 },
    { id: 'arm_l', name: 'Левая рука', parentId: 'root', position: { x: -3, y: 3, z: 0 }, voxelKeys: [], color: 0x00ff00 },
    { id: 'arm_r', name: 'Правая рука', parentId: 'root', position: { x: 3, y: 3, z: 0 }, voxelKeys: [], color: 0x0000ff },
    { id: 'hand_l', name: 'Левая кисть', parentId: 'arm_l', position: { x: 0, y: -3, z: 0 }, voxelKeys: [], color: 0x00aa00 },
    { id: 'hand_r', name: 'Правая кисть', parentId: 'arm_r', position: { x: 0, y: -3, z: 0 }, voxelKeys: [], color: 0x0000aa },
    { id: 'leg_l', name: 'Левая нога', parentId: 'root', position: { x: -1, y: -5, z: 0 }, voxelKeys: [], color: 0xff00ff },
    { id: 'leg_r', name: 'Правая нога', parentId: 'root', position: { x: 1, y: -5, z: 0 }, voxelKeys: [], color: 0x00ffff },
    { id: 'foot_l', name: 'Левая стопа', parentId: 'leg_l', position: { x: 0, y: -4, z: 1 }, voxelKeys: [], color: 0xaa00aa },
    { id: 'foot_r', name: 'Правая стопа', parentId: 'leg_r', position: { x: 0, y: -4, z: 1 }, voxelKeys: [], color: 0x00aaaa },
  ];
}

// === ШАБЛОНЫ АНИМАЦИЙ ===

export function createIdleClip(): AnimationClip {
  return {
    name: 'Idle', duration: 2, loop: true,
    keyframes: [
      { time: 0, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 0.5, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0.3, z: 0 } },
        { boneId: 'arm_l', rotation: { x: 0, y: 0, z: 0.05 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_r', rotation: { x: 0, y: 0, z: -0.05 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 1, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
    ]
  };
}

export function createWalkClip(): AnimationClip {
  return {
    name: 'Ходьба', duration: 0.8, loop: true,
    keyframes: [
      { time: 0, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_l', rotation: { x: 0.5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_r', rotation: { x: -0.5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_l', rotation: { x: -0.4, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_r', rotation: { x: 0.4, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 0.25, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0.4, z: 0 } },
        { boneId: 'leg_l', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_r', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 0.5, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_l', rotation: { x: -0.5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_r', rotation: { x: 0.5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_l', rotation: { x: 0.4, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_r', rotation: { x: -0.4, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 0.75, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0.4, z: 0 } },
      ]},
      { time: 1, transforms: [
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_l', rotation: { x: 0.5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'leg_r', rotation: { x: -0.5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_l', rotation: { x: -0.4, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'arm_r', rotation: { x: 0.4, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
    ]
  };
}

export function createRunClip(): AnimationClip {
  const walk = createWalkClip();
  return { ...walk, name: 'Бег', duration: 0.4, keyframes: walk.keyframes.map(kf => ({
    ...kf, transforms: kf.transforms.map(t => ({
      ...t, rotation: { x: t.rotation.x * 1.5, y: t.rotation.y, z: t.rotation.z },
      position: { x: t.position.x, y: t.position.y * 1.5, z: t.position.z }
    }))
  }))};
}

export function createPunchClip(): AnimationClip {
  return {
    name: 'Удар', duration: 0.4, loop: false,
    keyframes: [
      { time: 0, transforms: [
        { boneId: 'arm_r', rotation: { x: -0.3, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 0.3, transforms: [
        { boneId: 'arm_r', rotation: { x: 1.2, y: 0, z: 0 }, position: { x: 0, y: 0, z: -1 } },
        { boneId: 'root', rotation: { x: 0, y: 0.2, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
      { time: 0.7, transforms: [
        { boneId: 'arm_r', rotation: { x: 0.8, y: 0, z: 0 }, position: { x: 0, y: 0, z: -0.5 } },
      ]},
      { time: 1, transforms: [
        { boneId: 'arm_r', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
    ]
  };
}

export function createShootClip(): AnimationClip {
  return {
    name: 'Стрельба', duration: 0.3, loop: false,
    keyframes: [
      { time: 0, transforms: [
        { boneId: 'arm_r', rotation: { x: 1.0, y: 0, z: 0 }, position: { x: 0, y: 0, z: -1 } },
        { boneId: 'arm_l', rotation: { x: 0.8, y: 0, z: 0 }, position: { x: 0, y: 0, z: -0.5 } },
      ]},
      { time: 0.2, transforms: [
        { boneId: 'arm_r', rotation: { x: 1.0, y: 0, z: -0.1 }, position: { x: 0, y: 0.2, z: -0.7 } },
        { boneId: 'root', rotation: { x: -0.05, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0.1 } },
      ]},
      { time: 1, transforms: [
        { boneId: 'arm_r', rotation: { x: 1.0, y: 0, z: 0 }, position: { x: 0, y: 0, z: -1 } },
        { boneId: 'arm_l', rotation: { x: 0.8, y: 0, z: 0 }, position: { x: 0, y: 0, z: -0.5 } },
        { boneId: 'root', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      ]},
    ]
  };
}

export function getTemplateClips(): AnimationClip[] {
  return [createIdleClip(), createWalkClip(), createRunClip(), createPunchClip(), createShootClip()];
}

// === ИНТЕРПОЛЯЦИЯ ===

function lerpNum(a: number, b: number, t: number): number { return a + (b - a) * t; }
function easeInOut(t: number): number { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function lerpTransform(a: BoneTransform, b: BoneTransform, t: number): BoneTransform {
  const e = easeInOut(t);
  return {
    boneId: a.boneId,
    rotation: { x: lerpNum(a.rotation.x, b.rotation.x, e), y: lerpNum(a.rotation.y, b.rotation.y, e), z: lerpNum(a.rotation.z, b.rotation.z, e) },
    position: { x: lerpNum(a.position.x, b.position.x, e), y: lerpNum(a.position.y, b.position.y, e), z: lerpNum(a.position.z, b.position.z, e) },
  };
}

export function sampleAnimation(clip: AnimationClip, normalizedTime: number): BoneTransform[] {
  if (clip.keyframes.length === 0) return [];
  const t = clip.loop ? normalizedTime % 1 : Math.min(normalizedTime, 1);

  // Find surrounding keyframes
  let prevKf = clip.keyframes[0];
  let nextKf = clip.keyframes[clip.keyframes.length - 1];
  for (let i = 0; i < clip.keyframes.length - 1; i++) {
    if (t >= clip.keyframes[i].time && t <= clip.keyframes[i + 1].time) {
      prevKf = clip.keyframes[i];
      nextKf = clip.keyframes[i + 1];
      break;
    }
  }

  const segLen = nextKf.time - prevKf.time;
  const localT = segLen > 0 ? (t - prevKf.time) / segLen : 0;

  // Gather all bone IDs
  const boneIds = new Set<string>();
  prevKf.transforms.forEach(t => boneIds.add(t.boneId));
  nextKf.transforms.forEach(t => boneIds.add(t.boneId));

  const identity: BoneTransform = { boneId: '', rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } };

  const result: BoneTransform[] = [];
  for (const id of boneIds) {
    const a = prevKf.transforms.find(t => t.boneId === id) || { ...identity, boneId: id };
    const b = nextKf.transforms.find(t => t.boneId === id) || { ...identity, boneId: id };
    result.push(lerpTransform(a, b, localT));
  }

  return result;
}

// === 3D ПРЕВЬЮ ===

export class AnimPreview {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private boneGroups: Map<string, THREE.Group> = new Map();
  private bones: Bone[] = [];
  private modelGroup: THREE.Group | null = null;
  private isRunning = false;
  private lastTime = 0;

  // Playback
  private currentClip: AnimationClip | null = null;
  private playTime = 0;
  private playing = false;

  // Camera orbit
  private camAngle = 0.5;
  private camPitch = 0.3;
  private camDist = 20;
  private isRightDown = false;
  private lastMouse = { x: 0, y: 0 };

  public onTimeUpdate?: (t: number) => void;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200);
    this.updateCamera();

    this.scene.add(new THREE.AmbientLight(0x606878, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 0.7);
    sun.position.set(15, 25, 15);
    this.scene.add(sun);

    // Floor grid
    this.scene.add(new THREE.GridHelper(30, 30, 0x333344, 0x222233));

    const el = this.renderer.domElement;
    el.addEventListener('mousedown', (e) => { if (e.button === 2) { this.isRightDown = true; this.lastMouse = { x: e.clientX, y: e.clientY }; } });
    el.addEventListener('mouseup', (e) => { if (e.button === 2) this.isRightDown = false; });
    el.addEventListener('mousemove', (e) => {
      if (!this.isRightDown) return;
      this.camAngle -= (e.clientX - this.lastMouse.x) * 0.008;
      this.camPitch = Math.max(-1, Math.min(1.4, this.camPitch + (e.clientY - this.lastMouse.y) * 0.008));
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.updateCamera();
    });
    el.addEventListener('wheel', (e) => { this.camDist = Math.max(5, Math.min(50, this.camDist + e.deltaY * 0.03)); this.updateCamera(); });
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private updateCamera() {
    const x = Math.sin(this.camAngle) * Math.cos(this.camPitch) * this.camDist;
    const y = Math.sin(this.camPitch) * this.camDist;
    const z = Math.cos(this.camAngle) * Math.cos(this.camPitch) * this.camDist;
    this.camera.position.set(x, y + 8, z);
    this.camera.lookAt(0, 8, 0);
  }

  loadModel(modelData: ModelData, bones: Bone[]) {
    // Clear old
    if (this.modelGroup) this.scene.remove(this.modelGroup);
    this.boneGroups.clear();
    this.bones = bones;

    this.modelGroup = new THREE.Group();

    // Build bone hierarchy as Three.js groups
    const rootBones = bones.filter(b => !b.parentId);
    for (const bone of rootBones) {
      const group = this.buildBoneGroup(bone, bones, modelData);
      this.modelGroup.add(group);
    }

    this.scene.add(this.modelGroup);

    // Draw bone markers
    for (const bone of bones) {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: bone.color, transparent: true, opacity: 0.6 })
      );
      const group = this.boneGroups.get(bone.id);
      if (group) group.add(marker);
    }
  }

  private buildBoneGroup(bone: Bone, allBones: Bone[], modelData: ModelData): THREE.Group {
    const group = new THREE.Group();
    group.position.set(bone.position.x, bone.position.y, bone.position.z);
    this.boneGroups.set(bone.id, group);

    // Add child bones
    const children = allBones.filter(b => b.parentId === bone.id);
    for (const child of children) {
      group.add(this.buildBoneGroup(child, allBones, modelData));
    }

    return group;
  }

  setClip(clip: AnimationClip | null) {
    this.currentClip = clip;
    this.playTime = 0;
  }

  play() { this.playing = true; }
  pause() { this.playing = false; }
  stop() { this.playing = false; this.playTime = 0; }
  setTime(t: number) { this.playTime = t; this.applyFrame(); }

  isPlaying() { return this.playing; }

  private applyFrame() {
    if (!this.currentClip) return;
    const normalizedTime = this.playTime / this.currentClip.duration;
    const transforms = sampleAnimation(this.currentClip, normalizedTime);

    // Reset all bones
    for (const bone of this.bones) {
      const group = this.boneGroups.get(bone.id);
      if (group) {
        group.rotation.set(0, 0, 0);
        group.position.set(bone.position.x, bone.position.y, bone.position.z);
      }
    }

    // Apply transforms
    for (const t of transforms) {
      const group = this.boneGroups.get(t.boneId);
      const bone = this.bones.find(b => b.id === t.boneId);
      if (group && bone) {
        group.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
        group.position.set(
          bone.position.x + t.position.x,
          bone.position.y + t.position.y,
          bone.position.z + t.position.z
        );
      }
    }
  }

  start() { this.isRunning = true; this.lastTime = performance.now(); this.animate(); }
  stopRenderer() { this.isRunning = false; }

  private animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate.bind(this));
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.playing && this.currentClip) {
      this.playTime += dt;
      if (this.currentClip.loop) {
        this.playTime %= this.currentClip.duration;
      } else {
        if (this.playTime >= this.currentClip.duration) { this.playTime = this.currentClip.duration; this.playing = false; }
      }
      this.applyFrame();
      this.onTimeUpdate?.(this.playTime);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() { this.stopRenderer(); this.renderer.dispose(); }
}
