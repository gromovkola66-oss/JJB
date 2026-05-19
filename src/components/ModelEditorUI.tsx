import { useState } from 'react';
import { PALETTE, VoxelShape, ToolType } from '../modelEditor/ModelEditorCore';

interface Props {
  currentColor: number;
  tool: ToolType;
  mirrorX: boolean; mirrorY: boolean; mirrorZ: boolean;
  voxelCount: number;
  gridSize: number;
  voxelShape: VoxelShape;
  canUndo: boolean; canRedo: boolean;
  polyCount: number;
  currentLayer: number;
  isolateLayer: boolean;
  selectionCount: number;
  onSetColor: (i: number) => void;
  onSetTool: (t: ToolType) => void;
  onToggleMirror: (axis: 'x'|'y'|'z') => void;
  onSetGridSize: (s: number) => void;
  onSetShape: (s: VoxelShape) => void;
  onUndo: () => void; onRedo: () => void;
  onRotateModel: () => void;
  onSetLayer: (l: number) => void;
  onToggleIsolateLayer: () => void;
  onCopySelection: () => void;
  onPasteSelection: () => void;
  onMoveSelection: (dx: number, dy: number, dz: number) => void;
  onDeleteSelection: () => void;
  onPreview: () => void;
  onExportToMap: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onBack: () => void;
}

