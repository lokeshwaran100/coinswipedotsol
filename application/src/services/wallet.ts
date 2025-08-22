import { Token, Portfolio, Watchlist, Activity } from '../types';

// Mock portfolio data
const MOCK_PORTFOLIO: Portfolio = {
  user_address: "",
  tokens: [
    {
      address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      name: "Raydium",
      symbol: "RAY",
      logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      price: 10.3041,
      amount: 0.003115,
      value_usd: 0.01,
      change_24h: -68.8
    }
  ],
  updated_at: new Date().toISOString()
};

// Mock watchlist data
const MOCK_WATCHLIST: Watchlist = {
  user_address: "",
  tokens: [
    {
      address: "So11111111111111111111111111111111111111112",
      name: "Solana",
      symbol: "SOL",
      logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      price: 89.42,
      change_24h: 5.2
    }
  ],
  updated_at: new Date().toISOString()
};

// Service class for wallet and portfolio operations
export class WalletService {
  // Get user portfolio
  static async getPortfolio(userAddress: string): Promise<Portfolio> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      ...MOCK_PORTFOLIO,
      user_address: userAddress
    };
  }

  // Get user watchlist
  static async getWatchlist(userAddress: string): Promise<Watchlist> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      ...MOCK_WATCHLIST,
      user_address: userAddress
    };
  }

  // Add token to watchlist
  static async addToWatchlist(userAddress: string, token: Token): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In real implementation, this would update Supabase
      console.log(`Added ${token.symbol} to watchlist for ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      return false;
    }
  }

  // Remove token from watchlist
  static async removeFromWatchlist(userAddress: string, tokenAddress: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In real implementation, this would update Supabase
      console.log(`Removed token ${tokenAddress} from watchlist for ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      return false;
    }
  }

  // Execute trade (placeholder for Jupiter swap)
  static async executeTrade(
    userAddress: string, 
    token: Token, 
    amount: number, 
    action: 'BUY' | 'SELL'
  ): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would:
      // 1. Execute swap via Jupiter
      // 2. Update portfolio in Supabase
      // 3. Add activity record
      
      console.log(`${action} ${amount} SOL worth of ${token.symbol} for ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Trade failed:', error);
      return false;
    }
  }

  // Get user's default trade amount
  static async getDefaultAmount(userAddress: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // In real implementation, fetch from Supabase users table
    return 0.01; // Default 0.01 SOL
  }

  // Update user's default trade amount
  static async updateDefaultAmount(userAddress: string, amount: number): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In real implementation, update Supabase users table
      console.log(`Updated default amount to ${amount} SOL for ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Failed to update default amount:', error);
      return false;
    }
  }

  // Calculate total portfolio value
  static calculatePortfolioValue(portfolio: Portfolio): number {
    return portfolio.tokens.reduce((total, token) => {
      return total + (token.value_usd || 0);
    }, 0);
  }

  // Format balance for display
  static formatBalance(balance: number, decimals: number = 2): string {
    if (balance < 0.01) {
      return balance.toFixed(8);
    }
    return balance.toFixed(decimals);
  }
}
