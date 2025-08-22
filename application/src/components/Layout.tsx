import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Briefcase } from 'lucide-react';
import { PageType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isConnected: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, isConnected }) => {
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
              <div className="flex space-x-6">
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
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-secondary border-b border-gray-700 p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <h1 className="text-lg font-bold text-white">CoinSwipe</h1>
          </div>
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
