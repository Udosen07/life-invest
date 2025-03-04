export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
}

export interface HistoricalData {
  date: string;
  close: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: Date;
}
