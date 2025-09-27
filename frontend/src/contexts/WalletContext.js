'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [worldIdProof, setWorldIdProof] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if wallet was previously connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            
            // Check if verification data exists in localStorage
            const savedProof = localStorage.getItem('worldIdProof');
            const savedVerified = localStorage.getItem('isVerified');
            
            if (savedProof && savedVerified === 'true') {
              setWorldIdProof(JSON.parse(savedProof));
              setIsVerified(true);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnect();
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          // Reset verification when account changes
          setIsVerified(false);
          setWorldIdProof(null);
          localStorage.removeItem('worldIdProof');
          localStorage.removeItem('isVerified');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet!');
      return false;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const verifyWallet = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate wallet verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock wallet proof
      const mockProof = {
        merkle_root: "0x1234567890abcdef",
        nullifier_hash: "0xabcdef1234567890",
        proof: "0x9876543210fedcba",
        verification_level: "wallet"
      };
      
      setWorldIdProof(mockProof);
      setIsVerified(true);
      
      // Save verification data to localStorage
      localStorage.setItem('worldIdProof', JSON.stringify(mockProof));
      localStorage.setItem('isVerified', 'true');
      
      return true;
    } catch (error) {
      console.error('Wallet verification failed:', error);
      alert('Wallet verification failed. Please try again.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setIsVerified(false);
    setWalletAddress('');
    setWorldIdProof(null);
    localStorage.removeItem('worldIdProof');
    localStorage.removeItem('isVerified');
  };

  const value = {
    isConnected,
    isVerified,
    walletAddress,
    worldIdProof,
    isConnecting,
    isVerifying,
    connectWallet,
    verifyWallet,
    disconnect
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}