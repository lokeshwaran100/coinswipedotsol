import { Token } from '../types';

// DexScreener API response interfaces
interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

// Service class for token operations
export class TokenService {
  // Fetch trending tokens from DexScreener (Raydium pairs on Solana)
  static async getTrendingTokens(): Promise<Token[]> {
    try {
      const response = await fetch("https://api.dexscreener.com/latest/dex/search?q=raydium");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DexScreenerResponse = await response.json();
      
      // Filter for Solana Raydium pairs and map to our Token interface
      const raydiumTokens = data.pairs
        .filter(pair => pair.chainId === "solana" && pair.dexId === "raydium")
        .filter(pair => pair.baseToken && pair.priceUsd) // Ensure we have required data
        .slice(0, 20) // Limit to 20 tokens for better performance
        .map(pair => ({
          address: pair.baseToken.address,
          name: pair.baseToken.name || pair.baseToken.symbol,
          symbol: pair.baseToken.symbol,
          logo: pair.info?.imageUrl || `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${pair.baseToken.address}/logo.png`,
          price: parseFloat(pair.priceUsd),
          change_24h: pair.priceChange?.h24 || 0,
          market_cap: pair.marketCap || 0,
          volume_24h: pair.volume?.h24 || 0,
          liquidity: pair.liquidity?.usd || 0,
          createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt * 1000).toISOString() : undefined,
          url: pair.url,
        }))
        .sort((a, b) => (b.volume_24h as number) - (a.volume_24h as number)); // Sort by volume descending
      
      console.log("Fetched Raydium tokens:", raydiumTokens.length);
      return raydiumTokens;
      
    } catch (error) {
      console.error("Error fetching Raydium tokens from DexScreener:", error);
      
      // Return fallback data in case of API failure
      return this.getFallbackTokens();
    }
  }

  // Fallback tokens in case API fails
  private static getFallbackTokens(): Token[] {
    return [
      {
        address: "So11111111111111111111111111111111111111112",
        name: "Solana",
        symbol: "SOL",
        logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        price: 89.42,
        change_24h: 5.2,
        market_cap: 41200000000,
        volume_24h: 2100000000
      },
      {
        address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        name: "Raydium",
        symbol: "RAY",
        logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
        price: 10.3041,
        change_24h: -68.8,
        market_cap: 645000000,
        volume_24h: 45000000
      }
    ];
  }

  // Get token by address using DexScreener API
  static async getTokenByAddress(address: string): Promise<Token | null> {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DexScreenerResponse = await response.json();
      
      // Find the first Raydium pair for this token
      const pair = data.pairs?.find(pair => 
        pair.chainId === "solana" && 
        pair.dexId === "raydium" && 
        pair.baseToken.address === address
      );
      
      if (!pair) {
        return null;
      }
      
      return {
        address: pair.baseToken.address,
        name: pair.baseToken.name || pair.baseToken.symbol,
        symbol: pair.baseToken.symbol,
        logo: pair.info?.imageUrl || `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${pair.baseToken.address}/logo.png`,
        price: parseFloat(pair.priceUsd),
        change_24h: pair.priceChange?.h24 || 0,
        market_cap: pair.marketCap || 0,
        volume_24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt * 1000).toISOString() : undefined,
        url: pair.url,
      };
      
    } catch (error) {
      console.error(`Error fetching token ${address} from DexScreener:`, error);
      return null;
    }
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
  static formatLargeNumber(value: string | number): string {
    if (typeof value === 'string') {
      return value; // Already formatted
    }
    
    const num = Number(value);
    if (isNaN(num)) return '$0';
    
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  }

  // Format volume specifically
  static formatVolume(value: string | number): string {
    return this.formatLargeNumber(value);
  }

  // Format market cap specifically
  static formatMarketCap(value: string | number): string {
    return this.formatLargeNumber(value);
  }
}
