import * as THREE from 'three';

export type VoxelShape = 'box' | 'rounded' | 'sphere' | 'wedge' | 'triangle' | 'cylinder';
export type ToolType = 'place' | 'remove' | 'paint' | 'fill' | 'pipette' | 'line' | 'boxfill' | 'boxselect';

export interface VoxelData { x: number; y: number; z: number; color: number; shape?: VoxelShape; }
export interface ModelData { name: string; gridSize: number; voxels: VoxelData[]; }

interface HistoryEntry { added: VoxelData[]; removed: VoxelData[]; }

export const PALETTE: number[] = [
  0xf5d6b8,0xd4a574,0xc49464,0xa87040,
  0xff0000,0xcc2222,0x8b1a1a,0xff4444,
  0xff6b35,0xe05a2a,0xcc5522,0xff8844,
  0xffff00,0xfbbf24,0xccaa00,0x998800,
  0x00ff00,0x22c55e,0x2d5016,0x4a7a2a,
  0x00ffff,0x4a90d9,0x6080a0,0x87ceeb,
  0x0000ff,0x1e3a6e,0x1e3a5f,0x3b82f6,
  0x8b5cf6,0x7c3aed,0x6d28d9,0x9333ea,
  0xff00ff,0xec4899,0xf472b6,0xbe185d,
  0x8b4513,0x6b4513,0x5c4033,0x4a3528,
  0xffffff,0xdddddd,0xbbbbbb,0x999999,
  0x777777,0x555555,0x333333,0x111111,
  0xcccccc,0xaaaaaa,0x888888,0x666666,
  0x8b6914,0x6b5344,0x8a7050,0x5a3a0a,
  0x000000,0x1a1a1a,0x2a2a2a,0x3a3a3a,
  0xff6b35,0x1e40af,0xef4444,0x22c55e,
];

export class ModelEditorCore {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private voxels: Map<string, THREE.Mesh> = new Map();
  private voxelData: VoxelData[] = [];
  public gridSize = 32;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Camera
  private moveF=false; private moveB=false; private moveL=false; private moveR=false;
  private moveU=false; private moveD=false;
  private isRightDown=false; private isMiddleDown=false;
  private camEuler = new THREE.Euler(0,0,0,'YXZ');
  private camSpeed=12; private shiftHeld=false; private altHeld=false;

  // Tools
  public currentColor=0;
  public tool: ToolType = 'place';
  public mirrorX=false; public mirrorY=false; public mirrorZ=false;
  public voxelShape: VoxelShape = 'box';

  // Drag
  private isLeftDown=false; private lastDrawPos='';
  private dragPlaneY=-1; private dragNormal=new THREE.Vector3(0,1,0);

  // Line tool
  private lineStart: [number,number,number] | null = null;

  // Box select
  private boxStart: [number,number,number] | null = null;
  private boxEnd: [number,number,number] | null = null;
  private boxPreview: THREE.Mesh | null = null;

  // Voxel selection / clipboard
  private selectedVoxelKeys: Set<string> = new Set();
  private selectionOutline: THREE.LineSegments | null = null;
  private clipboard: VoxelData[] = [];

  // Layers
  public currentLayer = 0;
  public isolateLayer = false;

  // Undo/Redo
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private currentBatch: HistoryEntry = { added: [], removed: [] };
  private batching = false;

  // Y-level guide
  private yGuide: THREE.GridHelper | null = null;
  public showYGuide = false;
  private currentYLevel = 0;

  // Geometries
  private geos: Record<VoxelShape, THREE.BufferGeometry>;
  private paletteMats: THREE.MeshStandardMaterial[] = [];
  private gridGroup: THREE.Group;
  private ghostBlock: THREE.Mesh;

  // Callbacks
  public onVoxelCountChanged?: (c: number) => void;
  public onGridSizeChanged?: (s: number) => void;
  public onHistoryChanged?: (canUndo: boolean, canRedo: boolean) => void;
  public onToolChanged?: (t: ToolType) => void;
  public onColorChanged?: (c: number) => void;
  public onYLevelChanged?: (y: number) => void;
  public onLayerChanged?: (layer: number) => void;
  public onLayerIsolationChanged?: (isolated: boolean) => void;
  public onSelectionChanged?: (count: number) => void;

