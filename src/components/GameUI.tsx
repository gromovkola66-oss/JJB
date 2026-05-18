import * as THREE from 'three';
import { CombatState } from '../game/Combat';
import { Team } from '../game/TeamSystem';
import { DoorInteractionState } from '../game/Game';

interface GameUIProps {
  fps: number;
  position: THREE.Vector3 | null;
  isLocked: boolean;
  combatState: CombatState | null;
  team: Team;
  teamName: string;
  doorState: DoorInteractionState | null;
  isWarden: boolean;
  guardMenuOpen: boolean;
}

export const GameUI = ({ fps, position, isLocked, combatState, team, teamName, doorState, isWarden: _isWarden, guardMenuOpen }: GameUIProps) => {
  
  return (
    <div className="fixed inset-0 pointer-events-none select-none">
      {/* Прицел */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6">
            <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-white/50 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-white/50 -translate-x-1/2"></div>
            <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-white/50 -translate-y-1/2"></div>
            <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-white/50 -translate-y-1/2"></div>
          </div>
        </div>
      )}

      {/* Статистика (FPS/позиция) */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg font-mono text-sm">
        <div className="text-green-400">FPS: {fps}</div>
        {position && (
          <div className="text-gray-300 mt-1">
            X: {position.x.toFixed(1)} Y: {position.y.toFixed(1)} Z: {position.z.toFixed(1)}
          </div>
        )}
      </div>

      {/* Меню паузы / Инструкции */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-red-500">
              JAILBREAK
            </h1>
            <p className="text-xl mb-2 text-gray-300">Прототип v0.3</p>
            <p className={`text-lg mb-8 ${team === 'guard' ? 'text-blue-400' : 'text-orange-400'}`}>
              {teamName}
            </p>
            
            <div className="bg-gray-800/80 p-6 rounded-xl max-w-md">
              <p className="text-lg mb-4">Кликните, чтобы продолжить</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-left">
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">WASD</span>
                  <span className="text-gray-400 ml-2">Движение</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">Мышь</span>
                  <span className="text-gray-400 ml-2">Обзор</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">SPACE</span>
                  <span className="text-gray-400 ml-2">Прыжок</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">ЛКМ</span>
                  <span className="text-gray-400 ml-2">Атака/Стрельба</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">E</span>
                  <span className="text-gray-400 ml-2">Подобрать оружие</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">G</span>
                  <span className="text-gray-400 ml-2">Выбросить оружие</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">R</span>
                  <span className="text-gray-400 ml-2">Перезарядка</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                  <span className="text-yellow-400 font-bold">ESC</span>
                  <span className="text-gray-400 ml-2">Пауза</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-gray-500 text-sm">
              {team === 'guard' ? (
                <p>Вы охранник. Контролируйте заключённых.</p>
              ) : (
                <p>Вы заключённый. Выживайте или бунтуйте.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HP бар и роль */}
      {isLocked && combatState && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          {/* Роль */}
          <div className={`flex items-center px-3 py-1 rounded-lg ${
            team === 'guard' ? 'bg-blue-600/80' : 'bg-orange-600/80'
          }`}>
            <span className="text-white font-bold text-sm">{teamName}</span>
          </div>
          
          {/* Здоровье */}
          <div className="flex items-center gap-3 bg-black/60 p-3 rounded-lg">
            <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                style={{ width: `${(combatState.hp / combatState.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-white font-bold min-w-[60px]">
              {combatState.hp}/{combatState.maxHp}
            </span>
          </div>
        </div>
      )}

      {/* Подсказка M для охраны */}
      {isLocked && team === 'guard' && !guardMenuOpen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-900/60 text-blue-200 px-4 py-1 rounded-lg text-sm">
            Нажмите <span className="text-yellow-400 font-bold">M</span> — Меню охраны
          </div>
        </div>
      )}

      {/* Оружие и патроны */}
      {isLocked && combatState && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
          {combatState.hasWeapon ? (
            <div className="bg-black/60 p-3 rounded-lg flex items-center gap-4">
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-lg">AK-47</div>
                <div className="text-gray-400 text-sm">Автомат</div>
              </div>
              <div className="text-white">
                <span className="text-3xl font-bold">{combatState.ammo}</span>
                <span className="text-gray-400 text-lg">/{combatState.maxAmmo}</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/60 p-3 rounded-lg flex items-center gap-4">
              <div className="text-right">
                <div className="text-gray-400 font-bold text-lg">Кулаки</div>
                <div className="text-gray-500 text-sm">Урон: 20</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Подсказка для подбора оружия (только для зеков) */}
      {isLocked && combatState && !combatState.hasWeapon && team === 'prisoner' && !doorState?.canInteract && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            Найдите оружие в оружейной и нажмите <span className="text-yellow-400 font-bold">E</span> для подбора
          </div>
        </div>
      )}

      {/* Подсказка для взаимодействия с дверью */}
      {isLocked && doorState?.canInteract && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          {doorState.isGuard ? (
            <div className="bg-blue-900/80 text-white px-6 py-3 rounded-lg">
              <div className="font-bold">
                Камера #{(doorState.door?.cellIndex ?? 0) + 1}
              </div>
              <div className="text-sm text-blue-200">
                Нажмите <span className="text-yellow-400 font-bold">E</span> чтобы {doorState.door?.isOpen ? 'закрыть' : 'открыть'}
              </div>
            </div>
          ) : (
            <div className="bg-red-900/80 text-white px-6 py-3 rounded-lg">
              <div className="font-bold">Дверь заперта</div>
              <div className="text-sm text-red-200">Только охрана может открыть</div>
            </div>
          )}
        </div>
      )}

      {/* Миникарта */}
      {isLocked && position && (
        <div className="absolute top-4 right-4 w-40 h-40 bg-black/70 rounded-lg border border-gray-600 p-2">
          <div className="relative w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Коридор */}
              <rect x="40" y="10" width="20" height="80" fill="#555" />
              
              {/* Камеры */}
              <rect x="10" y="20" width="30" height="50" fill="#444" />
              
              {/* Оружейная */}
              <rect x="60" y="35" width="25" height="25" fill="#654" />
              
              {/* Двор */}
              <rect x="20" y="0" width="40" height="15" fill="#666" stroke="#777" strokeWidth="1" />
              
              {/* Игрок */}
              <circle 
                cx={Math.max(5, Math.min(95, 50 + position.x * 1.5))} 
                cy={Math.max(5, Math.min(95, 50 - position.z * 1.5))} 
                r="3" 
                fill={team === 'guard' ? '#3b82f6' : '#f97316'} 
              />
            </svg>
            
            <div className="absolute bottom-0 left-0 text-[8px] text-gray-400">
              МИНИКАРТА
            </div>
          </div>
        </div>
      )}

      {/* Роль игрока - теперь внизу слева над HP */}

      {/* Экран смерти */}
      {isLocked && combatState?.isDead && (
        <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-white mb-4">ВЫ ПОГИБЛИ</h2>
            <p className="text-xl text-gray-300">Ожидание следующего раунда...</p>
          </div>
        </div>
      )}
    </div>
  );
};
