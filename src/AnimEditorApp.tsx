import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimPreview, AnimationClip, Bone, createHumanoidSkeleton, getTemplateClips, AnimationData } from './animEditor/AnimEditorCore';
import { ModelData } from './modelEditor/ModelEditorCore';

interface Props { onBack: () => void; }

function loadModelsFromLibrary(): Array<{ id: string; name: string; model: ModelData }> {
  try {
    const raw = localStorage.getItem('jb_custom_models');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export const AnimEditorApp = ({ onBack }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<AnimPreview | null>(null);

  const [models] = useState(() => loadModelsFromLibrary());
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [bones] = useState<Bone[]>(createHumanoidSkeleton());
  const [clips] = useState<AnimationClip[]>(getTemplateClips());
  const [activeClipIdx, setActiveClipIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showModelSelect, setShowModelSelect] = useState(true);

  useEffect(() => {
    if (!containerRef.current || showModelSelect) return;
    const preview = new AnimPreview(containerRef.current);
    previewRef.current = preview;

    if (selectedModel) {
      preview.loadModel(selectedModel, bones);
    }
    if (clips.length > 0) {
      preview.setClip(clips[activeClipIdx]);
    }
    preview.onTimeUpdate = (t) => setCurrentTime(t);
    preview.start();

    return () => { preview.dispose(); previewRef.current = null; };
  }, [showModelSelect, selectedModel, bones]);

  useEffect(() => {
    if (previewRef.current && clips[activeClipIdx]) {
      previewRef.current.setClip(clips[activeClipIdx]);
    }
  }, [activeClipIdx, clips]);

  const handlePlay = useCallback(() => { previewRef.current?.play(); setPlaying(true); }, []);
  const handlePause = useCallback(() => { previewRef.current?.pause(); setPlaying(false); }, []);
  const handleStop = useCallback(() => { previewRef.current?.stop(); setPlaying(false); setCurrentTime(0); }, []);

  const handleExport = useCallback(() => {
    if (!selectedModel) return;
    const data: AnimationData = { bones, clips, modelData: selectedModel };
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => alert('Анимация экспортирована в буфер обмена!')).catch(() => {
      console.log(json); alert('JSON в консоли (F12)');
    });
  }, [bones, clips, selectedModel]);

  const handleSelectModel = (model: ModelData) => {
    setSelectedModel(model);
    setShowModelSelect(false);
  };

  const activeClip = clips[activeClipIdx];

  // Model selection screen
  if (showModelSelect) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center" style={{ animation: 'scaleIn 0.3s ease' }}>
          <h2 className="text-3xl font-bold text-white mb-2">Редактор анимации</h2>
          <p className="text-gray-400 mb-8">Выберите модель или начните без модели</p>

          <div className="space-y-3 max-w-md mx-auto">
            <button onClick={() => { setSelectedModel(null); setShowModelSelect(false); }}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold transition-all hover:scale-105">
              Без модели (только скелет)
            </button>

            {models.map((m) => (
              <button key={m.id} onClick={() => handleSelectModel(m.model)}
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl transition-all hover:scale-105 hover:from-gray-600">
                {m.name} ({m.model.voxels.length} вокселей)
              </button>
            ))}

            {models.length === 0 && (
              <p className="text-gray-500 text-sm">Нет сохранённых моделей. Создайте модель в редакторе моделей и экспортируйте в библиотеку.</p>
            )}
          </div>

          <button onClick={onBack} className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex">
      {/* 3D Preview */}
      <div ref={containerRef} className="flex-1" />

      {/* Right Panel */}
      <div className="w-72 bg-gray-900/95 border-l border-gray-700 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-3 border-b border-gray-700 flex items-center gap-2">
          <button onClick={onBack} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition">Назад</button>
          <span className="text-white font-bold text-sm flex-1">Редактор анимации</span>
          <button onClick={handleExport} className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs transition">Экспорт</button>
        </div>

        {/* Clips */}
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-wider">Анимации</h3>
          <div className="space-y-1">
            {clips.map((clip, i) => (
              <button key={i} onClick={() => { setActiveClipIdx(i); handleStop(); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeClipIdx === i
                  ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                {clip.name} ({clip.duration}s{clip.loop ? ', loop' : ''})
              </button>
            ))}
          </div>
        </div>

        {/* Playback */}
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-wider">Воспроизведение</h3>
          <div className="flex gap-2 mb-2">
            <button onClick={handlePlay} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${playing ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              Play
            </button>
            <button onClick={handlePause} className="flex-1 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-xs transition">
              Pause
            </button>
            <button onClick={handleStop} className="flex-1 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-xs transition">
              Stop
            </button>
          </div>
          {activeClip && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Время</span>
                <span className="text-white font-mono">{currentTime.toFixed(2)}s / {activeClip.duration}s</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${(currentTime / activeClip.duration) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Keyframes */}
        {activeClip && (
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-wider">
              Ключевые кадры ({activeClip.keyframes.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {activeClip.keyframes.map((kf, i) => (
                <button key={i}
                  onClick={() => { if (previewRef.current) previewRef.current.setTime(kf.time * activeClip.duration); setCurrentTime(kf.time * activeClip.duration); }}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[10px] font-mono transition">
                  {(kf.time * 100).toFixed(0)}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bones */}
        <div className="p-3 flex-1">
          <h3 className="text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-wider">Кости ({bones.length})</h3>
          <div className="space-y-1">
            {bones.map(bone => (
              <div key={bone.id} className="flex items-center gap-2 px-2 py-1 bg-gray-800 rounded text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${bone.color.toString(16).padStart(6, '0')}` }} />
                <span className="text-gray-300 flex-1">{bone.name}</span>
                <span className="text-gray-600 text-[9px]">{bone.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hints */}
        <div className="p-2 border-t border-gray-700 bg-gray-800/50 text-[9px] text-gray-500 leading-relaxed">
          <span className="text-yellow-400">ПКМ</span> вращать камеру
          <br/><span className="text-yellow-400">Колёсико</span> зум
          <br/>Выберите анимацию и нажмите Play
        </div>
      </div>
    </div>
  );
};