export const ModelEditorUI = (p: Props) => {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const tools: { id: ToolType; icon: string; label: string; key: string }[] = [
    { id: 'place', icon: '🧱', label: 'Ставить', key: '1' },
    { id: 'remove', icon: '❌', label: 'Убрать', key: '2' },
    { id: 'paint', icon: '🎨', label: 'Красить', key: '3' },
    { id: 'fill', icon: '🪣', label: 'Заливка', key: '4' },
    { id: 'pipette', icon: '💉', label: 'Пипетка', key: '5' },
    { id: 'line', icon: '📏', label: 'Линия', key: '6' },
    { id: 'boxfill', icon: '📦', label: 'Объём', key: '7' },
    { id: 'boxselect', icon: '⬜', label: 'Выделить', key: '8' },
  ];
  const shapes: { id: VoxelShape; icon: string; label: string }[] = [
    { id: 'box', icon: '⬜', label: 'Куб' },
    { id: 'rounded', icon: '🔶', label: 'Скругл.' },
    { id: 'sphere', icon: '🔵', label: 'Сфера' },
    { id: 'cylinder', icon: '🟡', label: 'Цилиндр' },
    { id: 'triangle', icon: '🔺', label: 'Треуг.' },
    { id: 'wedge', icon: '📐', label: 'Скос' },
  ];
  const gridSizes = [16, 32, 48, 64, 96, 128];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gray-900/95 border-b border-gray-700 flex items-center px-4 pointer-events-auto">
        <button onClick={p.onBack} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold transition">← Назад</button>
        <div className="h-6 w-px bg-gray-600 mx-3" />
        <span className="text-white font-bold text-sm">🎨 Редактор моделей</span>
        <div className="h-6 w-px bg-gray-600 mx-3" />
        <span className="text-gray-400 text-xs">Вокселей: <span className="text-white font-bold">{p.voxelCount}</span></span>
        <span className="text-gray-600 mx-1">|</span>
        <span className="text-gray-400 text-xs">Полигонов: <span className="text-yellow-300 font-bold">~{p.polyCount}</span></span>
        <span className="text-gray-600 mx-1">|</span>
        <span className="text-gray-400 text-xs">Сетка: <span className="text-white font-bold">{p.gridSize}³</span></span>
        <span className="text-gray-600 mx-1">|</span>
        <span className="text-gray-400 text-xs">Слой: <span className="text-cyan-300 font-bold">{p.currentLayer}</span></span>
        <span className="text-gray-600 mx-1">|</span>
        <span className="text-gray-400 text-xs">Выделено: <span className="text-orange-300 font-bold">{p.selectionCount}</span></span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <button onClick={p.onUndo} disabled={!p.canUndo} className={`px-2 py-1.5 rounded text-sm transition ${p.canUndo?'bg-gray-700 hover:bg-gray-600 text-white':'bg-gray-800 text-gray-600'}`} title="Ctrl+Z">↩</button>
          <button onClick={p.onRedo} disabled={!p.canRedo} className={`px-2 py-1.5 rounded text-sm transition ${p.canRedo?'bg-gray-700 hover:bg-gray-600 text-white':'bg-gray-800 text-gray-600'}`} title="Ctrl+Y">↪</button>
          <div className="h-6 w-px bg-gray-600 mx-1" />
          <button onClick={p.onRotateModel} className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition" title="Повернуть модель 90°">🔄</button>
          <button onClick={p.onPreview} className="px-2.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs transition" title="Предпросмотр с освещением">👁</button>
          <button onClick={p.onExportToMap} className="px-2.5 py-1.5 bg-orange-700 hover:bg-orange-600 text-white rounded text-xs transition" title="Сохранить в редактор карт">↗</button>
          <button onClick={() => setShowHelp(true)} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition">❓</button>
          <button onClick={p.onClear} className="px-2.5 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-xs transition">🗑️</button>
          <button onClick={() => setShowImport(true)} className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition">📂</button>
          <button onClick={p.onExport} className="px-2.5 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded text-xs transition">💾</button>
        </div>
      </div>

      {/* Left */}
      <div className="absolute left-0 top-12 bottom-0 w-52 bg-gray-900/95 border-r border-gray-700 pointer-events-auto flex flex-col overflow-y-auto">
        {/* Tools */}
        <div className="p-2.5 border-b border-gray-700">
          <h3 className="text-gray-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Инструменты</h3>
          <div className="grid grid-cols-4 gap-1">
            {tools.map(t => (
              <button key={t.id} onClick={() => p.onSetTool(t.id)}
                className={`py-1 rounded text-center transition-all text-[9px] leading-tight ${p.tool === t.id ? 'bg-blue-600 text-white scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                <div className="text-sm">{t.icon}</div>
                <div>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Shapes */}
        <div className="p-2.5 border-b border-gray-700">
          <h3 className="text-gray-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Форма</h3>
          <div className="grid grid-cols-3 gap-1">
            {shapes.map(s => (
              <button key={s.id} onClick={() => p.onSetShape(s.id)}
                className={`py-1 rounded text-center transition-all text-[9px] ${p.voxelShape === s.id ? 'bg-purple-600 text-white scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                <div className="text-sm">{s.icon}</div>
                <div>{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mirror + Grid */}
        <div className="px-2.5 py-2 border-b border-gray-700 space-y-1.5">
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Зеркало</h3>
          <div className="grid grid-cols-3 gap-1">
            {(['x','y','z'] as const).map(ax => (
              <button key={ax} onClick={() => p.onToggleMirror(ax)}
                className={`py-1 rounded text-xs font-medium transition ${
                  (ax==='x'?p.mirrorX:ax==='y'?p.mirrorY:p.mirrorZ)
                    ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
                {ax.toUpperCase()}
              </button>
            ))}
          </div>
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-2">Сетка</h3>
          <div className="grid grid-cols-3 gap-1">
            {gridSizes.map(s => (
              <button key={s} onClick={() => p.onSetGridSize(s)}
                className={`py-0.5 rounded text-[10px] font-mono transition ${p.gridSize === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
                {s}
              </button>
            ))}
          </div>

          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-2">Слои</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => p.onSetLayer(p.currentLayer - 1)} className="flex-1 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700">−</button>
            <div className="px-2 py-1 bg-gray-800 rounded text-[10px] text-cyan-300 font-mono">Y {p.currentLayer}</div>
            <button onClick={() => p.onSetLayer(p.currentLayer + 1)} className="flex-1 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700">＋</button>
          </div>
          <button onClick={p.onToggleIsolateLayer}
            className={`w-full mt-1 py-1 rounded text-[10px] font-medium transition ${p.isolateLayer ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
            {p.isolateLayer ? '👁️ Только текущий слой' : '👁️ Показать все слои'}
          </button>
        </div>

        {/* Palette */}
        <div className="p-2.5 flex-1">
          <h3 className="text-gray-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Палитра</h3>
          <div className="grid grid-cols-8 gap-0.5">
            {PALETTE.map((c, i) => (
              <button key={i} onClick={() => p.onSetColor(i)}
                className={`w-[19px] h-[19px] rounded-sm transition-all ${p.currentColor === i ? 'ring-2 ring-white scale-[1.3] z-10' : 'hover:scale-110'}`}
                style={{ backgroundColor: `#${c.toString(16).padStart(6, '0')}` }} />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-gray-600" style={{ backgroundColor: `#${PALETTE[p.currentColor].toString(16).padStart(6, '0')}` }} />
            <span className="text-gray-500 text-[10px] font-mono">#{PALETTE[p.currentColor].toString(16).padStart(6, '0')}</span>
          </div>
        </div>

        {/* Hints */}
        <div className="p-2 border-t border-gray-700 bg-gray-800/50 text-[9px] text-gray-500 leading-relaxed">
          <span className="text-yellow-400">ЛКМ</span> действие <span className="text-yellow-400">Alt+ЛКМ</span> пипетка
          <br/><span className="text-yellow-400">ПКМ</span> обзор <span className="text-yellow-400">СКМ</span> панорама
          <br/><span className="text-yellow-400">WASD/QE</span> полёт <span className="text-yellow-400">Shift</span> быстро
          <br/><span className="text-yellow-400">1-8</span> инструмент <span className="text-yellow-400">Ctrl+Z/Y</span> undo
          <br/><span className="text-yellow-400">[/]</span> слой <span className="text-yellow-400">L</span> изоляция
          <br/><span className="text-yellow-400">Ctrl+C/V</span> copy/paste выделения
        </div>
      </div>

      {/* Selection panel */}
      {p.selectionCount > 0 && (
        <div className="absolute right-4 top-16 w-56 bg-gray-900/95 border border-gray-700 rounded-xl p-4 pointer-events-auto" style={{ animation: 'scaleIn 0.2s ease' }}>
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span>⬜</span>
            <span>Выделение: {p.selectionCount}</span>
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button onClick={p.onCopySelection} className="py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-xs transition">📋</button>
            <button onClick={p.onPasteSelection} className="py-2 bg-green-600/80 hover:bg-green-500 text-white rounded-lg text-xs transition">📌</button>
            <button onClick={p.onDeleteSelection} className="py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs transition">🗑️</button>
          </div>
          <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">Сдвиг</div>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => p.onMoveSelection(0,1,0)} className="py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">Y+</button>
            <button onClick={() => p.onMoveSelection(0,0,-1)} className="py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">Z-</button>
            <button onClick={() => p.onMoveSelection(1,0,0)} className="py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">X+</button>
            <button onClick={() => p.onMoveSelection(-1,0,0)} className="py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">X-</button>
            <button onClick={() => p.onMoveSelection(0,0,1)} className="py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">Z+</button>
            <button onClick={() => p.onMoveSelection(0,-1,0)} className="py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs">Y-</button>
          </div>
          <div className="mt-3 text-[10px] text-gray-500 leading-relaxed">
            Ctrl+C — копировать<br/>Ctrl+V — вставить<br/>Стрелки / PgUp/PgDown — двигать
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-gray-700 rounded-lg px-5 py-2 pointer-events-none text-sm text-gray-300">
        {p.tool==='place'&&'🧱 ЛКМ/зажать — ставить'}{p.tool==='remove'&&'❌ ЛКМ/зажать — убрать'}{p.tool==='paint'&&'🎨 ЛКМ/зажать — красить'}
        {p.tool==='fill'&&'🪣 ЛКМ — залить одноцветные'}{p.tool==='pipette'&&'💉 ЛКМ — подхватить цвет и форму'}
        {p.tool==='line'&&'📏 1-й ЛКМ — начало, 2-й ЛКМ — конец линии'}
        {p.tool==='boxfill'&&'📦 Зажми ЛКМ — протяни для заполнения объёма'}{p.tool==='boxselect'&&'⬜ Зажми ЛКМ — протяни для выделения'}
      </div>

      {/* Import */}
      {showImport && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto z-50">
          <div className="bg-gray-900 border border-gray-600 rounded-xl p-6 w-[500px]" style={{ animation: 'scaleIn 0.2s ease' }}>
            <h3 className="text-white font-bold text-lg mb-4">📂 Импорт модели</h3>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Вставьте JSON..."
              className="w-full h-48 bg-gray-800 text-white border border-gray-600 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:border-blue-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowImport(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition">Отмена</button>
              <button onClick={() => { if (importText.trim()) { p.onImport(importText); setShowImport(false); setImportText(''); } }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition">Импорт</button>
            </div>
          </div>
        </div>
      )}

      {/* Help */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600 rounded-2xl p-6 w-[550px] max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()} style={{ animation: 'scaleIn 0.25s ease' }}>
            <h2 className="text-xl font-bold text-white mb-4">🎨 Справка</h2>
            <div className="space-y-1 text-sm">
              {[
                ['ЛКМ','Действие инструмента'],['ЛКМ зажать','Рисовать по поверхности'],
                ['Alt+ЛКМ','Пипетка (подхватить цвет)'],['ПКМ+мышь','Вращать камеру'],
                ['СКМ+мышь','Панорамирование'],['Колёсико','Зум'],['WASD','Свободный полёт'],
                ['Q/E','Вниз/Вверх'],['Shift','Ускорение'],['1-8','Инструменты'],
                ['Ctrl+Z','Отменить'],['Ctrl+Y','Повторить'],['Ctrl+C / Ctrl+V','Копировать / вставить выделение'],
                ['[ / ]','Слой вниз / вверх'],['L','Изоляция текущего слоя'],['Стрелки / PgUp / PgDn','Двигать выделение'],['🔄','Повернуть модель на 90°'],
              ].map(([k,d])=>(
                <div key={k} className="flex items-center gap-3 py-0.5 border-b border-gray-700/50">
                  <kbd className="bg-gray-700 text-yellow-300 px-2 py-0.5 rounded text-xs font-mono min-w-[80px] text-center">{k}</kbd>
                  <span className="text-gray-300 text-xs">{d}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-indigo-900/30 border border-indigo-700/40 rounded-xl p-3">
              <h3 className="text-indigo-300 font-bold text-sm mb-1">💡 Инструменты</h3>
              <ul className="text-xs text-gray-300 space-y-0.5">
                <li>🧱 <b>Ставить</b> — блоки по одному или зажав</li>
                <li>❌ <b>Убрать</b> — удалять блоки</li>
                <li>🎨 <b>Красить</b> — перекрашивать существующие</li>
                <li>🪣 <b>Заливка</b> — красит все соседние одного цвета</li>
                <li>💉 <b>Пипетка</b> — копирует цвет и форму блока</li>
                <li>📏 <b>Линия</b> — 2 клика = линия между ними</li>
                <li>📦 <b>Объём</b> — протяни для заполнения объёма</li>
                <li>⬜ <b>Выделить</b> — протяни для выделения области</li>
                <li>↗ <b>В редактор карт</b> — сохраняет модель в библиотеку карты</li>
                <li>👁 <b>Предпросмотр</b> — показывает оптимизированную модель с освещением</li>
              </ul>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">Понятно!</button>
          </div>
        </div>
      )}
    </div>
  );
};
