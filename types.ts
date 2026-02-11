export enum AppView {
  DASHBOARD = 'DASHBOARD',
  NEWS = 'NEWS',
  DEFI = 'DEFI',
  ALERTS = 'ALERTS',
  SETTINGS = 'SETTINGS',
  ARCHITECTURE = 'ARCHITECTURE'
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timestamp: string;
}

export interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
}

export interface DefiPosition {
  protocol: string;
  type: 'Liquidity Pool' | 'Staking' | 'Lending';
  asset: string;
  apy: number;
  value: number;
}

export type NotificationType = 'in-app' | 'email' | 'sms' | 'phone' | 'telegram' | 'slack';

export interface Alert {
  id: string;
  token: string;
  condition: 'above' | 'below';
  targetPrice: number;
  active: boolean;
  notifications: NotificationType[];
  createdAt: string;
  updatedAt: string;
}
