import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Star, Copy, ArrowLeft, ArrowRight } from 'lucide-react';
import { Token } from '../types';
import { TokenService } from '../services/tokens';
import { WalletService } from '../services/wallet';

interface TrendingPageProps {
  userAddress?: string;
  defaultAmount: number;
}

const TrendingPage: React.FC<TrendingPageProps> = ({ userAddress, defaultAmount }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starredTokens, setStarredTokens] = useState<Set<string>>(new Set());
  const [isTrading, setIsTrading] = useState(false);

  useEffect(() => {
    loadTrendingTokens();
  }, []);

  const loadTrendingTokens = async () => {
    try {
      setLoading(true);
      const trendingTokens = await TokenService.getTrendingTokens();
      setTokens(trendingTokens);
    } catch (error) {
      console.error('Failed to load trending tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentToken = tokens[currentIndex];
    
    if (direction === 'right' && userAddress) {
      // Buy token
      setIsTrading(true);
      try {
        const success = await WalletService.executeTrade(
          userAddress,
          currentToken,
          defaultAmount,
          'BUY'
        );
        if (success) {
          // Show success feedback
          console.log(`Successfully bought ${defaultAmount} SOL worth of ${currentToken.symbol}`);
        }
      } catch (error) {
        console.error('Trade failed:', error);
      } finally {
        setIsTrading(false);
      }
    }
    
    // Move to next token
    if (currentIndex < tokens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reload tokens when reaching the end
      await loadTrendingTokens();
      setCurrentIndex(0);
    }
  };

  const handleStar = async (token: Token) => {
    if (!userAddress) return;
    
    const isStarred = starredTokens.has(token.address);
    
    try {
      if (isStarred) {
        await WalletService.removeFromWatchlist(userAddress, token.address);
        setStarredTokens(prev => {
          const newSet = new Set(prev);
          newSet.delete(token.address);
          return newSet;
        });
      } else {
        await WalletService.addToWatchlist(userAddress, token);
        setStarredTokens(prev => new Set([...prev, token.address]));
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  const handleCopy = async (address: string) => {
    const success = await TokenService.copyContractAddress(address);
    if (success) {
      // Show toast notification (could implement a toast system)
      console.log('Contract address copied to clipboard');
    }
  };

  const handleManualNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next') {
      handleSwipe('left');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No trending tokens available</p>
          <button 
            onClick={loadTrendingTokens}
            className="btn-primary"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const currentToken = tokens[currentIndex];

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header with manual navigation for desktop */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <button
          onClick={() => handleManualNavigation('prev')}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl bg-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">Trending Tokens</h2>
        <button
          onClick={() => handleManualNavigation('next')}
          className="p-2 rounded-xl bg-secondary hover:bg-gray-700 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile header */}
      <div className="md:hidden text-center mb-6">
        <h2 className="text-xl font-bold">Trending Tokens</h2>
        <p className="text-gray-400 text-sm mt-1">Swipe to decide</p>
      </div>

      {/* Token Card Container */}
      <div className="relative h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentToken.address}
            initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info: PanInfo) => {
              const threshold = 100;
              if (info.offset.x > threshold) {
                handleSwipe('right');
              } else if (info.offset.x < -threshold) {
                handleSwipe('left');
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {/* Main Token Card */}
            <div className="card h-full flex flex-col relative overflow-hidden">
              {/* Star button */}
              <button
                onClick={() => handleStar(currentToken)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
              >
                <Star 
                  className={`w-6 h-6 ${
                    starredTokens.has(currentToken.address) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>

              {/* Token Info */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {/* Token Logo */}
                <div className="w-24 h-24 rounded-full bg-secondary mb-6 flex items-center justify-center overflow-hidden">
                  <img 
                    src={currentToken.logo} 
                    alt={currentToken.name}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-2xl font-bold">${currentToken.symbol[0]}</span>`;
                    }}
                  />
                </div>

                {/* Token Name and Symbol */}
                <h3 className="text-2xl font-bold mb-2">{currentToken.name}</h3>
                <p className="text-xl text-gray-400 mb-6">{currentToken.symbol}</p>

                {/* Price and Change */}
                <div className="mb-6">
                  <p className="text-4xl font-bold mb-2">
                    {TokenService.formatPrice(currentToken.price)}
                  </p>
                  <p className="text-lg">Current Price</p>
                  {currentToken.change_24h !== undefined && (
                    <p className={`text-lg font-medium mt-2 ${
                      currentToken.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {TokenService.formatPercentageChange(currentToken.change_24h)}
                    </p>
                  )}
                </div>

                {/* Market Data */}
                {(currentToken.market_cap || currentToken.volume_24h) && (
                  <div className="grid grid-cols-2 gap-6 mb-6 w-full max-w-xs">
                    {currentToken.market_cap && (
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Market Cap</p>
                        <p className="font-semibold">{TokenService.formatMarketCap(currentToken.market_cap)}</p>
                      </div>
                    )}
                    {currentToken.volume_24h && (
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">24h Volume</p>
                        <p className="font-semibold">{TokenService.formatVolume(currentToken.volume_24h)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Contract Address */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Contract Address</p>
                  <button
                    onClick={() => handleCopy(currentToken.address)}
                    className="flex items-center space-x-2 px-4 py-2 bg-secondary rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-mono text-sm">
                      {`${currentToken.address.slice(0, 8)}...${currentToken.address.slice(-8)}`}
                    </span>
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-t-2xl">
                <div className="flex items-center space-x-2 text-orange-400">
                  <span className="text-2xl">👈</span>
                  <span className="font-medium">Pass</span>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Swipe to decide</p>
                </div>
                
                <div className="flex items-center space-x-2 text-primary-400">
                  <span className="font-medium">Buy</span>
                  <span className="text-2xl">👉</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Loading overlay for trades */}
        {isTrading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 rounded-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-white font-medium">Processing trade...</p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden md:flex space-x-4 mt-6">
        <button
          onClick={() => handleSwipe('left')}
          className="flex-1 btn-secondary"
        >
          Pass
        </button>
        <button
          onClick={() => handleSwipe('right')}
          disabled={!userAddress || isTrading}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTrading ? 'Trading...' : `Buy ${defaultAmount} SOL`}
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex space-x-2">
          {tokens.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
            const actualIndex = Math.max(0, currentIndex - 2) + index;
            return (
              <div
                key={actualIndex}
                className={`w-2 h-2 rounded-full transition-colors ${
                  actualIndex === currentIndex ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
