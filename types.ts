
export type KeyType = 'number' | 'operator' | 'action' | 'scientific';

export interface KeyConfig {
  label: string;
  value: string;
  type: KeyType;
  highlight?: boolean;
  span?: number;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isAi: boolean;
}

export enum CalculatorMode {
  Standard = 'standard',
  Scientific = 'scientific',
  AI = 'ai'
}
