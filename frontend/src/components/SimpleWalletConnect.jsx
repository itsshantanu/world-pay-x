'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Loader2, Globe, Wallet, CheckCircle, ExternalLink } from 'lucide-react'

export default function SimpleWalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [worldIdProof, setWorldIdProof] = useState(null)

  // Simple wallet connection using window.ethereum
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet!')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Simulate World ID verification
  const handleWorldIDVerification = async () => {
    setIsVerifying(true)
    
    try {
      // Simulate World ID verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock World ID proof
      const mockProof = {
        merkle_root: "0x1234567890abcdef",
        nullifier_hash: "0xabcdef1234567890",
        proof: "0x9876543210fedcba",
        verification_level: "orb"
      }
      
      setWorldIdProof(mockProof)
      setIsVerified(true)
    } catch (error) {
      console.error('World ID verification failed:', error)
      alert('World ID verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleConnect = async () => {
    if (!isConnected) {
      await connectWallet()
    } else if (!isVerified) {
      await handleWorldIDVerification()
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsVerified(false)
    setWalletAddress('')
    setWorldIdProof(null)
  }

  const getButtonText = () => {
    if (isConnecting) {
      return "Connecting Wallet..."
    } else if (!isConnected) {
      return "Connect Wallet"
    } else if (isVerifying) {
      return "Verifying with World ID..."
    } else if (!isVerified) {
      return "Verify with World ID"
    } else {
      return "Connected & Verified"
    }
  }

  const getButtonIcon = () => {
    if (isConnecting || isVerifying) {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    } else if (!isConnected) {
      return <Wallet className="w-4 h-4 mr-2" />
    } else if (!isVerified) {
      return <Globe className="w-4 h-4 mr-2" />
    } else {
      return <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-600">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Connect with World ID
        </h2>
        <p className="text-gray-300 text-sm">
          Secure, privacy-preserving identity verification
        </p>
      </div>

      {isConnected && (
        <div className="text-center">
          <p className="text-sm text-gray-400">Connected Wallet:</p>
          <p className="font-mono text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>
        </div>
      )}

      {isVerified && worldIdProof && (
        <div className="text-center bg-green-900/30 p-3 rounded-lg border border-green-600/30">
          <p className="text-sm text-green-400 font-medium">
            ✅ World ID Verified
          </p>
          <p className="text-xs text-green-300 mt-1">
            Verification Level: {worldIdProof.verification_level}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={handleConnect}
          disabled={isConnecting || isVerifying || (isConnected && isVerified)}
          className={`px-6 py-2 ${
            isVerified 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>

        {isConnected && (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="px-4 py-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Disconnect
          </Button>
        )}
      </div>

      {/* Connection Status Indicator */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span className={isConnected ? 'text-green-400' : 'text-gray-400'}>
            Wallet {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isVerified ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span className={isVerified ? 'text-green-400' : 'text-gray-400'}>
            World ID {isVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      {/* Info about Web3 wallet requirement */}
      {!isConnected && (
        <div className="text-center text-xs text-gray-500 mt-2">
          <p>Requires a Web3 wallet like MetaMask</p>
          <a 
            href="https://metamask.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            Install MetaMask <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}
    </div>
  )
}