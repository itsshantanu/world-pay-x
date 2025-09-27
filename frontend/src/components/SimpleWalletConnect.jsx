'use client'

import { Button } from './ui/button'
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function SimpleWalletConnect() {
  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-600">
      <ConnectButton />
    </div>
  );
}