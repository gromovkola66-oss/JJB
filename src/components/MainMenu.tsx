import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenEditor: () => void;
}

// === 3D СЦЕНА — тюремный коридор с охранником ===
const MenuScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth, H = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.04);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);

    // Материалы
    const conc = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 });
    const concD = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.95 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.3, metalness: 0.9 });
    const metalL = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.3, metalness: 0.7 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.75 });
    const guardBlue = new THREE.MeshStandardMaterial({ color: 0x1e3a6e, roughness: 0.8 });
    const guardBlueD = new THREE.MeshStandardMaterial({ color: 0x162e58, roughness: 0.85 });
    const boots = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.85 });
    const belt = new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 0.8 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x6b4513, roughness: 0.8 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 0.8 });
    const b = (w: number, h: number, d: number, m: THREE.Material) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; };
    const c = (r: number, h: number, m: THREE.Material) => { const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 10), m); mesh.castShadow = true; return mesh; };
    const s = (mesh: THREE.Mesh, x: number, y: number, z: number) => { mesh.position.set(x, y, z); return mesh; };

    // Свет
    scene.add(new THREE.AmbientLight(0x1a1a2e, 0.6));
    const lamps: THREE.PointLight[] = [];
    for (let z = -8; z <= 8; z += 4) {
      scene.add(s(b(0.5, 0.04, 0.15, lampMat), 0, 3.8, z));
      const pl = new THREE.PointLight(0xffeecc, 0.7, 8);
      pl.position.set(0, 3.6, z);
      pl.castShadow = true;
      scene.add(pl);
      lamps.push(pl);
    }

    // === КОРИДОР ===
    // Пол
    scene.add(s(b(4, 0.1, 20, concD), 0, 0, 0));
    // Потолок
    scene.add(s(b(4, 0.15, 20, concD), 0, 4, 0));
    // Левая стена
    scene.add(s(b(0.3, 4, 20, conc), -2.15, 2, 0));
    // Правая стена
    scene.add(s(b(0.3, 4, 20, conc), 2.15, 2, 0));

    // Решётки камер (левая стена)
    for (let z = -6; z <= 6; z += 4) {
      // Рама
      scene.add(s(b(0.1, 3, 0.1, metal), -1.95, 1.6, z - 0.8));
      scene.add(s(b(0.1, 3, 0.1, metal), -1.95, 1.6, z + 0.8));
      scene.add(s(b(0.1, 0.1, 1.7, metal), -1.95, 3.1, z));
      // Прутья
      for (let dz = -0.6; dz <= 0.6; dz += 0.25) {
        scene.add(s(c(0.02, 3, metal), -1.95, 1.6, z + dz));
      }
      // Горизонтальные
      for (const y of [0.5, 1.6, 2.7]) {
        scene.add(s(b(0.05, 0.05, 1.6, metalL), -1.95, y, z));
      }
    }

    // Трубы на потолке
    scene.add(s(c(0.06, 20, new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.7, metalness: 0.4 })), 1.2, 3.85, 0));

    // Разметка на полу
    scene.add(s(b(0.08, 0.01, 18, new THREE.MeshStandardMaterial({ color: 0xccaa00, roughness: 0.7 })), 0, 0.06, 0));

    // === ОХРАННИК ===
    const guard = new THREE.Group();
    guard.add(s(b(0.22, 0.24, 0.22, skin), 0, 1.72, 0));
    guard.add(s(b(0.24, 0.06, 0.24, guardBlueD), 0, 1.87, 0));
    guard.add(s(b(0.28, 0.03, 0.14, guardBlueD), 0, 1.86, 0.1));
    guard.add(s(c(0.13, 0.08, guardBlue), 0, 1.9, 0));
    guard.add(s(b(0.38, 0.5, 0.22, guardBlue), 0, 1.3, 0));
    guard.add(s(b(0.36, 0.08, 0.2, guardBlueD), 0, 1.02, 0));
    guard.add(s(b(0.39, 0.05, 0.23, belt), 0, 1.05, 0));
    guard.add(s(b(0.17, 0.45, 0.18, pants), -0.1, 0.72, 0));
    guard.add(s(b(0.17, 0.45, 0.18, pants), 0.1, 0.72, 0));
    guard.add(s(b(0.12, 0.1, 0.22, boots), -0.1, 0.45, 0.02));
    guard.add(s(b(0.12, 0.1, 0.22, boots), 0.1, 0.45, 0.02));
    // Руки (левая, правая, кисти)
    const armL = s(b(0.1, 0.35, 0.1, guardBlue), -0.24, 1.35, 0); guard.add(armL);
    const armR = s(b(0.1, 0.35, 0.1, guardBlue), 0.24, 1.35, 0); guard.add(armR);
    guard.add(s(b(0.08, 0.15, 0.08, skin), -0.24, 1.1, 0));
    guard.add(s(b(0.08, 0.15, 0.08, skin), 0.24, 1.1, 0));
    // Ноги для анимации
    const legL = guard.children[7];
    const legR = guard.children[8];

    // АК
    const ak = new THREE.Group();
    ak.add(s(b(0.03, 0.03, 0.5, metal), 0, 0, -0.15));
    ak.add(s(b(0.06, 0.07, 0.22, metal), 0, -0.01, 0.05));
    ak.add(s(b(0.04, 0.12, 0.06, metal), 0, -0.08, 0.1));
    ak.add(s(b(0.05, 0.06, 0.2, wood), 0, -0.02, 0.25));
    ak.add(s(b(0.04, 0.035, 0.16, wood), 0, -0.02, -0.18));
    ak.position.set(0.15, 1.15, 0.2);
    ak.rotation.set(0.3, 0.1, -0.8);
    guard.add(ak);

    guard.position.set(0.5, 0.05, 5);
    scene.add(guard);

    let time = 0;
    let animId = 0;
    const guardHead = guard.children[0];

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.016;

      // Охранник патрулирует коридор вперёд-назад
      const walkCycle = time * 0.8;
      const guardZ = Math.sin(walkCycle * 0.3) * 6;
      guard.position.z = guardZ;
      guard.position.y = 0.05 + Math.abs(Math.sin(walkCycle)) * 0.02;

      // Поворот корпуса в сторону движения
      const walkDir = Math.cos(walkCycle * 0.3);
      guard.rotation.y = walkDir > 0 ? 0 : Math.PI;

      // Покачивание головы
      if (guardHead) guardHead.rotation.y = Math.sin(time * 0.9) * 0.15;

      // Руки и ноги при ходьбе
      const swing = Math.sin(walkCycle) * 0.35;
      armL.rotation.x = swing;
      armR.rotation.x = -swing;
      legL.rotation.x = -swing * 0.8;
      legR.rotation.x = swing * 0.8;
      ak.rotation.z = -0.8 + Math.sin(walkCycle) * 0.04;

      // Камера — медленный облёт коридора
      const camT = time * 0.08;
      camera.position.set(
        Math.sin(camT) * 1.2,
        1.6 + Math.sin(time * 0.2) * 0.15,
        guardZ + 4 + Math.cos(camT) * 2
      );
      camera.lookAt(0, 1.2, guardZ);

      // Мерцание ламп
      for (let i = 0; i < lamps.length; i++) {
        lamps[i].intensity = 0.7 + Math.sin(time * (6 + i * 3)) * 0.05 + Math.sin(time * (11 + i * 7)) * 0.03;
      }

      renderer.render(scene, camera);
      if (!containerRef.current) cancelAnimationFrame(animId);
    };
    animate();

    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

