import * as THREE from 'three';

export interface SecurityCamera {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  groupId: number;
  label: string;
}

export interface SecurityTerminal {
  id: string;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  groupId: number;
}

export interface CameraSystemState {
  inTerminalMode: boolean;
  terminalHighlighted: boolean;
  cameras: SecurityCamera[];
  selectedCameraIndex: number | null;
}

export class CameraSystem {
  private terminals: SecurityTerminal[] = [];
  private cameras: SecurityCamera[] = [];
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private _inTerminalMode = false;
  private _terminalHighlighted = false;
  private _selectedCameraIndex: number | null = null;
  private _activeCameras: SecurityCamera[] = [];

  private highlightedMesh: THREE.Mesh | null = null;
  private originalEmissive: THREE.Color | null = null;
  private originalEmissiveIntensity: number = 0;

  private interactionRange = 3;

  private securityCamera: THREE.PerspectiveCamera;

  public onStateChange?: (state: CameraSystemState) => void;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.securityCamera = new THREE.PerspectiveCamera(70, 16 / 9, 0.1, 200);
  }

  registerTerminal(id: string, mesh: THREE.Object3D, position: THREE.Vector3, groupId: number) {
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.isTerminal = true;
        child.userData.terminalId = id;
      }
    });
    this.terminals.push({ id, mesh, position, groupId });
  }

  registerCamera(id: string, position: THREE.Vector3, rotation: THREE.Euler, groupId: number, label: string) {
    this.cameras.push({ id, position, rotation, groupId, label });
  }

  checkRaycast(raycaster: THREE.Raycaster): boolean {
    const terminalMeshes: THREE.Object3D[] = [];
    for (const terminal of this.terminals) {
      terminal.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          terminalMeshes.push(child);
        }
      });
    }

    if (terminalMeshes.length === 0) {
      this.clearHighlight();
      const wasHighlighted = this._terminalHighlighted;
      this._terminalHighlighted = false;
      if (wasHighlighted !== this._terminalHighlighted) {
        this.emitState();
      }
      return false;
    }

    const intersects = raycaster.intersectObjects(terminalMeshes, false);
    const hit = intersects.length > 0 && intersects[0].distance < this.interactionRange;

    const wasHighlighted = this._terminalHighlighted;

    if (hit) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      if (hitMesh !== this.highlightedMesh) {
        this.clearHighlight();
        this.applyHighlight(hitMesh);
      }
      this._terminalHighlighted = true;
    } else {
      this.clearHighlight();
      this._terminalHighlighted = false;
    }

    if (this._terminalHighlighted !== wasHighlighted) {
      this.emitState();
    }

    return hit;
  }

  private applyHighlight(mesh: THREE.Mesh) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (!mat || !mat.emissive) return;
    this.highlightedMesh = mesh;
    this.originalEmissive = mat.emissive.clone();
    this.originalEmissiveIntensity = mat.emissiveIntensity;
    mat.emissive.set(0x00ffaa);
    mat.emissiveIntensity = 0.4;
  }

  private clearHighlight() {
    if (this.highlightedMesh) {
      const mat = this.highlightedMesh.material as THREE.MeshStandardMaterial;
      if (mat && this.originalEmissive) {
        mat.emissive.copy(this.originalEmissive);
        mat.emissiveIntensity = this.originalEmissiveIntensity;
      }
      this.highlightedMesh = null;
      this.originalEmissive = null;
    }
  }

  enterTerminalMode(playerPosition: THREE.Vector3): boolean {
    // Find the nearest terminal within interaction range
    let nearest: SecurityTerminal | null = null;
    let minDist = this.interactionRange;
    for (const terminal of this.terminals) {
      const dist = playerPosition.distanceTo(terminal.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = terminal;
      }
    }

    if (!nearest) return false;

    // Get cameras linked to this terminal via groupId
    this._activeCameras = this.cameras.filter(c => c.groupId === nearest!.groupId);
    if (this._activeCameras.length === 0) {
      // If no cameras match groupId, show all cameras
      this._activeCameras = [...this.cameras];
    }

    this._inTerminalMode = true;
    this._selectedCameraIndex = null;
    this.emitState();
    return true;
  }

  exitTerminalMode() {
    this._inTerminalMode = false;
    this._selectedCameraIndex = null;
    this._activeCameras = [];
    this.emitState();
  }

  selectCamera(index: number | null) {
    if (index !== null && index >= 0 && index < this._activeCameras.length) {
      this._selectedCameraIndex = index;
    } else {
      this._selectedCameraIndex = null;
    }
    this.emitState();
  }

  getSelectedCamera(): SecurityCamera | null {
    if (this._selectedCameraIndex === null) return null;
    return this._activeCameras[this._selectedCameraIndex] ?? null;
  }

  renderFromCamera(mainCamera: THREE.PerspectiveCamera) {
    if (!this._inTerminalMode || this._selectedCameraIndex === null) return;

    const cam = this._activeCameras[this._selectedCameraIndex];
    if (!cam) return;

    // Position the security camera
    this.securityCamera.position.copy(cam.position);
    this.securityCamera.rotation.copy(cam.rotation);
    this.securityCamera.aspect = mainCamera.aspect;
    this.securityCamera.updateProjectionMatrix();

    // Render from security camera perspective
    this.renderer.render(this.scene, this.securityCamera);
  }

  update(_delta: number, mainCamera: THREE.PerspectiveCamera) {
    if (this._inTerminalMode && this._selectedCameraIndex !== null) {
      this.renderFromCamera(mainCamera);
    }
  }

  private emitState() {
    if (this.onStateChange) {
      this.onStateChange({
        inTerminalMode: this._inTerminalMode,
        terminalHighlighted: this._terminalHighlighted,
        cameras: this._activeCameras,
        selectedCameraIndex: this._selectedCameraIndex,
      });
    }
  }

  get inTerminalMode(): boolean {
    return this._inTerminalMode;
  }

  get terminalHighlighted(): boolean {
    return this._terminalHighlighted;
  }

  get selectedCameraIndex(): number | null {
    return this._selectedCameraIndex;
  }

  get activeCameras(): SecurityCamera[] {
    return this._activeCameras;
  }

  getState(): CameraSystemState {
    return {
      inTerminalMode: this._inTerminalMode,
      terminalHighlighted: this._terminalHighlighted,
      cameras: this._activeCameras,
      selectedCameraIndex: this._selectedCameraIndex,
    };
  }
}
