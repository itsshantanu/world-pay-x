'use client'

import { Button } from './ui/button'
import { Wallet } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers';

export default function SimpleWalletConnect() {
  const { walletAddress, disconnect, isConnected, isConnecting, connectWallet } = useWallet();
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  const subscriptionManagerAddr = "YOUR_SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS"; // replace with real address

  // Approve PYUSD when wallet connects
  const switchToSepolia = async () => {
    try {
      if (!window.ethereum) return;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }] // Sepolia testnet chainId
      });
    } catch (switchError) {
      // If Sepolia is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              rpcUrls: ['https://sepolia.infura.io/v3/'], // Infura or your RPC endpoint
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network', addError);
        }
      } else {
        console.error('Failed to switch network', switchError);
      }
    }
  };

  const handleApprove = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pyusdContract = new ethers.Contract(
        "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer
      );
      const tx = await pyusdContract.approve(
        subscriptionManagerAddr,
        ethers.parseUnits("100", 18) // adjust decimals if PYUSD != 18
      );
      await tx.wait();
      console.log("Approved 100 PYUSD for subscription manager");
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-600">
      {!walletAddress ? (
        <Button
          onClick={async () => {
            await connectWallet();
            await switchToSepolia();
            await handleApprove();
          }}
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