import React from 'react';
import { KeyConfig, KeyType } from '../types';

interface KeypadProps {
  onPress: (value: string, type: KeyType) => void;
  isScientific: boolean;
}

const STANDARD_KEYS: KeyConfig[] = [
  { label: 'C', value: 'clear', type: 'action', highlight: true },
  { label: '±', value: 'negate', type: 'action', highlight: true },
  { label: '%', value: '%', type: 'action', highlight: true },
  { label: '÷', value: '/', type: 'operator', highlight: true },
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '×', value: '*', type: 'operator', highlight: true },
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '-', value: '-', type: 'operator', highlight: true },
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '+', value: '+', type: 'operator', highlight: true },
  { label: '0', value: '0', type: 'number', span: 2 },
  { label: '.', value: '.', type: 'number' },
  { label: '=', value: '=', type: 'action', highlight: true },
];

const SCIENTIFIC_KEYS: KeyConfig[] = [
  { label: 'sin', value: 'sin(', type: 'scientific' },
  { label: 'cos', value: 'cos(', type: 'scientific' },
  { label: 'tan', value: 'tan(', type: 'scientific' },
  { label: 'ln', value: 'log(', type: 'scientific' },
  { label: '(', value: '(', type: 'scientific' },
  { label: ')', value: ')', type: 'scientific' },
  { label: 'π', value: 'pi', type: 'scientific' },
  { label: '√', value: 'sqrt(', type: 'scientific' },
  { label: '^', value: '^', type: 'scientific' },
  { label: '!', value: '!', type: 'scientific' },
];

export const Keypad: React.FC<KeypadProps> = ({ onPress, isScientific }) => {
  
  const getButtonStyle = (key: KeyConfig) => {
    let base = "h-16 sm:h-20 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center select-none shadow-sm ";
    
    if (key.type === 'operator' || key.value === '=') {
        return base + "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20";
    }
    if (key.type === 'action') {
        return base + "bg-gray-700 text-indigo-300 hover:bg-gray-600";
    }
    if (key.type === 'scientific') {
        return "h-12 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95 flex items-center justify-center select-none";
    }
    // Numbers
    return base + "bg-gray-800 text-gray-100 hover:bg-gray-750";
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        {/* Scientific Row (if active) - displayed above or integrated */}
        {isScientific && (
             <div className="grid grid-cols-5 gap-2 mb-2">
                {SCIENTIFIC_KEYS.map((key) => (
                    <button
                        key={key.value}
                        onClick={() => onPress(key.value, key.type)}
                        className={getButtonStyle(key)}
                    >
                        {key.label}
                    </button>
                ))}
             </div>
        )}

      {/* Standard Grid */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {STANDARD_KEYS.map((key) => (
          <button
            key={key.label}
            onClick={() => onPress(key.value, key.type)}
            className={`${getButtonStyle(key)} ${key.span ? `col-span-${key.span}` : ''}`}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
};