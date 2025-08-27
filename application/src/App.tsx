import React, { useState, useEffect } from 'react';
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Layout from './components/Layout';
import TrendingPage from './components/TrendingPage';
import PortfolioPage from './components/PortfolioPage';
import { PageType } from './types';
import { SupabaseService } from './services/supabase';
import { WalletService } from './services/wallet';
import Logo from './assets/CoinSwipe_Logo.png';

function App() {
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { accounts, connection } = useSolanaWallet();
  
  const [currentPage, setCurrentPage] = useState<PageType>('trending');
  const [balance, setBalance] = useState<number>(0);
  const [defaultAmount, setDefaultAmount] = useState<number>(0.001);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Initialize user and fetch balance when account changes
  useEffect(() => {
    if (connection && accounts && accounts.length > 0) {
      initializeUser();
      fetchBalance();
    }
  }, [connection, accounts]);

  const initializeUser = async () => {
    if (accounts && accounts.length > 0) {
      try {
        // Initialize user in Supabase if not exists
        await SupabaseService.getUser(accounts[0]);
        
        // Load user's default amount
        const userDefaultAmount = await WalletService.getDefaultAmount(accounts[0]);
        setDefaultAmount(userDefaultAmount);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    }
  };

  const fetchBalance = async () => {
    if (connection && accounts && accounts.length > 0) {
      try {
        setBalanceLoading(true);
        const publicKey = new PublicKey(accounts[0]);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    }
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleDefaultAmountChange = (amount: number) => {
    setDefaultAmount(amount);
  };

  // Login view
  const loginView = (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <img src={Logo} alt="CoinSwipe logo" className="w-20 h-20 rounded-3xl mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold text-white mb-2">CoinSwipe</h1>
          <p className="text-gray-400">
            Discover and trade Solana tokens with simple swipes
          </p>
        </div>

        {/* Login card */}
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">Get Started</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to start exploring trending tokens
          </p>
          
          <button 
            onClick={() => connect()} 
            disabled={connectLoading}
            className="btn-primary w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {connectError && (
            <div className="text-red-400 text-sm mt-2">
              {connectError.message}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="card">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm font-medium">Trending Tokens</p>
            <p className="text-xs text-gray-400">Discover hot tokens</p>
          </div>
          <div className="card">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm font-medium">Instant Trading</p>
            <p className="text-xs text-gray-400">Trade with a swipe</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Main app view
  const appView = (
    <Layout 
      currentPage={currentPage} 
      onPageChange={handlePageChange}
      isConnected={isConnected}
      userAddress={accounts?.[0]}
      onDisconnect={disconnect}
    >
      {/* User info and logout (hidden but accessible) */}
      <div className="hidden">
        <div>Connected to: {connectorName}</div>
        <div>Address: {accounts?.[0]}</div>
        <button onClick={() => disconnect()}>
          {disconnectLoading ? 'Disconnecting...' : 'Logout'}
        </button>
        {disconnectError && <div>{disconnectError.message}</div>}
      </div>

      {/* Page content */}
      {currentPage === 'trending' && (
        <TrendingPage 
          userAddress={accounts?.[0]}
          defaultAmount={defaultAmount}
        />
      )}
      
      {currentPage === 'portfolio' && (
        <PortfolioPage 
          userAddress={accounts?.[0]}
          balance={balance}
          defaultAmount={defaultAmount}
          onDefaultAmountChange={handleDefaultAmountChange}
        />
      )}
    </Layout>
  );

  return isConnected ? appView : loginView;
}

export default App;