  private isRunning=false; private lastTime=0; private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e1e2e);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 500);
    this.camera.position.set(20,15,20);
    this.camera.lookAt(0,8,0);
    this.camEuler.setFromQuaternion(this.camera.quaternion);

    this.scene.add(new THREE.AmbientLight(0x606878,1.4));
    const sun=new THREE.DirectionalLight(0xffffff,0.7); sun.position.set(25,35,20); this.scene.add(sun);
    this.scene.add(new THREE.DirectionalLight(0x8888ff,0.25).translateX(-15).translateY(8).translateZ(-10));

    // Geometries
    const gBox = new THREE.BoxGeometry(1,1,1);
    const gRound = new THREE.BoxGeometry(0.88,0.88,0.88,2,2,2);
    const rp=gRound.attributes.position;
    for(let i=0;i<rp.count;i++){const v=new THREE.Vector3(rp.getX(i),rp.getY(i),rp.getZ(i));v.normalize().multiplyScalar(0.52);rp.setXYZ(i,v.x,v.y,v.z);}
    rp.needsUpdate=true;gRound.computeVertexNormals();

    // Wedge
    const wV=new Float32Array([-0.5,-0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,0.5,0.5,-0.5,-0.5,-0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,-0.5]);
    const gWedge=new THREE.BufferGeometry();gWedge.setAttribute('position',new THREE.BufferAttribute(wV,3));gWedge.computeVertexNormals();

    // Triangle
    const tV=new Float32Array([-0.5,-0.5,0.5,0.5,-0.5,0.5,0,0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,0,0.5,0.5,-0.5,-0.5,-0.5,0,0.5,0.5,0,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,0,0.5,-0.5,0.5,-0.5,0.5,0,0.5,-0.5,0,0.5,0.5]);
    const gTri=new THREE.BufferGeometry();gTri.setAttribute('position',new THREE.BufferAttribute(tV,3));gTri.computeVertexNormals();

    this.geos = {
      box: gBox, rounded: gRound,
      sphere: new THREE.SphereGeometry(0.48,10,10),
      cylinder: new THREE.CylinderGeometry(0.48,0.48,1,12),
      wedge: gWedge, triangle: gTri,
    };

    for(const c of PALETTE) this.paletteMats.push(new THREE.MeshStandardMaterial({color:c,roughness:0.75}));

    this.gridGroup=new THREE.Group(); this.scene.add(this.gridGroup); this.rebuildGrid();
    this.updateYGuide(this.currentLayer);

    this.ghostBlock=new THREE.Mesh(gBox,new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.3}));
    this.ghostBlock.visible=false; this.scene.add(this.ghostBlock);

    const el=this.renderer.domElement;
    el.addEventListener('mousemove',this.onMM.bind(this));
    el.addEventListener('mousedown',this.onMD.bind(this));
    el.addEventListener('mouseup',this.onMU.bind(this));
    el.addEventListener('wheel',this.onWh.bind(this));
    el.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('keydown',this.onKD.bind(this));
    document.addEventListener('keyup',this.onKU.bind(this));
    window.addEventListener('resize',this.onResize.bind(this));
  }

  // === GRID ===
  setGridSize(s:number){s=Math.max(8,Math.min(128,s));if(s===this.gridSize)return;this.gridSize=s;this.rebuildGrid();this.onGridSizeChanged?.(s);}
  private rebuildGrid(){
    while(this.gridGroup.children.length)this.gridGroup.remove(this.gridGroup.children[0]);
    const h=this.gridSize/2,lm=new THREE.LineBasicMaterial({color:0x2a2a3a}),pts:THREE.Vector3[]=[];
    for(let i=0;i<=this.gridSize;i++){pts.push(new THREE.Vector3(i-h,0,-h),new THREE.Vector3(i-h,0,h));pts.push(new THREE.Vector3(-h,0,i-h),new THREE.Vector3(h,0,i-h));}
    this.gridGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),lm));
    const ax=(a:THREE.Vector3,b:THREE.Vector3,c:number)=>this.gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:c})));
    ax(new THREE.Vector3(-h,0,-h),new THREE.Vector3(-h+4,0,-h),0xff4444);
    ax(new THREE.Vector3(-h,0,-h),new THREE.Vector3(-h,4,-h),0x44ff44);
    ax(new THREE.Vector3(-h,0,-h),new THREE.Vector3(-h,0,-h+4),0x4444ff);
  }

  toggleYGuide(){
    this.showYGuide=!this.showYGuide;
    if(!this.showYGuide&&this.yGuide){this.scene.remove(this.yGuide);this.yGuide=null;}
  }

  setCurrentLayer(layer: number) {
    this.currentLayer = Math.max(0, Math.min(this.gridSize - 1, layer));
    this.onLayerChanged?.(this.currentLayer);
    this.updateLayerVisibility();
    this.updateYGuide(this.currentLayer);
  }

  adjustCurrentLayer(delta: number) {
    this.setCurrentLayer(this.currentLayer + delta);
  }

  toggleLayerIsolation() {
    this.isolateLayer = !this.isolateLayer;
    this.onLayerIsolationChanged?.(this.isolateLayer);
    this.updateLayerVisibility();
  }

  private updateLayerVisibility() {
    if (!this.isolateLayer) {
      this.voxels.forEach(mesh => (mesh.visible = true));
      if (this.selectionOutline) this.selectionOutline.visible = true;
      return;
    }
    for (const v of this.voxelData) {
      const mesh = this.voxels.get(this.key(v.x, v.y, v.z));
      if (mesh) mesh.visible = v.y === this.currentLayer;
    }
    if (this.selectionOutline) {
      this.selectionOutline.visible = false;
    }
  }

  private updateYGuide(y:number){
    if(!this.showYGuide)return;
    if(this.currentYLevel===y&&this.yGuide)return;
    this.currentYLevel=y;
    if(this.yGuide)this.scene.remove(this.yGuide);
    this.yGuide=new THREE.GridHelper(this.gridSize,this.gridSize,0x444400,0x333300);
    this.yGuide.position.y=y+0.5;
    this.scene.add(this.yGuide);
    this.onYLevelChanged?.(y);
  }

  // === CAMERA ===
  private onKD(e:KeyboardEvent){
    switch(e.code){
      case'KeyW':this.moveF=true;break;case'KeyS':this.moveB=true;break;
      case'KeyA':this.moveL=true;break;case'KeyD':this.moveR=true;break;
      case'KeyQ':this.moveD=true;break;case'KeyE':case'Space':this.moveU=true;break;
      case'ShiftLeft':case'ShiftRight':this.shiftHeld=true;break;
      case'AltLeft':case'AltRight':this.altHeld=true;break;
      case'BracketLeft': this.adjustCurrentLayer(-1); break;
      case'BracketRight': this.adjustCurrentLayer(1); break;
      case'KeyL': this.toggleLayerIsolation(); break;
      case'ArrowLeft': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.moveSelection(-1,0,0);} break;
      case'ArrowRight': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.moveSelection(1,0,0);} break;
      case'ArrowUp': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.moveSelection(0,0,-1);} break;
      case'ArrowDown': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.moveSelection(0,0,1);} break;
      case'PageUp': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.moveSelection(0,1,0);} break;
      case'PageDown': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.moveSelection(0,-1,0);} break;
      case'Delete': if(this.selectedVoxelKeys.size>0){e.preventDefault();this.deleteSelection();} break;
    }
    if(e.ctrlKey||e.metaKey){
      if(e.code==='KeyZ'){e.preventDefault();this.undo();}
      if(e.code==='KeyY'){e.preventDefault();this.redo();}
      if(e.code==='KeyC'){e.preventDefault();this.copySelection();}
      if(e.code==='KeyV'){e.preventDefault();this.pasteSelection();}
    }
  }
  private onKU(e:KeyboardEvent){
    switch(e.code){
      case'KeyW':this.moveF=false;break;case'KeyS':this.moveB=false;break;
      case'KeyA':this.moveL=false;break;case'KeyD':this.moveR=false;break;
      case'KeyQ':this.moveD=false;break;case'KeyE':case'Space':this.moveU=false;break;
      case'ShiftLeft':case'ShiftRight':this.shiftHeld=false;break;
      case'AltLeft':case'AltRight':this.altHeld=false;break;
    }
  }
  private updateCam(dt:number){
    const sp=(this.shiftHeld?this.camSpeed*2.5:this.camSpeed)*dt;
    const f=new THREE.Vector3();this.camera.getWorldDirection(f);f.y=0;f.normalize();
    const r=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0));
    if(this.moveF)this.camera.position.addScaledVector(f,sp);
    if(this.moveB)this.camera.position.addScaledVector(f,-sp);
    if(this.moveR)this.camera.position.addScaledVector(r,sp);
    if(this.moveL)this.camera.position.addScaledVector(r,-sp);
    if(this.moveU)this.camera.position.y+=sp;
    if(this.moveD)this.camera.position.y-=sp;
  }

  // === MOUSE ===
  private onMM(e:MouseEvent){
    if(this.isRightDown){
      this.camEuler.y-=e.movementX*0.003;
      this.camEuler.x=Math.max(-1.5,Math.min(1.5,this.camEuler.x-e.movementY*0.003));
      this.camera.quaternion.setFromEuler(this.camEuler);return;
    }
    if(this.isMiddleDown){
      const r=new THREE.Vector3(),d=new THREE.Vector3();this.camera.getWorldDirection(d);
      r.crossVectors(d,new THREE.Vector3(0,1,0)).normalize();
      this.camera.position.addScaledVector(r,-e.movementX*0.02);
      this.camera.position.y+=e.movementY*0.02;return;
    }
    const hit=this.getHit(e);
    if(hit){
      const fp=this.tool==='place'||this.tool==='line'||this.tool==='boxselect'||this.tool==='boxfill';
      const[gx,gy,gz]=this.h2g(hit,fp);
      // Ghost
      if((this.tool==='place'||this.tool==='line'||this.tool==='boxselect'||this.tool==='boxfill')&&this.inB(gx,gy,gz)){
        const h=this.gridSize/2;
        this.ghostBlock.position.set(gx-h+0.5,gy+0.5,gz-h+0.5);
        this.ghostBlock.geometry=this.geos[this.voxelShape];
        this.ghostBlock.visible=true;
        (this.ghostBlock.material as THREE.MeshStandardMaterial).color.set(PALETTE[this.currentColor]);
      } else this.ghostBlock.visible=false;

      this.updateYGuide(gy);

      // Box fill/select preview
      if((this.tool==='boxselect'||this.tool==='boxfill')&&this.boxStart&&this.isLeftDown){
        this.boxEnd=[gx,gy,gz];
        this.updateBoxPreview();
      }

      // Drag
      if(this.isLeftDown&&(this.tool==='place'||this.tool==='remove'||this.tool==='paint')){
        const dp=new THREE.Plane();
        if(Math.abs(this.dragNormal.y)>0.5)dp.set(new THREE.Vector3(0,1,0),-(this.dragPlaneY+(this.tool==='place'?0.5:-0.5)));
        else if(Math.abs(this.dragNormal.x)>0.5)dp.set(new THREE.Vector3(1,0,0),-hit.pos.x);
        else dp.set(new THREE.Vector3(0,0,1),-hit.pos.z);
        const pt=new THREE.Vector3();
        const rc=this.renderer.domElement.getBoundingClientRect();
        this.raycaster.setFromCamera(new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-((e.clientY-rc.top)/rc.height)*2+1),this.camera);
        if(this.raycaster.ray.intersectPlane(dp,pt)){
          const h=this.gridSize/2;
          const dx=Math.floor(pt.x+h),dy=this.tool==='place'?this.dragPlaneY:Math.floor(pt.y),dz=Math.floor(pt.z+h);
          const pk=this.key(dx,dy,dz);
          if(pk!==this.lastDrawPos&&this.inB(dx,dy,dz)){this.lastDrawPos=pk;this.doAction(dx,dy,dz);}
        }
      }
    } else this.ghostBlock.visible=false;
  }

  private onMD(e:MouseEvent){
    if(e.button===2){this.isRightDown=true;return;}
    if(e.button===1){this.isMiddleDown=true;return;}
    if(e.button!==0)return;
    const hit=this.getHit(e);if(!hit)return;

    // Pipette (Alt+click or pipette tool)
    if(this.altHeld||this.tool==='pipette'){
      const[gx,gy,gz]=this.h2g(hit,false);
      const k=this.key(gx,gy,gz);
      if(this.voxels.has(k)){
        const d=this.voxelData.find(v=>v.x===gx&&v.y===gy&&v.z===gz);
        if(d){
          this.currentColor=d.color;
          if(d.shape)this.voxelShape=d.shape;
          this.onColorChanged?.(d.color);
          this.onToolChanged?.(this.tool==='pipette'?'place':this.tool);
          if(this.tool==='pipette')this.tool='place';
        }
      }
      return;
    }

    // Fill
    if(this.tool==='fill'){
      const[gx,gy,gz]=this.h2g(hit,false);
      this.floodFill(gx,gy,gz,this.currentColor);return;
    }

    // Line tool
    if(this.tool==='line'){
      const fp=true;
      const[gx,gy,gz]=this.h2g(hit,fp);
      if(!this.lineStart){this.lineStart=[gx,gy,gz];return;}
      this.drawLine(this.lineStart,[ gx,gy,gz]);
      this.lineStart=null;return;
    }

    // Box fill (заливка области) or Box select (выделение)
    if(this.tool==='boxfill'||this.tool==='boxselect'){
      const[gx,gy,gz]=this.h2g(hit,true);
      this.boxStart=[gx,gy,gz];
      this.boxEnd=[gx,gy,gz];
      this.isLeftDown=true;
      this.updateBoxPreview();
      return;
    }

    // Normal tools
    this.isLeftDown=true;this.lastDrawPos='';
    const fp=this.tool==='place';
    const[gx,gy,gz]=this.h2g(hit,fp);
    this.dragPlaneY=gy;this.dragNormal.copy(hit.normal);
    this.lastDrawPos=this.key(gx,gy,gz);
    this.startBatch();this.doAction(gx,gy,gz);
  }

  private onMU(e:MouseEvent){
    if(e.button===2)this.isRightDown=false;
    if(e.button===1)this.isMiddleDown=false;
    if(e.button===0){
      this.isLeftDown=false;
      this.lastDrawPos='';
      this.endBatch();
      if(this.boxEnd&&(this.tool==='boxselect'||this.tool==='boxfill')){
        if(this.tool==='boxfill') this.fillBoxArea();
        else this.selectBoxArea();
        this.boxStart=null; this.boxEnd=null;
        if(this.boxPreview){this.scene.remove(this.boxPreview);this.boxPreview=null;}
      }
    }
  }

  private onWh(e:WheelEvent){
    const d=new THREE.Vector3();this.camera.getWorldDirection(d);
    this.camera.position.addScaledVector(d,e.deltaY>0?-1.5:1.5);
  }

  // === RAYCAST ===
  private getHit(e:MouseEvent):{pos:THREE.Vector3;normal:THREE.Vector3}|null{
    const r=this.renderer.domElement.getBoundingClientRect();
    this.mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    this.raycaster.setFromCamera(this.mouse,this.camera);
    const ms=Array.from(this.voxels.values());
    const hs=this.raycaster.intersectObjects(ms);
    if(hs.length>0)return{pos:hs[0].point,normal:hs[0].face!.normal.clone()};
    const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),pt=new THREE.Vector3();
    if(this.raycaster.ray.intersectPlane(pl,pt))return{pos:pt,normal:new THREE.Vector3(0,1,0)};
    return null;
  }
  private h2g(hit:{pos:THREE.Vector3;normal:THREE.Vector3},fp:boolean):[number,number,number]{
    const h=this.gridSize/2,o=fp?0.01:-0.01;
    return[Math.floor(hit.pos.x+hit.normal.x*o+h),Math.floor(hit.pos.y+hit.normal.y*o),Math.floor(hit.pos.z+hit.normal.z*o+h)];
  }
  private inB(x:number,y:number,z:number){return x>=0&&x<this.gridSize&&y>=0&&y<this.gridSize&&z>=0&&z<this.gridSize;}
  private key(x:number,y:number,z:number){return`${x},${y},${z}`;}

  // === SELECTION ===
  clearSelection() {
    this.selectedVoxelKeys.clear();
    this.updateSelectionOutline();
    this.onSelectionChanged?.(0);
  }

  private selectBoxArea() {
    if (!this.boxStart || !this.boxEnd) return;
    this.selectedVoxelKeys.clear();
    const [x1,y1,z1] = this.boxStart;
    const [x2,y2,z2] = this.boxEnd;
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);

    for (const v of this.voxelData) {
      if (v.x >= minX && v.x <= maxX && v.y >= minY && v.y <= maxY && v.z >= minZ && v.z <= maxZ) {
        this.selectedVoxelKeys.add(this.key(v.x, v.y, v.z));
      }
    }

    this.updateSelectionOutline();
    this.onSelectionChanged?.(this.selectedVoxelKeys.size);
  }

  private updateSelectionOutline() {
    if (this.selectionOutline) {
      this.scene.remove(this.selectionOutline);
      this.selectionOutline = null;
    }
    if (this.selectedVoxelKeys.size === 0) return;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const k of this.selectedVoxelKeys) {
      const [x, y, z] = k.split(',').map(Number);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }

    const sizeX = maxX - minX + 1;
    const sizeY = maxY - minY + 1;
    const sizeZ = maxZ - minZ + 1;
    const half = this.gridSize / 2;

    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(sizeX + 0.04, sizeY + 0.04, sizeZ + 0.04));
    const mat = new THREE.LineBasicMaterial({ color: 0x00ffff });
    this.selectionOutline = new THREE.LineSegments(geo, mat);
    this.selectionOutline.position.set(
      minX - half + sizeX / 2,
      minY + sizeY / 2,
      minZ - half + sizeZ / 2
    );
    this.scene.add(this.selectionOutline);
    if (this.isolateLayer) this.selectionOutline.visible = false;
  }

  copySelection() {
    if (this.selectedVoxelKeys.size === 0) return;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    const selected: VoxelData[] = [];
    for (const k of this.selectedVoxelKeys) {
      const [x, y, z] = k.split(',').map(Number);
      const v = this.voxelData.find(v => v.x === x && v.y === y && v.z === z);
      if (!v) continue;
      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      selected.push({ ...v });
    }
    this.clipboard = selected.map(v => ({ ...v, x: v.x - minX, y: v.y - minY, z: v.z - minZ }));
  }

  pasteSelection(offsetX = 1, offsetY = 0, offsetZ = 1) {
    if (this.clipboard.length === 0) return;

    let baseX = Math.floor(this.gridSize / 2) + offsetX;
    let baseY = this.currentLayer + offsetY;
    let baseZ = Math.floor(this.gridSize / 2) + offsetZ;

    if (this.selectedVoxelKeys.size > 0) {
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      for (const k of this.selectedVoxelKeys) {
        const [x, y, z] = k.split(',').map(Number);
        minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      }
      baseX = minX + offsetX;
      baseY = minY + offsetY;
      baseZ = minZ + offsetZ;
    }

    this.startBatch();
    this.selectedVoxelKeys.clear();

    for (const v of this.clipboard) {
      const x = baseX + v.x;
      const y = baseY + v.y + offsetY;
      const z = baseZ + v.z;
      if (!this.inB(x, y, z)) continue;
      const prevShape = this.voxelShape;
      this.voxelShape = v.shape || 'box';
      this.placeVoxel(x, y, z, v.color);
      this.voxelShape = prevShape;
      this.selectedVoxelKeys.add(this.key(x, y, z));
    }

    this.endBatch();
    this.updateSelectionOutline();
    this.onSelectionChanged?.(this.selectedVoxelKeys.size);
  }

  moveSelection(dx: number, dy: number, dz: number) {
    if (this.selectedVoxelKeys.size === 0) return;

    const selected: VoxelData[] = [];
    for (const k of this.selectedVoxelKeys) {
      const [x, y, z] = k.split(',').map(Number);
      const v = this.voxelData.find(v => v.x === x && v.y === y && v.z === z);
      if (v) selected.push({ ...v });
    }
    if (selected.length === 0) return;

    // collision / bounds check
    const selectedSet = new Set(this.selectedVoxelKeys);
    for (const v of selected) {
      const nx = v.x + dx, ny = v.y + dy, nz = v.z + dz;
      if (!this.inB(nx, ny, nz)) return;
      const nk = this.key(nx, ny, nz);
      if (this.voxels.has(nk) && !selectedSet.has(nk)) return;
    }

    this.startBatch();
    for (const v of selected) this.removeVoxel(v.x, v.y, v.z);
    this.selectedVoxelKeys.clear();
    for (const v of selected) {
      const prevShape = this.voxelShape;
      this.voxelShape = v.shape || 'box';
      this.placeVoxel(v.x + dx, v.y + dy, v.z + dz, v.color);
      this.voxelShape = prevShape;
      this.selectedVoxelKeys.add(this.key(v.x + dx, v.y + dy, v.z + dz));
    }
    this.endBatch();
    this.updateSelectionOutline();
    this.onSelectionChanged?.(this.selectedVoxelKeys.size);
  }

  deleteSelection() {
    if (this.selectedVoxelKeys.size === 0) return;
    this.startBatch();
    for (const k of Array.from(this.selectedVoxelKeys)) {
      const [x, y, z] = k.split(',').map(Number);
      this.removeVoxel(x, y, z);
    }
    this.selectedVoxelKeys.clear();
    this.endBatch();
    this.updateSelectionOutline();
    this.onSelectionChanged?.(0);
  }

  // === VOXEL OPS ===
  placeVoxel(x:number,y:number,z:number,ci:number,track=true){
    const k=this.key(x,y,z);
    if(this.voxels.has(k)){
      const old=this.voxelData.find(v=>v.x===x&&v.y===y&&v.z===z);
      if(old&&track&&this.batching){this.currentBatch.removed.push({...old});}
      this.voxels.get(k)!.material=this.paletteMats[ci];
      this.voxels.get(k)!.geometry=this.geos[this.voxelShape];
      if(old){old.color=ci;old.shape=this.voxelShape;}
      if(track&&this.batching)this.currentBatch.added.push({x,y,z,color:ci,shape:this.voxelShape});
      return;
    }
    const h=this.gridSize/2;
    const m=new THREE.Mesh(this.geos[this.voxelShape],this.paletteMats[ci]);
    m.position.set(x-h+0.5,y+0.5,z-h+0.5);
    this.scene.add(m);this.voxels.set(k,m);
    const vd:VoxelData={x,y,z,color:ci,shape:this.voxelShape};
    this.voxelData.push(vd);
    if(track&&this.batching)this.currentBatch.added.push({...vd});
    this.onVoxelCountChanged?.(this.voxelData.length);
    this.updateLayerVisibility();
  }
  removeVoxel(x:number,y:number,z:number,track=true){
    const k=this.key(x,y,z),m=this.voxels.get(k);if(!m)return;
    const old=this.voxelData.find(v=>v.x===x&&v.y===y&&v.z===z);
    if(old&&track&&this.batching)this.currentBatch.removed.push({...old});
    this.scene.remove(m);this.voxels.delete(k);
    this.voxelData=this.voxelData.filter(v=>!(v.x===x&&v.y===y&&v.z===z));
    this.onVoxelCountChanged?.(this.voxelData.length);
    this.updateLayerVisibility();
  }
  private doAction(x:number,y:number,z:number){
    if(!this.inB(x,y,z))return;
    const act=(ax:number,ay:number,az:number)=>{
      if(this.tool==='place')this.placeVoxel(ax,ay,az,this.currentColor);
      else if(this.tool==='remove')this.removeVoxel(ax,ay,az);
      else if(this.tool==='paint'){
        const k=this.key(ax,ay,az);
        if(this.voxels.has(k)){
          const old=this.voxelData.find(v=>v.x===ax&&v.y===ay&&v.z===az);
          if(old&&this.batching)this.currentBatch.removed.push({...old});
          this.voxels.get(k)!.material=this.paletteMats[this.currentColor];
          if(old){old.color=this.currentColor;}
          if(old&&this.batching)this.currentBatch.added.push({...old,color:this.currentColor});
        }
      }
    };
    act(x,y,z);
    if(this.mirrorX&&this.inB(this.gridSize-1-x,y,z))act(this.gridSize-1-x,y,z);
    if(this.mirrorY&&this.inB(x,this.gridSize-1-y,z))act(x,this.gridSize-1-y,z);
    if(this.mirrorZ&&this.inB(x,y,this.gridSize-1-z))act(x,y,this.gridSize-1-z);
  }

  // === FILL ===
  private floodFill(sx:number,sy:number,sz:number,newColor:number){
    const k=this.key(sx,sy,sz);
    if(!this.voxels.has(k))return;
    const d=this.voxelData.find(v=>v.x===sx&&v.y===sy&&v.z===sz);
    if(!d||d.color===newColor)return;
    const oldColor=d.color;
    const queue:number[][]=[[sx,sy,sz]];
    const visited=new Set<string>();
    this.startBatch();
    while(queue.length>0){
      const[x,y,z]=queue.pop()!;
      const ck=this.key(x,y,z);
      if(visited.has(ck))continue;
      visited.add(ck);
      const vd=this.voxelData.find(v=>v.x===x&&v.y===y&&v.z===z);
      if(!vd||vd.color!==oldColor)continue;
      this.currentBatch.removed.push({...vd});
      this.voxels.get(ck)!.material=this.paletteMats[newColor];
      vd.color=newColor;
      this.currentBatch.added.push({...vd});
      for(const[dx,dy,dz]of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
        const nx=x+dx,ny=y+dy,nz=z+dz;
        if(this.inB(nx,ny,nz)&&!visited.has(this.key(nx,ny,nz)))queue.push([nx,ny,nz]);
      }
    }
    this.endBatch();
  }

  // === LINE ===
  private drawLine(a:[number,number,number],b:[number,number,number]){
    this.startBatch();
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
    const steps=Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz));
    for(let i=0;i<=steps;i++){
      const t=steps===0?0:i/steps;
      const x=Math.round(a[0]+dx*t),y=Math.round(a[1]+dy*t),z=Math.round(a[2]+dz*t);
      if(this.inB(x,y,z))this.doAction(x,y,z);
    }
    this.endBatch();
  }

  // === BOX SELECT ===
  private updateBoxPreview(){
    if(!this.boxStart||!this.boxEnd)return;
    if(this.boxPreview)this.scene.remove(this.boxPreview);
    const[x1,y1,z1]=this.boxStart,[x2,y2,z2]=this.boxEnd;
    const mx=Math.min(x1,x2),my=Math.min(y1,y2),mz=Math.min(z1,z2);
    const sx=Math.abs(x2-x1)+1,sy=Math.abs(y2-y1)+1,sz=Math.abs(z2-z1)+1;
    const h=this.gridSize/2;
    this.boxPreview=new THREE.Mesh(
      new THREE.BoxGeometry(sx,sy,sz),
      new THREE.MeshStandardMaterial({color:PALETTE[this.currentColor],transparent:true,opacity:0.2})
    );
    this.boxPreview.position.set(mx-h+sx/2,my+sy/2,mz-h+sz/2);
    this.scene.add(this.boxPreview);
  }


  // === BOX FILL ===
  private fillBoxArea(){
    if(!this.boxStart||!this.boxEnd)return;
    const[x1,y1,z1]=this.boxStart,[x2,y2,z2]=this.boxEnd;
    this.startBatch();
    for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)
      for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)
        for(let z=Math.min(z1,z2);z<=Math.max(z1,z2);z++)
          if(this.inB(x,y,z))this.placeVoxel(x,y,z,this.currentColor);
    this.endBatch();
  }

  // === PREVIEW (экспорт merged mesh для игры) ===
  exportMergedMesh(): THREE.Group {
    const group = new THREE.Group();
    // Group voxels by color+shape for merged geometry
    const groups = new Map<string, VoxelData[]>();
    for (const v of this.voxelData) {
      const key = `${v.color}_${v.shape || 'box'}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(v);
    }

    const half = this.gridSize / 2;
    for (const [key, voxels] of groups) {
      const [colorIdx, shape] = key.split('_');
      const geo = this.geos[(shape || 'box') as VoxelShape];
      const mat = this.paletteMats[parseInt(colorIdx)];

      // Merge all voxels of same color+shape into one mesh
      const matrices: THREE.Matrix4[] = [];
      for (const v of voxels) {
        const m = new THREE.Matrix4();
        m.setPosition(v.x - half + 0.5, v.y + 0.5, v.z - half + 0.5);
        matrices.push(m);
      }

      // Use InstancedMesh for performance
      const instanced = new THREE.InstancedMesh(geo, mat, voxels.length);
      for (let i = 0; i < matrices.length; i++) {
        instanced.setMatrixAt(i, matrices[i]);
      }
      instanced.instanceMatrix.needsUpdate = true;
      group.add(instanced);
    }
    return group;
  }

  // === ROTATE MODEL ===
  rotateModelY(){
    const newData=this.voxelData.map(v=>({...v,x:this.gridSize-1-v.z,z:v.x}));
    this.startBatch();
    for(const v of this.voxelData)this.currentBatch.removed.push({...v});
    this.voxels.forEach(m=>this.scene.remove(m));this.voxels.clear();this.voxelData=[];
    for(const v of newData){
      const ps=this.voxelShape;this.voxelShape=v.shape||'box';
      this.placeVoxel(v.x,v.y,v.z,v.color,false);this.voxelShape=ps;
    }
    for(const v of this.voxelData)this.currentBatch.added.push({...v});
    this.endBatch();
  }

  // === UNDO/REDO ===
  private startBatch(){this.batching=true;this.currentBatch={added:[],removed:[]};}
  private endBatch(){
    if(!this.batching)return;this.batching=false;
    if(this.currentBatch.added.length||this.currentBatch.removed.length){
      this.undoStack.push(this.currentBatch);
      if(this.undoStack.length>100)this.undoStack.shift();
      this.redoStack=[];this.notifyHistory();
    }
  }
  undo(){
    const e=this.undoStack.pop();if(!e)return;
    for(const v of e.added)this.removeVoxel(v.x,v.y,v.z,false);
    for(const v of e.removed){const ps=this.voxelShape;this.voxelShape=v.shape||'box';this.placeVoxel(v.x,v.y,v.z,v.color,false);this.voxelShape=ps;}
    this.redoStack.push(e);this.notifyHistory();
  }
  redo(){
    const e=this.redoStack.pop();if(!e)return;
    for(const v of e.removed)this.removeVoxel(v.x,v.y,v.z,false);
    for(const v of e.added){const ps=this.voxelShape;this.voxelShape=v.shape||'box';this.placeVoxel(v.x,v.y,v.z,v.color,false);this.voxelShape=ps;}
    this.undoStack.push(e);this.notifyHistory();
  }
  private notifyHistory(){this.onHistoryChanged?.(this.undoStack.length>0,this.redoStack.length>0);}

  // === IO ===
  clearAll(){
    this.voxels.forEach(m=>this.scene.remove(m));this.voxels.clear();this.voxelData=[];
    this.undoStack=[];this.redoStack=[];this.notifyHistory();
    this.lineStart=null;this.boxStart=null;this.boxEnd=null;
    this.clearSelection();
    if(this.boxPreview){this.scene.remove(this.boxPreview);this.boxPreview=null;}
    this.onVoxelCountChanged?.(0);
    this.updateLayerVisibility();
  }
  exportModel():ModelData{return{name:'Untitled',gridSize:this.gridSize,voxels:[...this.voxelData]};}
  exportJSON():string{return JSON.stringify(this.exportModel(),null,2);}
  importModel(data:ModelData){
    this.clearAll();
    if(data.gridSize&&data.gridSize!==this.gridSize)this.setGridSize(data.gridSize);
    for(const v of data.voxels){const ps=this.voxelShape;this.voxelShape=v.shape||'box';this.placeVoxel(v.x,v.y,v.z,v.color,false);this.voxelShape=ps;}
  }
  importJSON(json:string):boolean{try{this.importModel(JSON.parse(json));return true;}catch{return false;}}

  getPolyCount():number{
    let c=0;
    for(const v of this.voxelData){
      const s=v.shape||'box';
      if(s==='sphere')c+=200;else if(s==='cylinder')c+=48;else c+=12;
    }
    return c;
  }

  // === RENDER ===
  private onResize(){const w=this.container.clientWidth,h=this.container.clientHeight;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);}
  start(){this.isRunning=true;this.lastTime=performance.now();this.animate();}
  stop(){this.isRunning=false;}
  private animate(){
    if(!this.isRunning)return;requestAnimationFrame(this.animate.bind(this));
    const n=performance.now(),dt=Math.min((n-this.lastTime)/1000,0.1);this.lastTime=n;
    this.updateCam(dt);this.renderer.render(this.scene,this.camera);
  }
  dispose(){this.stop();this.renderer.dispose();}
}
