import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Briefcase, Wallet, LogOut, Copy, User } from 'lucide-react';
import { PageType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isConnected: boolean;
  userAddress?: string;
  onDisconnect: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, isConnected, userAddress, onDisconnect }) => {
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const copyAddress = async () => {
    if (userAddress) {
      try {
        await navigator.clipboard.writeText(userAddress);
        // TODO: Add toast notification
        console.log('Address copied to clipboard');
        setShowWalletMenu(false);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <div className="min-h-screen bg-background text-gray-200">
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-secondary border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-700 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-bold text-white">CoinSwipe</h1>
            </div>

            {/* Navigation Links */}
            {isConnected && (
              <div className="flex items-center space-x-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => onPageChange('trending')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                      currentPage === 'trending'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Trending</span>
                  </button>
                  <button
                    onClick={() => onPageChange('portfolio')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                      currentPage === 'portfolio'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>Portfolio</span>
                  </button>
                </div>

                {/* Wallet Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="font-mono text-sm">
                      {userAddress ? formatAddress(userAddress) : 'Wallet'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-card border border-gray-600 rounded-xl shadow-lg z-50"
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Connected</p>
                            <p className="text-gray-400 text-sm">Solana Wallet</p>
                          </div>
                        </div>

                        {/* Full Address */}
                        <div className="mb-4">
                          <p className="text-gray-400 text-xs mb-2">Wallet Address</p>
                          <div className="flex items-center space-x-2 p-2 bg-secondary rounded-lg">
                            <span className="font-mono text-sm text-white flex-1 break-all">
                              {userAddress}
                            </span>
                            <button
                              onClick={copyAddress}
                              className="p-1 hover:bg-gray-600 rounded transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <button
                            onClick={onDisconnect}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-secondary border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <h1 className="text-lg font-bold text-white">CoinSwipe</h1>
          </div>

          {/* Mobile Wallet Menu */}
          {isConnected && userAddress && (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span className="font-mono text-xs">
                  {formatAddress(userAddress)}
                </span>
              </button>

              {/* Mobile Dropdown Menu */}
              {showWalletMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-card border border-gray-600 rounded-xl shadow-lg z-50"
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Connected</p>
                        <p className="text-gray-400 text-sm">Solana Wallet</p>
                      </div>
                    </div>

                    {/* Full Address */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">Wallet Address</p>
                      <div className="flex items-center space-x-2 p-2 bg-secondary rounded-lg">
                        <span className="font-mono text-xs text-white flex-1 break-all">
                          {userAddress}
                        </span>
                        <button
                          onClick={copyAddress}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={onDisconnect}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isConnected && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-gray-700">
          <div className="flex">
            <button
              onClick={() => onPageChange('trending')}
              className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
                currentPage === 'trending'
                  ? 'text-primary-500'
                  : 'text-gray-400'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <TrendingUp className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Trending</span>
              </motion.div>
            </button>
            <button
              onClick={() => onPageChange('portfolio')}
              className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors ${
                currentPage === 'portfolio'
                  ? 'text-primary-500'
                  : 'text-gray-400'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <Briefcase className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Portfolio</span>
              </motion.div>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
