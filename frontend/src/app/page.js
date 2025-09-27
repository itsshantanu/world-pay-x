'use client';

import Link from 'next/link';
import SimpleWalletConnect from '../components/SimpleWalletConnect';
import { useWallet } from '../contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isConnected, address } = useWallet();
  const router = useRouter();

  // Redirect when wallet connects
  useEffect(() => {
    if (isConnected) {
      window.location.href = '/dashboard';
    }
  }, [isConnected]);

  // Shorten wallet address for display
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-blue-400 mb-2">WorldPayX</h1>
          <p className="text-gray-400 text-sm">Crypto-native subscription payments with yield</p>
        </div>

        {/* Features */}
        <div className="space-y-6 mb-8">
          {/* Secure World ID Verification */}
          <div className="flex items-start text-left">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Secure Verification</h3>
              <p className="text-gray-400 text-sm">Prove you're human, privately</p>
            </div>
          </div>

          {/* Auto-swap to PYUSD */}
          <div className="flex items-start text-left">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Auto-swap to PYUSD</h3>
              <p className="text-gray-400 text-sm">Pay with any token via 1inch</p>
            </div>
          </div>

          {/* Earn Yield */}
          <div className="flex items-start text-left">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Earn Yield</h3>
              <p className="text-gray-400 text-sm">Your balance grows while you wait</p>
            </div>
          </div>
        </div>

        {/* Wallet connect section */}
        <div className="w-full">
          {!isConnected ? (
            <SimpleWalletConnect />
          ) : (
            <div className="mt-2 text-gray-300 text-sm">
              Connected: <span className="font-mono text-white">{shortAddress}</span>
            </div>
          )}
        </div>
          <div className='text-white' >
          </div>
        {/* Dashboard Link */}
        {isConnected && (
          <div className="mt-2">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm underline">
              {/* Go to Dashboard → */}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
