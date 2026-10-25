import { useState, useCallback } from 'react';
import { pythonCode } from './data/pythonCode';
import CodeViewer from './components/CodeViewer';
import GameSimulator from './components/GameSimulator';

function App() {
  const [activeTab, setActiveTab] = useState<'code' | 'game'>('code');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🥔</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Симулятор выращивания картофеля
                </h1>
                <p className="text-green-300 text-sm">Python консольная игра</p>
              </div>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-black/30 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-green-300 hover:text-white hover:bg-white/10'
                }`}
              >
                📄 Python код
              </button>
              <button
                onClick={() => setActiveTab('game')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'game'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-green-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🎮 Играть в браузере
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'code' ? <CodeViewer code={pythonCode} /> : <GameSimulator />}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 border-t border-white/10 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-green-400 text-sm">
          <p>🌱 Запустите Python-код в терминале для полноценного консольного опыта!</p>
          <p className="mt-1 text-green-600">python3 potato_simulator.py</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
