// Token Object Schema as per backend structure
export interface Token {
  address: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  amount?: number; // Required in portfolio
  value_usd?: number; // Required in portfolio
  change_24h?: number; // For trending view
  market_cap?: string | number;
  volume_24h?: string | number;
  liquidity?: number; // From DexScreener
  createdAt?: string; // From DexScreener
  url?: string; // DexScreener URL
}

// User data structure
export interface User {
  address: string;
  email?: string;
  default_amount: number;
  created_at: string;
}

// Portfolio data structure
export interface Portfolio {
  user_address: string;
  tokens: Token[];
  updated_at: string;
}

// Watchlist data structure
export interface Watchlist {
  user_address: string;
  tokens: Token[];
  updated_at: string;
}

// Activity record
export interface Activity {
  id: string;
  user_address: string;
  token: Token;
  action: 'BUY' | 'SELL';
  amount: number;
  created_at: string;
}

// Navigation types
export type PageType = 'trending' | 'portfolio';
