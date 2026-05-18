import * as THREE from 'three';
import { PrisonMapDetailed as PrisonMap } from './PrisonMapDetailed';
import { FirstPersonController } from './FirstPersonController';
import { Hands } from './Hands';
import { Combat, CombatState } from './Combat';
import { TeamSystem, Team, PlayerInfo } from './TeamSystem';
import { RoundSystem, RoundState } from './RoundSystem';
import { DoorSystem, Door } from './DoorSystem';
import { soundSystem } from './SoundSystem';

export interface DoorInteractionState {
  canInteract: boolean;
  door: Door | null;
  isGuard: boolean;
}

export class Game {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private prisonMap: PrisonMap;
  private controller: FirstPersonController;
  private hands: Hands;
  private combat: Combat;
  private doorSystem: DoorSystem;
  public teamSystem: TeamSystem;
  public roundSystem: RoundSystem;

  private isRunning = false;
  private prevTime = 0;
  
  private currentTeam: Team = 'none';
  private spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 1.7, 5);

  private onStatsUpdate?: (fps: number, pos: THREE.Vector3) => void;
  private onCombatUpdate?: (state: CombatState) => void;
  private onRoundUpdate?: (state: RoundState) => void;
  private onDoorInteraction?: (state: DoorInteractionState) => void;
  
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;
  
  // Шаги
  private footstepTimer = 0;
  private readonly FOOTSTEP_INTERVAL = 0.4; // секунды между шагами

  constructor(container: HTMLElement) {
    // Создаём сцену
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 20, 80);

    // Рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Камера
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Контроллер
    this.controller = new FirstPersonController(camera);

    // Карта
    this.prisonMap = new PrisonMap();
    this.scene.add(this.prisonMap.group);
    this.controller.setColliders(this.prisonMap.colliders);

    // Система дверей
    this.doorSystem = new DoorSystem(this.scene);
    
    // Создаём двери для всех камер
    for (const doorPos of this.prisonMap.cellDoorPositions) {
      this.doorSystem.createCellDoor(doorPos.cellIndex, doorPos.position);
    }

    // Руки
    this.hands = new Hands();
    camera.add(this.hands.group);
    this.scene.add(camera);

    // Урон от падения и приземление
    this.controller.onFallDamage = (damage) => {
      this.combat.takeDamage(damage);
    };
    this.controller.onLand = () => {
      soundSystem.playLand();
    };

    // Боевая система
    this.combat = new Combat(camera, this.scene, this.hands);
    this.combat.onStateChange = (state) => {
      if (this.onCombatUpdate) {
        this.onCombatUpdate(state);
      }
    };
    this.combat.onDeath = () => {
      if (this.currentTeam !== 'none') {
        this.roundSystem.playerDied(this.currentTeam);
      }
    };
    this.combat.onCameraRecoil = (amount) => {
      this.controller.addRecoil(amount);
    };

    // Система команд
    this.teamSystem = new TeamSystem();
    this.teamSystem.onTeamSelected = (info: PlayerInfo) => {
      this.onTeamSelected(info);
    };

    // Система раундов
    this.roundSystem = new RoundSystem();
    this.roundSystem.onStateChange = (state) => {
      if (this.onRoundUpdate) {
        this.onRoundUpdate(state);
      }
    };
    this.roundSystem.onRespawn = () => {
      this.respawnPlayer();
    };
    this.roundSystem.onRoundStart = () => {
      // Закрываем все двери в начале раунда
      this.doorSystem.closeAllDoors();
      soundSystem.playRoundStart();
    };
    this.roundSystem.onRoundEnd = () => {
      soundSystem.playRoundEnd();
    };

    // Обработка нажатия E для дверей
    document.addEventListener('keydown', this.onKeyDown.bind(this));

    // Обработка изменения размера окна
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.code === 'KeyE' && document.pointerLockElement !== null) {
      this.tryInteractWithDoor();
    }
  }

  private tryInteractWithDoor() {
    // Только охрана может открывать двери
    if (this.currentTeam !== 'guard') return;
    
    const playerPos = this.controller.camera.position;
    const { canInteract, door } = this.doorSystem.canInteract(playerPos);
    
    if (canInteract && door) {
      const willOpen = !door.isOpen;
      this.doorSystem.toggleDoor(door.id);
      soundSystem.playDoor(willOpen);
    }
  }

  private onTeamSelected(info: PlayerInfo) {
    this.currentTeam = info.team;
    this.spawnPoint = info.spawnPoint.clone();
    
    // Пересоздаём боевую систему с правильной командой
    this.combat.dispose();
    const camera = this.controller.camera;
    const team = info.team === 'guard' ? 'guard' as const : 'prisoner' as const;
    this.combat = new Combat(camera, this.scene, this.hands, { team });
    this.combat.onStateChange = (state) => {
      if (this.onCombatUpdate) this.onCombatUpdate(state);
    };
    this.combat.onDeath = () => {
      if (this.currentTeam !== 'none') this.roundSystem.playerDied(this.currentTeam);
    };
    this.combat.onCameraRecoil = (amount) => {
      this.controller.addRecoil(amount);
    };

    // Телепортируем
    camera.position.copy(info.spawnPoint);

    // Если охрана — даём оружие
    if (info.team === 'guard') {
      this.combat.giveWeapon();
    }

    if (this.onCombatUpdate) {
      this.onCombatUpdate(this.combat.getState());
    }
  }

  private respawnPlayer() {
    this.controller.camera.position.copy(this.spawnPoint);
    this.combat.respawn();
    
    if (this.currentTeam === 'guard') {
      this.combat.giveWeapon();
    } else {
      this.combat.removeWeapon();
    }

    if (this.onCombatUpdate) {
      this.onCombatUpdate(this.combat.getState());
    }
  }

  startRounds(guardCount: number, prisonerCount: number) {
    this.roundSystem.setPlayerCounts(guardCount, prisonerCount);
    this.roundSystem.startGame();
  }

  openAllDoors() {
    this.doorSystem.openAllDoors();
  }

  closeAllDoors() {
    this.doorSystem.closeAllDoors();
  }

  setPointerLockEnabled(enabled: boolean) {
    this.controller.setPointerLockEnabled(enabled);
  }

  private onWindowResize() {
    const camera = this.controller.camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setOnStatsUpdate(callback: (fps: number, pos: THREE.Vector3) => void) {
    this.onStatsUpdate = callback;
  }

  setOnCombatUpdate(callback: (state: CombatState) => void) {
    this.onCombatUpdate = callback;
    callback(this.combat.getState());
  }

  setOnRoundUpdate(callback: (state: RoundState) => void) {
    this.onRoundUpdate = callback;
    callback(this.roundSystem.getState());
  }

  setOnDoorInteraction(callback: (state: DoorInteractionState) => void) {
    this.onDoorInteraction = callback;
  }

  getTeam(): Team {
    return this.teamSystem.getTeam();
  }

  getTeamName(): string {
    return this.teamSystem.getTeamName();
  }

  start() {
    this.isRunning = true;
    this.prevTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  private animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(this.animate.bind(this));

    const time = performance.now();
    const delta = Math.min((time - this.prevTime) / 1000, 0.1);
    this.prevTime = time;

    // FPS счётчик
    this.frameCount++;
    this.fpsTime += delta;
    if (this.fpsTime >= 1) {
      this.currentFps = Math.round(this.frameCount / this.fpsTime);
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    // Обновляем контроллер
    this.controller.update(delta);

    // Проверяем движение для анимации рук
    const isMoving = this.controller.isMoving();
    this.hands.setWalking(isMoving);
    this.hands.update(delta);
    
    // Звуки шагов
    if (isMoving && document.pointerLockElement !== null) {
      this.footstepTimer += delta;
      if (this.footstepTimer >= this.FOOTSTEP_INTERVAL) {
        soundSystem.playFootstep();
        this.footstepTimer = 0;
      }
    } else {
      this.footstepTimer = 0;
    }

    // Обновляем боевую систему
    this.combat.update(delta);

    // Обновляем систему раундов
    this.roundSystem.update(delta);

    // Обновляем двери
    this.doorSystem.update(delta);

    // Проверяем возможность взаимодействия с дверью
    if (this.onDoorInteraction) {
      const playerPos = this.controller.camera.position;
      const { canInteract, door } = this.doorSystem.canInteract(playerPos);
      this.onDoorInteraction({
        canInteract,
        door,
        isGuard: this.currentTeam === 'guard'
      });
    }

    // Отправляем статистику
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.currentFps, this.controller.camera.position);
    }

    // Рендерим
    this.renderer.render(this.scene, this.controller.camera);
  }

  dispose() {
    this.stop();
    this.renderer.dispose();
    this.controller.dispose();
    this.combat.dispose();
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
