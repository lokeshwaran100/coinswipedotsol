import { Token } from '../types';

// Mock data for trending tokens (placeholder for Jupiter aggregator integration)
const MOCK_TRENDING_TOKENS: Token[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    name: "Solana",
    symbol: "SOL",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    price: 89.42,
    change_24h: 5.2,
    market_cap: "$41.20B",
    volume_24h: "$2.10B"
  },
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USD Coin",
    symbol: "USDC",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    price: 1.00,
    change_24h: 0.1,
    market_cap: "$28.5B",
    volume_24h: "$1.8B"
  },
  {
    address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    name: "Raydium",
    symbol: "RAY",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    price: 10.3041,
    change_24h: -68.8,
    market_cap: "$645M",
    volume_24h: "$45M"
  },
  {
    address: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    name: "Jito Staked SOL",
    symbol: "jitoSOL",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png",
    price: 92.15,
    change_24h: 4.8,
    market_cap: "$2.1B",
    volume_24h: "$85M"
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Bonk",
    symbol: "BONK",
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    price: 0.00002341,
    change_24h: 12.4,
    market_cap: "$1.8B",
    volume_24h: "$120M"
  }
];

// Service class for token operations
export class TokenService {
  // Fetch trending tokens (placeholder for Jupiter aggregator)
  static async getTrendingTokens(): Promise<Token[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Shuffle the array to simulate different trending tokens
    const shuffled = [...MOCK_TRENDING_TOKENS].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  // Get token by address (placeholder for RPC calls)
  static async getTokenByAddress(address: string): Promise<Token | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_TRENDING_TOKENS.find(token => token.address === address) || null;
  }

  // Copy contract address to clipboard
  static async copyContractAddress(address: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(address);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // Format price for display
  static formatPrice(price: number): string {
    if (price < 0.01) {
      return `$${price.toFixed(8)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  }

  // Format percentage change
  static formatPercentageChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  // Format large numbers (market cap, volume)
  static formatLargeNumber(value: string): string {
    return value; // Already formatted in mock data
  }
}
