'use client'

import { Button } from './ui/button'
import { Wallet } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export default function SimpleWalletConnect() {
  const { walletAddress, disconnect, isConnected, isConnecting, connectWallet } = useWallet();
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-600">
      {!walletAddress ? (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </Button>
      ) : (
        <div className="flex items-center space-x-4">
          <span className="font-mono text-gray-200">{shortAddress}</span>
          <Button
            onClick={disconnect}
            variant="destructive"
            className="py-2 px-4"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}