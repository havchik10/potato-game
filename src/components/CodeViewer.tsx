import { useState, useCallback } from 'react';

interface CodeViewerProps {
  code: string;
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'potato_simulator.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          <h2 className="text-lg font-semibold text-green-200">potato_simulator.py</h2>
          <span className="bg-green-700/50 text-green-300 text-xs px-2 py-0.5 rounded-full">
            Python 3
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            {copied ? '✅ Скопировано!' : '📋 Копировать код'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            💾 Скачать .py
          </button>
        </div>
      </div>

      {/* Code Block */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 rounded-t-lg flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400 text-xs ml-2">potato_simulator.py</span>
        </div>
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
          <div className="overflow-auto max-h-[70vh] pt-8">
            <pre className="p-4 text-sm leading-relaxed">
              <code className="text-gray-200 font-mono whitespace-pre">
                {highlightPython(code)}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-black/30 rounded-lg p-6 border border-green-700/30">
        <h3 className="text-lg font-semibold text-green-300 mb-3">📋 Как запустить:</h3>
        <ol className="space-y-2 text-green-200 text-sm">
          <li className="flex items-start gap-2">
            <span className="bg-green-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>Скачайте файл нажав кнопку «💾 Скачать .py» выше</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-green-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>Откройте терминал (cmd / Terminal / bash)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-green-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>Перейдите в папку с файлом: <code className="bg-black/40 px-2 py-0.5 rounded text-green-400">cd ~/Downloads</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-green-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <span>Запустите: <code className="bg-black/40 px-2 py-0.5 rounded text-green-400">python3 potato_simulator.py</code></span>
          </li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            💡 <strong>Примечание:</strong> Игра не требует установки дополнительных библиотек! 
            Используется только стандартная библиотека Python.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Простая подсветка синтаксиса Python
 */
function highlightPython(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    return (
      <div key={lineIdx} className="flex">
        <span className="text-gray-600 select-none w-10 text-right pr-4 shrink-0">
          {lineIdx + 1}
        </span>
        <span className="flex-1">
          {highlightLine(line)}
        </span>
      </div>
    );
  });
}

function highlightLine(line: string): React.ReactNode {
  // Комментарии
  if (line.trimStart().startsWith('#')) {
    return <span className="text-gray-500 italic">{line}</span>;
  }

  // Строки в кавычках (упрощённая обработка)
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Обработка строк
  const stringRegex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')/g;
  let lastIndex = 0;
  let match;

  while ((match = stringRegex.exec(remaining)) !== null) {
    // Текст перед строкой
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>
          {highlightKeywords(remaining.slice(lastIndex, match.index))}
        </span>
      );
    }
    // Сама строка
    parts.push(
      <span key={key++} className="text-amber-300">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  // Оставшийся текст
  if (lastIndex < remaining.length) {
    parts.push(
      <span key={key++}>
        {highlightKeywords(remaining.slice(lastIndex))}
      </span>
    );
  }

  return parts.length > 0 ? parts : highlightKeywords(line);
}

function highlightKeywords(text: string): React.ReactNode {
  const keywords = [
    'class', 'def', 'return', 'if', 'else', 'elif', 'for', 'while',
    'import', 'from', 'as', 'try', 'except', 'finally', 'with',
    'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is',
    'break', 'continue', 'pass', 'raise', 'yield', 'lambda'
  ];

  const builtins = ['print', 'input', 'int', 'str', 'len', 'range', 'sum', 'max', 'min', 'random', 'self'];

  const parts: React.ReactNode[] = [];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      parts.push(<span key={key++}>{highlightBuiltins(before, builtins)}</span>);
    }
    parts.push(
      <span key={key++} className="text-purple-400 font-semibold">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{highlightBuiltins(text.slice(lastIndex), builtins)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

function highlightBuiltins(text: string, builtins: string[]): React.ReactNode {
  const regex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++} className="text-gray-200">{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <span key={key++} className="text-cyan-400">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++} className="text-gray-200">{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}
