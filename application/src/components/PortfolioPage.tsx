import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, TrendingUp, X } from 'lucide-react';
import { useSolanaWallet, useSignAndSendTransaction } from '@web3auth/modal/react/solana';
import { Token, Portfolio, Watchlist } from '../types';
import { WalletService } from '../services/wallet';
import { TokenService } from '../services/tokens';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PortfolioPageProps {
  userAddress?: string;
  balance: number; // SOL balance in lamports
  defaultAmount: number;
  onDefaultAmountChange: (amount: number) => void;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ 
  userAddress, 
  balance, 
  defaultAmount, 
  onDefaultAmountChange 
}) => {
  const { connection } = useSolanaWallet();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState(defaultAmount.toString());

  useEffect(() => {
    if (userAddress) {
      loadPortfolioData();
    }
  }, [userAddress]);

  const loadPortfolioData = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      const [portfolioData, watchlistData] = await Promise.all([
        WalletService.getPortfolio(userAddress),
        WalletService.getWatchlist(userAddress)
      ]);
      setPortfolio(portfolioData);
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (tokenAddress: string) => {
    if (!userAddress) return;
    
    try {
      await WalletService.removeFromWatchlist(userAddress, tokenAddress);
      // Refresh watchlist
      const updatedWatchlist = await WalletService.getWatchlist(userAddress);
      setWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const handleBuyFromWatchlist = async (token: Token) => {
    if (!userAddress) return;
    
    try {
      await WalletService.executeTrade(
        userAddress, 
        token, 
        defaultAmount, 
        'BUY',
        connection || undefined,
        { signAndSendTransaction }
      );
      // Refresh portfolio data
      await loadPortfolioData();
    } catch (error) {
      console.error('Failed to execute trade:', error);
    }
  };

  const handleAmountUpdate = async () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    if (userAddress) {
      try {
        await WalletService.updateDefaultAmount(userAddress, amount);
        onDefaultAmountChange(amount);
        setEditingAmount(false);
      } catch (error) {
        console.error('Failed to update default amount:', error);
      }
    }
  };

  const portfolioValue = portfolio ? WalletService.calculatePortfolioValue(portfolio) : 0;
  const solBalance = balance / LAMPORTS_PER_SOL;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Portfolio</h1>
        <p className="text-gray-400">Track your holdings and watchlist</p>
      </div>

      {/* Total Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-8 bg-gradient-to-br from-primary-600 to-blue-700"
      >
        <div className="text-center text-white">
          <h2 className="text-lg font-medium mb-2">Total Portfolio Value</h2>
          <p className="text-4xl font-bold mb-2">
            ${(portfolioValue + (solBalance * 89.42)).toFixed(2)}
          </p>
          <p className="text-blue-200">
            {portfolio?.tokens.length || 0 + 1} token{(portfolio?.tokens.length || 0) + 1 !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="card mb-8">
        <h3 className="text-xl font-bold mb-4">Settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Default Buy Amount</p>
            <p className="text-gray-400 text-sm">Amount spent per swipe right</p>
          </div>
          <div className="flex items-center space-x-2">
            {editingAmount ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                  className="w-20 px-2 py-1 bg-secondary border border-gray-600 rounded-lg text-white text-center"
                />
                <span className="text-gray-400">SOL</span>
                <button
                  onClick={handleAmountUpdate}
                  className="p-1 text-green-400 hover:bg-green-400/20 rounded"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditingAmount(false);
                    setNewAmount(defaultAmount.toString());
                  }}
                  className="p-1 text-red-400 hover:bg-red-400/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{defaultAmount} SOL</span>
                <button
                  onClick={() => setEditingAmount(true)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Holdings Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Holdings ({(portfolio?.tokens.length || 0) + 1})</h3>
          
          {/* SOL Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <p className="font-medium">Solana</p>
                  <p className="text-gray-400 text-sm">SOL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${(solBalance * 89.42).toFixed(2)}</p>
                <p className="text-gray-400 text-sm">{WalletService.formatBalance(solBalance)} SOL</p>
              </div>
            </div>
          </motion.div>

          {/* Token Holdings */}
          {portfolio?.tokens.map((token, index) => (
            <motion.div
              key={token.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    <img 
                      src={token.logo} 
                      alt={token.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-sm font-bold">${token.symbol[0]}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-gray-400 text-sm">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${token.value_usd?.toFixed(2) || '0.00'}</p>
                  <p className="text-gray-400 text-sm">
                    {WalletService.formatBalance(token.amount || 0, 6)} {token.symbol}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Avg. Price: ${token.price.toFixed(4)}
                  </p>
                  {token.change_24h !== undefined && (
                    <p className={`text-sm ${
                      token.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {TokenService.formatPercentageChange(token.change_24h)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {(!portfolio?.tokens || portfolio.tokens.length === 0) && (
            <div className="card text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No token holdings yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Swipe right on tokens to start trading
              </p>
            </div>
          )}
        </div>

        {/* Watchlist Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Watchlist ({watchlist?.tokens.length || 0})</h3>
          
          {watchlist?.tokens.map((token, index) => (
            <motion.div
              key={token.address}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    <img 
                      src={token.logo} 
                      alt={token.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-sm font-bold">${token.symbol[0]}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-gray-400 text-sm">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{TokenService.formatPrice(token.price)}</p>
                  {token.change_24h !== undefined && (
                    <p className={`text-sm ${
                      token.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {TokenService.formatPercentageChange(token.change_24h)}
                    </p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleRemoveFromWatchlist(token.address)}
                      className="text-xs px-2 py-1 bg-gray-700 hover:bg-red-600 rounded transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleBuyFromWatchlist(token)}
                      className="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-500 rounded transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {(!watchlist?.tokens || watchlist.tokens.length === 0) && (
            <div className="card text-center py-8">
              <div className="w-12 h-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                ⭐
              </div>
              <p className="text-gray-400">No tokens in watchlist</p>
              <p className="text-gray-500 text-sm mt-2">
                Star tokens while browsing to add them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
