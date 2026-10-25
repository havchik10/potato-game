import { useState, useRef, useEffect } from 'react';

// ============================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================================

interface PotatoState {
  stage: number;        // 0-3
  watered: boolean;
  fertilized: boolean;
  health: number;
  daysPlanted: number;
}

interface GameState {
  beds: (PotatoState | null)[];
  day: number;
  totalHarvest: number;
  isTilled: boolean;
  messages: string[];
  gameOver: boolean;
}

const STAGES = ['🌱 Семянок', '🌿 Ростки', '🌸 Цветение', '🥔 Готов к сбору'];
const BEDS_COUNT = 10;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function createEmptyState(): GameState {
  return {
    beds: Array(BEDS_COUNT).fill(null),
    day: 1,
    totalHarvest: 0,
    isTilled: false,
    messages: ['🏡 Добро пожаловать на вашу дачную ферму!'],
    gameOver: false,
  };
}

function createPotato(): PotatoState {
  return {
    stage: 0,
    watered: false,
    fertilized: false,
    health: 100,
    daysPlanted: 0,
  };
}

function getHealthBar(health: number): string {
  const filled = Math.floor(health / 10);
  const empty = 10 - filled;
  if (health > 70) return '🟩'.repeat(filled) + '⬜'.repeat(empty);
  if (health > 40) return '🟨'.repeat(filled) + '⬜'.repeat(empty);
  return '🟥'.repeat(filled) + '⬜'.repeat(empty);
}

function getPotatoStatus(potato: PotatoState | null): string {
  if (!potato) return '🟫 Пусто';
  if (potato.health <= 0) return '💀 Мёртвый';
  const stage = STAGES[potato.stage];
  const water = potato.watered ? '💧' : '🏜️';
  const fert = potato.fertilized ? '✨' : '';
  return `${stage} ${water}${fert} | ${getHealthBar(potato.health)} ${potato.health}%`;
}

// ============================================================
// КОМПОНЕНТ
// ============================================================

