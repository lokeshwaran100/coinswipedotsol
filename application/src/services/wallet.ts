import { Token, Portfolio, Watchlist, Activity } from '../types';
import { SupabaseService } from './supabase';

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
    const portfolio = await SupabaseService.getPortfolio(userAddress);
    return portfolio || {
      user_address: userAddress,
      tokens: [],
      updated_at: new Date().toISOString()
    };
  }

  // Get user watchlist
  static async getWatchlist(userAddress: string): Promise<Watchlist> {
    const watchlist = await SupabaseService.getWatchlist(userAddress);
    return watchlist || {
      user_address: userAddress,
      tokens: [],
      updated_at: new Date().toISOString()
    };
  }

  // Add token to watchlist
  static async addToWatchlist(userAddress: string, token: Token): Promise<boolean> {
    try {
      const currentWatchlist = await SupabaseService.getWatchlist(userAddress);
      if (!currentWatchlist) return false;

      // Check if token is already in watchlist
      const tokenExists = currentWatchlist.tokens.some(t => t.address === token.address);
      if (tokenExists) return true;

      // Add token to watchlist
      const updatedWatchlist: Watchlist = {
        ...currentWatchlist,
        tokens: [...currentWatchlist.tokens, token],
        updated_at: new Date().toISOString()
      };

      return await SupabaseService.updateWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      return false;
    }
  }

  // Remove token from watchlist
  static async removeFromWatchlist(userAddress: string, tokenAddress: string): Promise<boolean> {
    try {
      const currentWatchlist = await SupabaseService.getWatchlist(userAddress);
      if (!currentWatchlist) return false;

      // Remove token from watchlist
      const updatedWatchlist: Watchlist = {
        ...currentWatchlist,
        tokens: currentWatchlist.tokens.filter(t => t.address !== tokenAddress),
        updated_at: new Date().toISOString()
      };

      return await SupabaseService.updateWatchlist(updatedWatchlist);
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
      
      // For MVP, we'll simulate a successful trade
      // In real implementation, this would execute swap via Jupiter
      
      // Add activity record
      const activity = {
        user_address: userAddress,
        token: token,
        action: action,
        amount: amount,
        created_at: new Date().toISOString()
      };
      
      await SupabaseService.addActivity(activity);
      
      // For BUY action, update portfolio (simplified)
      if (action === 'BUY') {
        const currentPortfolio = await SupabaseService.getPortfolio(userAddress);
        if (currentPortfolio) {
          // Calculate token amount based on price (simplified)
          const tokenAmount = amount / token.price;
          
          // Check if token already exists in portfolio
          const existingTokenIndex = currentPortfolio.tokens.findIndex(t => t.address === token.address);
          
          if (existingTokenIndex >= 0) {
            // Update existing token
            currentPortfolio.tokens[existingTokenIndex].amount = 
              (currentPortfolio.tokens[existingTokenIndex].amount || 0) + tokenAmount;
            currentPortfolio.tokens[existingTokenIndex].value_usd = 
              (currentPortfolio.tokens[existingTokenIndex].value_usd || 0) + (tokenAmount * token.price);
          } else {
            // Add new token to portfolio
            const portfolioToken: Token = {
              ...token,
              amount: tokenAmount,
              value_usd: tokenAmount * token.price
            };
            currentPortfolio.tokens.push(portfolioToken);
          }
          
          await SupabaseService.updatePortfolio(currentPortfolio);
        }
      }
      
      console.log(`${action} ${amount} SOL worth of ${token.symbol} for ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Trade failed:', error);
      return false;
    }
  }

  // Get user's default trade amount
  static async getDefaultAmount(userAddress: string): Promise<number> {
    const user = await SupabaseService.getUser(userAddress);
    return user?.default_amount || 0.01;
  }

  // Update user's default trade amount
  static async updateDefaultAmount(userAddress: string, amount: number): Promise<boolean> {
    try {
      return await SupabaseService.updateUserDefaultAmount(userAddress, amount);
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
