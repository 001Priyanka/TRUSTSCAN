
export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  previousHigh: number;
  volume: number;
  avgVolume: number;
}

export interface BreakoutSignal {
  id: string;
  stockName: string;
  price: number;
  strength: number;
  timestamp: number;
  txHash: string; // Simulated blockchain transaction hash
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  RECORDING = 'RECORDING',
  COMPLETED = 'COMPLETED'
}
