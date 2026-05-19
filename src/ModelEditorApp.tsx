import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ModelEditorCore, VoxelShape, ToolType, ModelData } from './modelEditor/ModelEditorCore';
import { ModelEditorUI } from './components/ModelEditorUI';

interface Props { onBack: () => void; }

function saveCustomModelToLibrary(model: ModelData, name: string) {
  const key = 'jb_custom_models';
  const raw = localStorage.getItem(key);
  const arr = raw ? (JSON.parse(raw) as Array<{ id: string; name: string; model: ModelData }>) : [];
  arr.push({ id: `custom_model_${Date.now()}`, name, model });
  localStorage.setItem(key, JSON.stringify(arr));
}

const PreviewModal = ({ model, onClose }: { model: THREE.Group; onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101018);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(700, 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ref.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(50, 700 / 500, 0.1, 500);
    camera.position.set(10, 10, 16);
    camera.lookAt(0, 6, 0);

    scene.add(new THREE.AmbientLight(0x5a5a70, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(15, 20, 10);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x66aaff, 0.35);
    rim.position.set(-10, 5, -8);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x30303a, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const wrapper = new THREE.Group();
    wrapper.add(model);
    scene.add(wrapper);

    let t = 0;
    let id = 0;
    const animate = () => {
      id = requestAnimationFrame(animate);
      t += 0.01;
      wrapper.rotation.y = t * 0.6;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      renderer.dispose();
      if (ref.current?.contains(renderer.domElement)) ref.current.removeChild(renderer.domElement);
    };
  }, [model]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()} style={{ animation: 'scaleIn 0.25s ease' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Предпросмотр модели</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300">✕</button>
        </div>
        <div ref={ref} className="w-[700px] h-[500px] rounded-xl overflow-hidden border border-gray-700" />
        <div className="mt-4 text-sm text-gray-400">Модель показана в оптимизированном режиме для игры.</div>
      </div>
    </div>
  );
};

export const ModelEditorApp = ({ onBack }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<ModelEditorCore | null>(null);

  const [currentColor, setCurrentColor] = useState(0);
  const [tool, setTool] = useState<ToolType>('place');
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);
  const [mirrorZ, setMirrorZ] = useState(false);
  const [voxelCount, setVoxelCount] = useState(0);
  const [gridSize, setGridSize] = useState(32);
  const [voxelShape, setVoxelShape] = useState<VoxelShape>('box');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [polyCount, setPolyCount] = useState(0);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [isolateLayer, setIsolateLayer] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [previewModel, setPreviewModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const core = new ModelEditorCore(containerRef.current);
    coreRef.current = core;
    setGridSize(core.gridSize);

    core.onVoxelCountChanged = (c) => { setVoxelCount(c); setPolyCount(core.getPolyCount()); };
    core.onGridSizeChanged = (s) => setGridSize(s);
    core.onHistoryChanged = (u, r) => { setCanUndo(u); setCanRedo(r); };
    core.onColorChanged = (c) => setCurrentColor(c);
    core.onToolChanged = (t) => setTool(t);
    core.onLayerChanged = (l) => setCurrentLayer(l);
    core.onLayerIsolationChanged = (v) => setIsolateLayer(v);
    core.onSelectionChanged = (c) => setSelectionCount(c);

    core.start();

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const toolMap: Record<string, ToolType> = {
        Digit1: 'place', Digit2: 'remove', Digit3: 'paint', Digit4: 'fill',
        Digit5: 'pipette', Digit6: 'line', Digit7: 'boxfill', Digit8: 'boxselect',
      };
      if (toolMap[e.code]) { core.tool = toolMap[e.code]; setTool(toolMap[e.code]); }
      if (e.code === 'KeyX') { core.mirrorX = !core.mirrorX; setMirrorX(core.mirrorX); }
      if (e.code === 'KeyY' && !e.ctrlKey) { core.mirrorY = !core.mirrorY; setMirrorY(core.mirrorY); }
      if (e.code === 'KeyZ' && !e.ctrlKey) { core.mirrorZ = !core.mirrorZ; setMirrorZ(core.mirrorZ); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); core.dispose(); coreRef.current = null; };
  }, []);

  const h = {
    setColor: useCallback((i: number) => { if (coreRef.current) coreRef.current.currentColor = i; setCurrentColor(i); }, []),
    setTool: useCallback((t: ToolType) => { if (coreRef.current) coreRef.current.tool = t; setTool(t); }, []),
    toggleMirror: useCallback((ax: 'x'|'y'|'z') => {
      if (!coreRef.current) return;
      if (ax === 'x') { coreRef.current.mirrorX = !coreRef.current.mirrorX; setMirrorX(coreRef.current.mirrorX); }
      if (ax === 'y') { coreRef.current.mirrorY = !coreRef.current.mirrorY; setMirrorY(coreRef.current.mirrorY); }
      if (ax === 'z') { coreRef.current.mirrorZ = !coreRef.current.mirrorZ; setMirrorZ(coreRef.current.mirrorZ); }
    }, []),
    setGridSize: useCallback((s: number) => coreRef.current?.setGridSize(s), []),
    setShape: useCallback((s: VoxelShape) => { if (coreRef.current) coreRef.current.voxelShape = s; setVoxelShape(s); }, []),
    undo: useCallback(() => coreRef.current?.undo(), []),
    redo: useCallback(() => coreRef.current?.redo(), []),
    rotateModel: useCallback(() => coreRef.current?.rotateModelY(), []),
    setLayer: useCallback((l: number) => coreRef.current?.setCurrentLayer(l), []),
    toggleIsolate: useCallback(() => coreRef.current?.toggleLayerIsolation(), []),
    copySelection: useCallback(() => coreRef.current?.copySelection(), []),
    pasteSelection: useCallback(() => coreRef.current?.pasteSelection(), []),
    moveSelection: useCallback((dx: number, dy: number, dz: number) => coreRef.current?.moveSelection(dx, dy, dz), []),
    deleteSelection: useCallback(() => coreRef.current?.deleteSelection(), []),
    preview: useCallback(() => {
      if (!coreRef.current) return;
      setPreviewModel(coreRef.current.exportMergedMesh());
    }, []),
    exportToMap: useCallback(() => {
      if (!coreRef.current) return;
      const name = prompt('Название модели для редактора карт:', 'Новая модель');
      if (!name) return;
      saveCustomModelToLibrary(coreRef.current.exportModel(), name);
      alert('Модель сохранена в библиотеку редактора карт. Открой редактор карт заново, чтобы увидеть её в разделе Предметы.');
    }, []),
    clear: useCallback(() => { if (confirm('Очистить модель?')) coreRef.current?.clearAll(); }, []),
    export: useCallback(() => {
      if (!coreRef.current) return;
      const json = coreRef.current.exportJSON();
      navigator.clipboard.writeText(json).then(() => alert('JSON скопирован!')).catch(() => { console.log(json); alert('JSON в консоли (F12)'); });
    }, []),
    import: useCallback((json: string) => { if (!coreRef.current?.importJSON(json)) alert('Ошибка!'); }, []),
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full" />
      <ModelEditorUI
        currentColor={currentColor} tool={tool}
        mirrorX={mirrorX} mirrorY={mirrorY} mirrorZ={mirrorZ}
        voxelCount={voxelCount} gridSize={gridSize} voxelShape={voxelShape}
        canUndo={canUndo} canRedo={canRedo} polyCount={polyCount}
        currentLayer={currentLayer} isolateLayer={isolateLayer} selectionCount={selectionCount}
        onSetColor={h.setColor} onSetTool={h.setTool} onToggleMirror={h.toggleMirror}
        onSetGridSize={h.setGridSize} onSetShape={h.setShape}
        onUndo={h.undo} onRedo={h.redo} onRotateModel={h.rotateModel}
        onSetLayer={h.setLayer} onToggleIsolateLayer={h.toggleIsolate}
        onCopySelection={h.copySelection} onPasteSelection={h.pasteSelection}
        onMoveSelection={h.moveSelection} onDeleteSelection={h.deleteSelection}
        onPreview={h.preview} onExportToMap={h.exportToMap}
        onClear={h.clear} onExport={h.export} onImport={h.import} onBack={onBack}
      />
      {previewModel && <PreviewModal model={previewModel} onClose={() => setPreviewModel(null)} />}
    </div>
  );
};