// === НАСТРОЙКИ ===
const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const [volume, setVolume] = useState(50);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600 rounded-2xl p-8 w-[550px] max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()} style={{ animation: 'scaleIn 0.3s ease' }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Настройки</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition">✕</button>
        </div>

        {/* Звук */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-blue-400 mb-4">Звук</h3>
          <div className="bg-black/30 rounded-xl p-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm">Громкость</span>
                <span className="text-white font-mono text-sm">{volume}%</span>
              </div>
              <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>
        </div>

        {/* Графика */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-green-400 mb-4">Графика</h3>
          <div className="bg-black/30 rounded-xl p-4">
            <span className="text-gray-300 text-sm block mb-3">Качество</span>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${quality === q
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/50 scale-105'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                  {q === 'low' ? 'Низкое' : q === 'medium' ? 'Среднее' : 'Высокое'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Управление */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Управление</h3>
          <div className="bg-black/30 rounded-xl p-4 space-y-2">
            {[
              ['WASD', 'Движение'], ['Мышь', 'Обзор'], ['SPACE', 'Прыжок'],
              ['ЛКМ', 'Атака / Стрельба'], ['E', 'Подобрать / Взаимодействие'],
              ['G', 'Выбросить оружие'], ['R', 'Перезарядка'], ['M', 'Меню охраны'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-700/50 last:border-0">
                <kbd className="bg-gray-700 text-yellow-300 px-3 py-1 rounded text-xs font-mono">{key}</kbd>
                <span className="text-gray-300 text-sm">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02]">
          Закрыть
        </button>
      </div>
    </div>
  );
};

// === СЕРВЕРЫ ===
const ServersPanel = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600 rounded-2xl p-8 w-[500px] shadow-2xl text-center"
      onClick={e => e.stopPropagation()} style={{ animation: 'scaleIn 0.3s ease' }}>
      <h2 className="text-2xl font-bold text-white mb-2">Серверы</h2>
      <p className="text-gray-400 mb-6">Мультиплеер находится в разработке</p>
      <div className="bg-black/30 rounded-xl p-6 mb-6">
        <p className="text-gray-500 text-sm">Список серверов появится здесь в будущих обновлениях.</p>
      </div>
      <button onClick={onClose} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02]">
        Понятно
      </button>
    </div>
  </div>
);

// === ГЛАВНОЕ МЕНЮ ===
export const MainMenu = ({ onStartGame, onOpenEditor }: MainMenuProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showServers, setShowServers] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const buttons = [
    { id: 'play', label: 'Начать игру', color: 'from-blue-600 to-blue-800', hoverColor: 'from-blue-500 to-blue-700', action: onStartGame },
    { id: 'servers', label: 'Серверы', color: 'from-purple-600 to-purple-800', hoverColor: 'from-purple-500 to-purple-700', action: () => setShowServers(true) },
    { id: 'editor', label: 'Редактор карт', color: 'from-emerald-600 to-emerald-800', hoverColor: 'from-emerald-500 to-emerald-700', action: onOpenEditor },
    { id: 'settings', label: 'Настройки', color: 'from-gray-600 to-gray-800', hoverColor: 'from-gray-500 to-gray-700', action: () => setShowSettings(true) },
    { id: 'exit', label: 'Выход', color: 'from-red-700 to-red-900', hoverColor: 'from-red-600 to-red-800', action: () => window.close() },
  ];

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden relative">

      {/* === ФОНОВЫЕ ЧАСТИЦЫ === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-blue-500/5"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* === ЗАГОЛОВОК === */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-12 z-10">
        <div className="text-center" style={{ animation: 'slideDown 0.8s ease' }}>
          <h1 className="text-7xl font-black tracking-wider mb-2" style={{ animation: 'titleGlow 3s ease-in-out infinite' }}>
            <span className="text-blue-400" style={{ textShadow: '0 0 30px rgba(59,130,246,0.5)' }}>Jail</span>
            <span className="text-orange-400" style={{ textShadow: '0 0 30px rgba(249,115,22,0.5)' }}>Break</span>
          </h1>
          <p className="text-gray-500 text-sm tracking-[0.3em] uppercase" style={{ animation: 'fadeIn 1s ease 0.5s forwards', opacity: 0 }}>
            Прототип • v0.5
          </p>
        </div>
      </div>

      {/* === КНОПКИ (левая половина) === */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center z-10">
        <div className="pl-16 pr-8 w-full max-w-md space-y-3">
          {buttons.map((btn, i) => (
            <button key={btn.id}
              onClick={btn.action}
              onMouseEnter={() => setHoveredBtn(btn.id)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{ animationDelay: `${0.3 + i * 0.1}s`, animation: 'fadeIn 0.5s ease forwards', opacity: 0 }}
              className={`w-full text-left px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 cursor-pointer flex items-center gap-4 group
                bg-gradient-to-r ${hoveredBtn === btn.id ? btn.hoverColor : btn.color}
                ${hoveredBtn === btn.id ? 'translate-x-3 shadow-2xl scale-[1.03]' : 'shadow-lg'}
                border border-white/10 hover:border-white/25`}
            >
              <span className="text-white">{btn.label}</span>
              <span className={`ml-auto text-white/40 transition-all duration-300 ${hoveredBtn === btn.id ? 'text-white/80 translate-x-1' : ''}`}>
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* === 3D СЦЕНА (правая половина) === */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0">
        <MenuScene />
        {/* Градиент-переход между кнопками и сценой */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
      </div>

      {/* === НИЖНЯЯ ПОЛОСКА === */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
        <p className="text-gray-700 text-xs tracking-wider">
          © 2025 JailBreak Development
        </p>
      </div>

      {/* === МОДАЛЬНЫЕ ОКНА === */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showServers && <ServersPanel onClose={() => setShowServers(false)} />}

      {/* === СТИЛИ АНИМАЦИЙ === */}
      <style>{`
        @keyframes titleGlow {
          0%, 100% { transform: translateY(0px); filter: brightness(1); }
          50% { transform: translateY(-3px); filter: brightness(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(8px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
