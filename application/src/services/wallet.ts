import { Token, Portfolio, Watchlist, Activity } from '../types';
import { SupabaseService } from './supabase';
import { Connection, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

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

// Jupiter API configuration
const JUPITER_QUOTE_API_URL = 'https://lite-api.jup.ag/swap/v1/quote';
const JUPITER_SWAP_API_URL = 'https://lite-api.jup.ag/swap/v1/swap';

// SOL mint address
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Jupiter API interfaces
interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null | any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

// Service class for wallet and portfolio operations
export class WalletService {
  // Get quote from Jupiter API
  private static async getJupiterQuote(
    inputMint: string,
    outputMint: string,
    amount: number, // in lamports for SOL
    slippageBps: number = 50 // 0.5% slippage
  ): Promise<JupiterQuoteResponse | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        restrictIntermediateTokens: 'true'
      });

      const response = await fetch(`${JUPITER_QUOTE_API_URL}?${params}`);
      if (!response.ok) {
        throw new Error(`Jupiter quote API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get Jupiter quote:', error);
      return null;
    }
  }

  // Build swap transaction using Jupiter API
  private static async buildJupiterSwapTransaction(
    quoteResponse: JupiterQuoteResponse,
    userPublicKey: string
  ): Promise<JupiterSwapResponse | null> {
    try {
      const response = await fetch(JUPITER_SWAP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          useSharedAccounts: true,
          feeAccount: undefined,
          trackingAccount: undefined,
          computeUnitPriceMicroLamports: undefined,
          prioritizationFeeLamports: 'auto'
        }),
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to build Jupiter swap transaction:', error);
      return null;
    }
  }

  // Execute Jupiter swap transaction
  private static async executeJupiterSwap(
    swapTransaction: string,
    wallet: { signAndSendTransaction: (transaction: VersionedTransaction) => Promise<string> }
  ): Promise<string | null> {
    try {
      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign and send the transaction
      const txid = await wallet.signAndSendTransaction(transaction);

      return txid;
    } catch (error) {
      console.error('Failed to execute Jupiter swap:', error);
      return null;
    }
  }

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

  // Execute trade using Jupiter API for swaps
  static async executeTrade(
    userAddress: string, 
    token: Token, 
    amount: number, 
    action: 'BUY' | 'SELL',
    connection?: Connection,
    wallet?: { signAndSendTransaction: (transaction: VersionedTransaction) => Promise<string> }
  ): Promise<boolean> {
    try {
      let actualTokenAmount = 0;
      let actualSolAmount = amount;
      let transactionId: string | null = null;

      // For BUY action, use Jupiter API to swap SOL to token
      if (action === 'BUY' && connection && wallet) {
        console.log(`Executing Jupiter swap: ${amount} SOL -> ${token.symbol}`);
        
        // Convert SOL amount to lamports
        const solAmountLamports = Math.floor(amount * LAMPORTS_PER_SOL);
        
        // Get quote from Jupiter
        const quote = await this.getJupiterQuote(
          SOL_MINT, // input: SOL
          token.address, // output: target token
          solAmountLamports,
          100 // 1% slippage
        );

        if (!quote) {
          console.error('Failed to get quote from Jupiter');
          return false;
        }

        console.log('Jupiter quote received:', {
          inputAmount: quote.inAmount,
          outputAmount: quote.outAmount,
          priceImpact: quote.priceImpactPct
        });

        // Build swap transaction
        const swapResponse = await this.buildJupiterSwapTransaction(quote, userAddress);
        if (!swapResponse) {
          console.error('Failed to build swap transaction');
          return false;
        }

        // Execute the swap
        transactionId = await this.executeJupiterSwap(
          swapResponse.swapTransaction,
          wallet
        );

        if (!transactionId) {
          console.error('Failed to execute swap transaction');
          return false;
        }

        console.log('Swap executed successfully:', transactionId);
        
        // Calculate actual token amount received from the quote
        actualTokenAmount = parseInt(quote.outAmount) / Math.pow(10, 6); // Assuming 6 decimals for most tokens
        
      } else if (action === 'SELL') {
        // For SELL action, simulate for now (can be implemented later)
        console.log('SELL action not yet implemented with Jupiter - using simulation');
        actualTokenAmount = amount / token.price;
      } else {
        // Fallback simulation for BUY when connection/wallet not provided
        console.log('Using simulated trade (missing connection or wallet)');
        actualTokenAmount = amount / token.price;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Add activity record
      const activity = {
        user_address: userAddress,
        token: token,
        action: action,
        amount: actualSolAmount,
        created_at: new Date().toISOString(),
        transaction_id: transactionId || undefined
      };
      
      await SupabaseService.addActivity(activity);
      
      // For BUY action, update portfolio
      if (action === 'BUY') {
        const currentPortfolio = await SupabaseService.getPortfolio(userAddress);
        if (currentPortfolio) {
          // Check if token already exists in portfolio
          const existingTokenIndex = currentPortfolio.tokens.findIndex(t => t.address === token.address);
          
          if (existingTokenIndex >= 0) {
            // Update existing token
            currentPortfolio.tokens[existingTokenIndex].amount = 
              (currentPortfolio.tokens[existingTokenIndex].amount || 0) + actualTokenAmount;
            currentPortfolio.tokens[existingTokenIndex].value_usd = 
              (currentPortfolio.tokens[existingTokenIndex].value_usd || 0) + (actualTokenAmount * token.price);
          } else {
            // Add new token to portfolio
            const portfolioToken: Token = {
              ...token,
              amount: actualTokenAmount,
              value_usd: actualTokenAmount * token.price
            };
            currentPortfolio.tokens.push(portfolioToken);
          }
          
          await SupabaseService.updatePortfolio(currentPortfolio);
        }
      }
      
      console.log(`${action} completed: ${actualSolAmount} SOL -> ${actualTokenAmount} ${token.symbol} for ${userAddress}`);
      if (transactionId) {
        console.log(`Transaction ID: ${transactionId}`);
      }
      
      return true;
    } catch (error) {
      console.error('Trade failed:', error);
      return false;
    }
  }

  // Get user's default trade amount
  static async getDefaultAmount(userAddress: string): Promise<number> {
    const user = await SupabaseService.getUser(userAddress);
    return user?.default_amount || 0.001;
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