export default function GameSimulator() {
  const [game, setGame] = useState<GameState>(createEmptyState);
  const [bedInput, setBedInput] = useState('');
  const [mode, setMode] = useState<'main' | 'plant' | 'water' | 'fertilize' | 'harvest'>('main');
  const logRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка лога
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game.messages]);

  const addMessage = (msg: string) => {
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-50), msg],
    }));
  };

  const addMessages = (msgs: string[]) => {
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-50), ...msgs],
    }));
  };

  // ---- ДЕЙСТВИЯ ----

  const handleTill = () => {
    if (game.isTilled) {
      addMessage('⚠️ Земля уже вспахана!');
      return;
    }
    setGame(prev => ({
      ...prev,
      isTilled: true,
      messages: [...prev.messages, '✅ Земля успешно вспахана! Теперь можно сажать.'],
    }));
  };

  const handlePlant = (bedNum: number) => {
    if (!game.isTilled) {
      addMessage('⚠️ Сначала нужно вспахать землю!');
      return;
    }
    if (bedNum < 1 || bedNum > BEDS_COUNT) {
      addMessage(`⚠️ Нет такой грядки! У вас грядки от 1 до ${BEDS_COUNT}.`);
      return;
    }
    const idx = bedNum - 1;
    if (game.beds[idx] !== null) {
      addMessage(`⚠️ Грядка ${bedNum} уже занята!`);
      return;
    }
    const newBeds = [...game.beds];
    newBeds[idx] = createPotato();
    setGame(prev => ({
      ...prev,
      beds: newBeds,
      messages: [...prev.messages, `🌱 На грядку ${bedNum} посажен картофель!`],
    }));
    setMode('main');
    setBedInput('');
  };

  const handleWater = (bedNum: number | null) => {
    if (bedNum === null) {
      // Полить все
      let count = 0;
      const newBeds = game.beds.map(bed => {
        if (bed && bed.health > 0 && !bed.watered) {
          count++;
          return { ...bed, watered: true };
        }
        return bed;
      });
      if (count === 0) {
        addMessage('⚠️ Нечего поливать! Все грядки пусты или уже политы.');
      } else {
        setGame(prev => ({
          ...prev,
          beds: newBeds,
          messages: [...prev.messages, `💧 Полито грядок: ${count}`],
        }));
      }
    } else {
      if (bedNum < 1 || bedNum > BEDS_COUNT) {
        addMessage('⚠️ Нет такой грядки!');
        return;
      }
      const idx = bedNum - 1;
      if (!game.beds[idx]) {
        addMessage(`⚠️ На грядке ${bedNum} ничего не посажено!`);
        return;
      }
      if (game.beds[idx]!.health <= 0) {
        addMessage(`⚠️ На грядке ${bedNum} картофель мёртвый. Зачем поливать? 😅`);
        return;
      }
      if (game.beds[idx]!.watered) {
        addMessage(`⚠️ Грядка ${bedNum} уже полита сегодня!`);
        return;
      }
      const newBeds = [...game.beds];
      newBeds[idx] = { ...newBeds[idx]!, watered: true };
      setGame(prev => ({
        ...prev,
        beds: newBeds,
        messages: [...prev.messages, `💧 Грядка ${bedNum} полита!`],
      }));
    }
    setMode('main');
    setBedInput('');
  };

  const handleFertilize = (bedNum: number | null) => {
    if (bedNum === null) {
      let count = 0;
      const newBeds = game.beds.map(bed => {
        if (bed && bed.health > 0 && !bed.fertilized) {
          count++;
          return { ...bed, fertilized: true, health: Math.min(100, bed.health + 10) };
        }
        return bed;
      });
      if (count === 0) {
        addMessage('⚠️ Нечего подкармливать!');
      } else {
        setGame(prev => ({
          ...prev,
          beds: newBeds,
          messages: [...prev.messages, `✨ Подкормлено грядок: ${count}`],
        }));
      }
    } else {
      if (bedNum < 1 || bedNum > BEDS_COUNT) {
        addMessage('⚠️ Нет такой грядки!');
        return;
      }
      const idx = bedNum - 1;
      if (!game.beds[idx]) {
        addMessage(`⚠️ На грядке ${bedNum} ничего не посажено!`);
        return;
      }
      if (game.beds[idx]!.health <= 0) {
        addMessage(`⚠️ Мёртвый картофель не нуждается в подкормке!`);
        return;
      }
      if (game.beds[idx]!.fertilized) {
        addMessage(`⚠️ Грядка ${bedNum} уже подкормлена!`);
        return;
      }
      const newBeds = [...game.beds];
      newBeds[idx] = {
        ...newBeds[idx]!,
        fertilized: true,
        health: Math.min(100, newBeds[idx]!.health + 10),
      };
      setGame(prev => ({
        ...prev,
        beds: newBeds,
        messages: [...prev.messages, `✨ Грядка ${bedNum} подкормлена! Здоровье +10`],
      }));
    }
    setMode('main');
    setBedInput('');
  };

  const handleHarvest = (bedNum: number | null) => {
    if (bedNum === null) {
      let total = 0;
      let harvestedBeds = 0;
      const newBeds = game.beds.map(bed => {
        if (bed && bed.stage >= 3 && bed.health > 0) {
          const healthBonus = bed.health / 100;
          const potatoes = Math.floor(5 + 10 * healthBonus);
          total += potatoes;
          harvestedBeds++;
          return null;
        }
        return bed;
      });
      if (total === 0) {
        addMessage('⚠️ Нет готового к сбору картофеля!');
      } else {
        setGame(prev => ({
          ...prev,
          beds: newBeds,
          totalHarvest: prev.totalHarvest + total,
          messages: [...prev.messages, `🥔 Собрано ${total} картофелин с ${harvestedBeds} грядок! (Всего: ${prev.totalHarvest + total})`],
        }));
      }
    } else {
      if (bedNum < 1 || bedNum > BEDS_COUNT) {
        addMessage('⚠️ Нет такой грядки!');
        return;
      }
      const idx = bedNum - 1;
      if (!game.beds[idx]) {
        addMessage(`⚠️ На грядке ${bedNum} ничего не посажено!`);
        return;
      }
      if (game.beds[idx]!.health <= 0) {
        const newBeds = [...game.beds];
        newBeds[idx] = null;
        setGame(prev => ({
          ...prev,
          beds: newBeds,
          messages: [...prev.messages, `💀 Мёртвый куст убран с грядки ${bedNum}. Урожая нет.`],
        }));
        return;
      }
      if (game.beds[idx]!.stage < 3) {
        addMessage(`⚠️ Картофель на грядке ${bedNum} ещё не готов! Стадия: ${STAGES[game.beds[idx]!.stage]}`);
        return;
      }
      const healthBonus = game.beds[idx]!.health / 100;
      const potatoes = Math.floor(5 + 10 * healthBonus);
      const newBeds = [...game.beds];
      newBeds[idx] = null;
      setGame(prev => ({
        ...prev,
        beds: newBeds,
        totalHarvest: prev.totalHarvest + potatoes,
        messages: [...prev.messages, `🥔 Собрано ${potatoes} картофелин с грядки ${bedNum}! (Всего: ${prev.totalHarvest + potatoes})`],
      }));
    }
    setMode('main');
    setBedInput('');
  };

  const handleNextDay = () => {
    // Сначала обрабатываем рост с учётом текущего состояния (до сброса)
    const grownBeds = game.beds.map(bed => {
      if (!bed || bed.health <= 0) return bed;
      const newBed = { ...bed, watered: false, fertilized: false, daysPlanted: bed.daysPlanted + 1 };
      
      // Рост: если был полит и здоровье > 30
      if (bed.watered && bed.health > 30 && newBed.stage < 3) {
        const growthChance = bed.fertilized ? 0.7 : 0.5;
        if (Math.random() < growthChance) {
          newBed.stage += 1;
        }
      }
      return newBed;
    });

    const msgs: string[] = [];
    const newDay = game.day + 1;
    msgs.push(`⏭️ Наступил день ${newDay}!`);

    // Случайные события (20%)
    if (Math.random() < 0.2) {
      const eventType = ['rain', 'beetle', 'sun'][Math.floor(Math.random() * 3)];
      
      if (eventType === 'rain') {
        for (let i = 0; i < grownBeds.length; i++) {
          if (grownBeds[i] && grownBeds[i]!.health > 0) {
            grownBeds[i] = { ...grownBeds[i]!, watered: true };
          }
        }
        msgs.push('🌧️ СЛУЧАЙНОЕ СОБЫТИЕ: Пошёл дождь! Все грядки политы автоматически!');
      } else if (eventType === 'beetle') {
        const aliveBeds = grownBeds
          .map((b, i) => ({ bed: b, idx: i }))
          .filter(x => x.bed && x.bed.health > 0);
        if (aliveBeds.length > 0) {
          const target = aliveBeds[Math.floor(Math.random() * aliveBeds.length)];
          const damage = Math.floor(Math.random() * 21) + 15; // 15-35
          const newHealth = Math.max(0, target.bed!.health - damage);
          grownBeds[target.idx] = { ...target.bed!, health: newHealth };
          const bedNum = target.idx + 1;
          if (newHealth <= 0) {
            msgs.push(`🪲 СЛУЧАЙНОЕ СОБЫТИЕ: Колорадский жук атаковал грядку ${bedNum}! Урон ${damage}%. Куст погиб! 💀`);
          } else {
            msgs.push(`🪲 СЛУЧАЙНОЕ СОБЫТИЕ: Колорадский жук атаковал грядку ${bedNum}! Урон ${damage}%`);
          }
        } else {
          msgs.push('🪲 СЛУЧАЙНОЕ СОБЫТИЕ: Колорадский жук прилетел, но есть нечего!');
        }
      } else {
        // Солнце
        let grew = 0;
        for (let i = 0; i < grownBeds.length; i++) {
          if (grownBeds[i] && grownBeds[i]!.health > 0 && grownBeds[i]!.stage < 3) {
            if (Math.random() < 0.5) {
              grownBeds[i] = { ...grownBeds[i]!, stage: grownBeds[i]!.stage + 1 };
              grew++;
            }
          }
        }
        msgs.push(`☀️ СЛУЧАЙНОЕ СОБЫТИЕ: Отличная погода! Картофель ускоренно растёт! (${grew} кустов подросли)`);
      }
    }

    // Статистика
    const alive = grownBeds.filter(b => b && b.health > 0).length;
    const ready = grownBeds.filter(b => b && b.stage >= 3 && b.health > 0).length;
    msgs.push(`📈 Активных кустов: ${alive} | Готово к сбору: ${ready}`);

    setGame(prev => ({
      ...prev,
      beds: grownBeds,
      day: newDay,
      messages: [...prev.messages.slice(-50), ...msgs],
    }));
  };

  const handleRestart = () => {
    setGame(createEmptyState());
    setMode('main');
    setBedInput('');
  };

  const handleCheckStatus = () => {
    const msgs: string[] = ['═══ 📊 СОСТОЯНИЕ УЧАСТКА ═══'];
    game.beds.forEach((bed, i) => {
      msgs.push(`  Грядка ${(i + 1).toString().padStart(2)}: ${getPotatoStatus(bed)}`);
    });
    const alive = game.beds.filter(b => b && b.health > 0).length;
    const ready = game.beds.filter(b => b && b.stage >= 3 && b.health > 0).length;
    msgs.push(`─────────────────────────`);
    msgs.push(`  📈 Всего кустов: ${alive} | 🥔 Готово к сбору: ${ready}`);
    msgs.push(`  🏆 Собрано за сезон: ${game.totalHarvest} картофелин`);
    msgs.push('═══════════════════════════');
    addMessages(msgs);
  };

  const handleBedSubmit = () => {
    const num = parseInt(bedInput);
    if (isNaN(num)) {
      addMessage('⚠️ Введите число!');
      return;
    }
    switch (mode) {
      case 'plant': handlePlant(num); break;
      case 'water': handleWater(num); break;
      case 'fertilize': handleFertilize(num); break;
      case 'harvest': handleHarvest(num); break;
    }
  };

  // ============================================================
  // РЕНДЕР
  // ============================================================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Левая панель — Статус */}
      <div className="lg:col-span-1 space-y-4">
        {/* Информация о дне */}
        <div className="bg-black/30 rounded-xl p-4 border border-green-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📅</span>
            <span className="text-xl font-bold text-green-300">День {game.day}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-black/30 rounded-lg p-2 text-center">
              <div className="text-green-400 text-lg font-bold">{game.totalHarvest}</div>
              <div className="text-green-600 text-xs">🥔 Собрано</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center">
              <div className="text-green-400 text-lg font-bold">
                {game.beds.filter(b => b && b.health > 0).length}
              </div>
              <div className="text-green-600 text-xs">🌱 Кустов</div>
            </div>
          </div>
        </div>

        {/* Грядки */}
        <div className="bg-black/30 rounded-xl p-4 border border-green-700/30">
          <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
            🛏️ Грядки ({game.isTilled ? '✅ вспахано' : '❌ не вспахано'})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {game.beds.map((bed, i) => (
              <div
                key={i}
                className={`rounded-lg p-2 text-xs border transition-all ${
                  bed
                    ? bed.health <= 0
                      ? 'bg-red-900/30 border-red-700/50'
                      : bed.stage >= 3
                      ? 'bg-amber-900/30 border-amber-600/50 animate-pulse'
                      : 'bg-green-900/30 border-green-700/50'
                    : 'bg-gray-800/50 border-gray-700/30'
                }`}
              >
                <div className="font-medium text-green-200">#{i + 1}</div>
                <div className="truncate">
                  {bed ? (
                    bed.health <= 0 ? (
                      <span>💀 Мёртвый</span>
                    ) : (
                      <div>
                        <div>{STAGES[bed.stage]}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {bed.watered && <span>💧</span>}
                          {bed.fertilized && <span>✨</span>}
                          <span className="text-[10px]">{bed.health}%</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="text-gray-500">Пусто</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Легенда стадий */}
        <div className="bg-black/30 rounded-xl p-4 border border-green-700/30">
          <h3 className="text-green-300 font-semibold mb-2 text-sm">📖 Стадии роста:</h3>
          <div className="space-y-1 text-xs text-green-400">
            {STAGES.map((stage, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{stage}</span>
                {i < 3 && <span className="text-gray-600">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Правая панель — Действия и лог */}
      <div className="lg:col-span-2 space-y-4">
        {/* Панель действий */}
        <div className="bg-black/30 rounded-xl p-4 border border-green-700/30">
          <h3 className="text-green-300 font-semibold mb-3">🎮 Действия</h3>
          
          {mode === 'main' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={handleTill}
                disabled={game.isTilled}
                className="bg-amber-800/50 hover:bg-amber-700/50 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-amber-700/30"
              >
                🚜 Вскопать
              </button>
              <button
                onClick={() => setMode('plant')}
                className="bg-green-800/50 hover:bg-green-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-green-700/30"
              >
                🌱 Посадить
              </button>
              <button
                onClick={() => setMode('water')}
                className="bg-blue-800/50 hover:bg-blue-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-blue-700/30"
              >
                💧 Полить
              </button>
              <button
                onClick={() => setMode('fertilize')}
                className="bg-purple-800/50 hover:bg-purple-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-purple-700/30"
              >
                ✨ Подкормить
              </button>
              <button
                onClick={handleCheckStatus}
                className="bg-cyan-800/50 hover:bg-cyan-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-cyan-700/30"
              >
                📊 Статус
              </button>
              <button
                onClick={() => setMode('harvest')}
                className="bg-orange-800/50 hover:bg-orange-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-orange-700/30"
              >
                🥔 Собрать
              </button>
              <button
                onClick={handleNextDay}
                className="bg-indigo-800/50 hover:bg-indigo-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-indigo-700/30 col-span-2"
              >
                ⏭️ Следующий день
              </button>
              <button
                onClick={handleRestart}
                className="bg-red-800/50 hover:bg-red-700/50 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors border border-red-700/30"
              >
                🔄 Заново
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-green-300 text-sm">
                  {mode === 'plant' && '🌱 На какую грядку посадить?'}
                  {mode === 'water' && '💧 Какую грядку полить?'}
                  {mode === 'fertilize' && '✨ Какую грядку подкормить?'}
                  {mode === 'harvest' && '🥔 С какой грядки собрать?'}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bedInput}
                  onChange={(e) => setBedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBedSubmit()}
                  placeholder="1-10"
                  className="bg-black/40 border border-green-700/50 rounded-lg px-3 py-2 text-white text-sm w-20 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleBedSubmit}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ✅ OK
                </button>
                {mode !== 'plant' && (
                  <button
                    onClick={() => {
                      switch (mode) {
                        case 'water': handleWater(null); break;
                        case 'fertilize': handleFertilize(null); break;
                        case 'harvest': handleHarvest(null); break;
                      }
                    }}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔄 Все грядки
                  </button>
                )}
                <button
                  onClick={() => { setMode('main'); setBedInput(''); }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ❌ Отмена
                </button>
              </div>
              {/* Быстрые кнопки грядок */}
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: BEDS_COUNT }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setBedInput(String(num));
                      switch (mode) {
                        case 'plant': handlePlant(num); break;
                        case 'water': handleWater(num); break;
                        case 'fertilize': handleFertilize(num); break;
                        case 'harvest': handleHarvest(num); break;
                      }
                    }}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                      game.beds[num - 1]
                        ? game.beds[num - 1]!.health <= 0
                          ? 'bg-red-800/50 hover:bg-red-700/50 text-red-300'
                          : game.beds[num - 1]!.stage >= 3
                          ? 'bg-amber-800/50 hover:bg-amber-700/50 text-amber-300'
                          : 'bg-green-800/50 hover:bg-green-700/50 text-green-300'
                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Лог событий */}
        <div className="bg-black/30 rounded-xl p-4 border border-green-700/30">
          <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
            📜 Журнал событий
          </h3>
          <div
            ref={logRef}
            className="bg-black/40 rounded-lg p-3 h-64 overflow-y-auto font-mono text-sm space-y-1"
          >
            {game.messages.map((msg, i) => (
              <div
                key={i}
                className={`${
                  msg.includes('⚠️') ? 'text-yellow-400' :
                  msg.includes('🌧️') || msg.includes('☀️') || msg.includes('🪲') ? 'text-cyan-300' :
                  msg.includes('💀') ? 'text-red-400' :
                  msg.includes('🥔') ? 'text-amber-300' :
                  msg.includes('═') ? 'text-green-500' :
                  'text-green-200'
                }`}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
