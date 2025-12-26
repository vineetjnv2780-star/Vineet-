import React, { useState, useEffect, useRef } from 'react';
import { History, Sparkles, Delete, Calculator as CalcIcon, X, Download, Share } from 'lucide-react';
import { Keypad } from './components/Keypad';
import { KeyType, HistoryItem, CalculatorMode } from './types';
import { solveWithAI } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState<string>('0');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState<CalculatorMode>(CalculatorMode.Standard);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const displayRef = useRef<HTMLDivElement>(null);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Auto-scroll display to end when input changes
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [input]);

  const handleKeyPress = (value: string, type: KeyType) => {
    if (value === 'clear') {
      setInput('0');
      setResult('');
      return;
    }

    if (value === '=') {
      calculateResult();
      return;
    }

    if (value === 'negate') {
      setInput(prev => {
        if (prev === '0') return prev;
        return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
      });
      return;
    }

    if (value === '%') {
        try {
            const val = parseFloat(input) / 100;
            setInput(val.toString());
        } catch {
            setInput('Error');
        }
        return;
    }

    setInput(prev => {
      if (prev === '0' && type === 'number' && value !== '.') return value;
      if (prev === 'Error') return value;
      return prev + value;
    });
  };

  const calculateResult = () => {
    try {
      // Basic safe evaluation for standard input
      // Replace symbols for JS evaluation
      let evalString = input
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // Simple factorial implementation check if needed, but for simplicity relying on basic math
      // Note: A true parser would be better, but 'new Function' is standard for these coding tasks if local.
      // eslint-disable-next-line no-new-func
      const calcFunc = new Function('return ' + evalString);
      const res = calcFunc();
      
      const formattedResult = Number.isInteger(res) ? res.toString() : res.toFixed(6).replace(/\.?0+$/, '');
      
      setResult(formattedResult);
      addToHistory(input, formattedResult, false);
      setInput(formattedResult); // Chain calculations
    } catch (e) {
      setResult('Error');
    }
  };

  const handleAiSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setInput(aiPrompt); // Show prompt in display area conceptually
    
    try {
      const answer = await solveWithAI(aiPrompt);
      setResult(answer);
      addToHistory(aiPrompt, answer, true);
      setInput(answer); // Allow further operations on the result
      setAiPrompt('');
    } catch (error) {
      setResult("AI Error");
    } finally {
      setAiLoading(false);
      setMode(CalculatorMode.Standard); // Switch back to see result
    }
  };

  const addToHistory = (expression: string, result: string, isAi: boolean) => {
    setHistory(prev => [
      { id: Date.now().toString(), expression, result, timestamp: Date.now(), isAi },
      ...prev
    ].slice(0, 50));
  };

  const clearHistory = () => setHistory([]);

  const exportHistory = () => {
    if (history.length === 0) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Expression,Result,Type\n"
      + history.map(row => `${new Date(row.timestamp).toISOString()},"${row.expression}","${row.result}",${row.isAi ? 'AI' : 'Standard'}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lumina_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <CalcIcon size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:block">Lumina</span>
        </div>
        
        <div className="flex gap-2 bg-gray-900/50 p-1 rounded-full backdrop-blur-md border border-gray-800">
            <button 
                onClick={() => setMode(CalculatorMode.Standard)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${mode === CalculatorMode.Standard ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                Std
            </button>
            <button 
                onClick={() => setMode(mode === CalculatorMode.Scientific ? CalculatorMode.Standard : CalculatorMode.Scientific)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${mode === CalculatorMode.Scientific ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                Sci
            </button>
            <button 
                onClick={() => setMode(CalculatorMode.AI)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${mode === CalculatorMode.AI ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                <Sparkles size={12} />
                AI
            </button>
        </div>

        <div className="flex items-center gap-1">
            {installPrompt && (
                <button 
                    onClick={handleInstall}
                    className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-900/30 rounded-full animate-pulse"
                    title="Install App"
                >
                    <Download size={20} />
                </button>
            )}
            <button 
                onClick={() => setShowHistory(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="History"
            >
                <History size={22} />
            </button>
        </div>
      </header>

      {/* Main Display Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-end pb-6 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        
        {/* Output Display */}
        <div className="flex-1 flex flex-col justify-end items-end mb-6 space-y-2 min-h-[120px]">
          {/* Previous Expression / Result Label */}
          <div className="text-gray-500 text-sm sm:text-base font-medium h-6">
            {result ? 'Result' : ''}
          </div>
          
          {/* Main Input/Result */}
          <div 
            ref={displayRef}
            className="w-full text-right overflow-x-auto no-scrollbar whitespace-nowrap text-5xl sm:text-7xl font-light tracking-tight text-white"
          >
            {mode === CalculatorMode.AI ? (aiLoading ? 'Thinking...' : (result || input)) : input}
          </div>
        </div>

        {/* Input Area based on Mode */}
        {mode === CalculatorMode.AI ? (
           <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-4 shadow-xl">
             <form onSubmit={handleAiSubmit} className="flex flex-col gap-3">
               <textarea
                 value={aiPrompt}
                 onChange={(e) => setAiPrompt(e.target.value)}
                 placeholder="Ask anything (e.g., '150 USD in JPY' or 'Volume of a sphere with radius 5')..."
                 className="w-full bg-transparent text-lg text-white placeholder-gray-500 resize-none focus:outline-none h-24 p-2"
               />
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium px-2">Powered by Gemini</span>
                  <button 
                    type="submit"
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="bg-white text-gray-950 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {aiLoading ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Solve
                  </button>
               </div>
             </form>
           </div>
        ) : (
           <Keypad 
                onPress={handleKeyPress} 
                isScientific={mode === CalculatorMode.Scientific} 
           />
        )}

      </main>

      {/* History Drawer (Overlay) */}
      {showHistory && (
        <div className="absolute inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHistory(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-sm bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-800 transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <History size={18} className="text-indigo-400"/>
                    History
                </h2>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={clearHistory}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Clear History"
                    >
                        <Delete size={18} />
                    </button>
                    <button 
                        onClick={() => setShowHistory(false)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                        <History size={32} className="opacity-20" />
                        <p className="text-sm">No calculations yet</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => {
                                setInput(item.result);
                                setMode(CalculatorMode.Standard);
                                setShowHistory(false);
                            }}
                            className="group p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-700"
                        >
                            <div className="text-gray-400 text-sm mb-1 flex justify-between">
                                <span className="truncate max-w-[85%]">{item.expression}</span>
                                {item.isAi && <Sparkles size={12} className="text-purple-400 mt-1" />}
                            </div>
                            <div className="text-xl font-medium text-white text-right group-hover:text-indigo-300 transition-colors">
                                = {item.result}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Export Footer */}
            {history.length > 0 && (
                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={exportHistory}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all font-medium"
                    >
                        <Share size={18} />
                        Export to CSV
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}