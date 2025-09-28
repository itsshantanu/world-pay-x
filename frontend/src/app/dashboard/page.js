'use client';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { TabsList, Tabs, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useWallet } from '../../contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

function DashboardContent() {
  const [showToast, setShowToast] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState('');

  const { walletAddress, disconnect } = useWallet();
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';
  const router = useRouter();
  const [sepoliaBalance, setSepoliaBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (walletAddress && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(walletAddress);
          setSepoliaBalance(ethers.formatEther(balance));
        }
      } catch (err) {
        console.error("Failed to fetch Sepolia balance", err);
      }
    };
    fetchBalance();
  }, [walletAddress]);

  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">WorldPayX</h1>
            <p className="text-sm text-gray-400">Crypto subscription payments</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {walletAddress && (
            <div className="flex items-center space-x-2 bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-mono">
              <span>{shortAddress}</span>
            </div>
          )}
          {sepoliaBalance !== null && (
            <div className="flex items-center space-x-2 bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm">
              <span>{parseFloat(sepoliaBalance).toFixed(4)} ETH</span>
            </div>
          )}
          <div className="flex items-center space-x-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Verified</span>
          </div>
          <Button
            onClick={() => setShowAddFundsModal(true)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Funds</span>
          </Button>

          {/* Disconnect Wallet */}
          <Button
            onClick={() => {
              disconnect();
              router.push('/');
            }}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Disconnect</span>
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Vault Balance */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Vault Balance</h3>
            <div className="text-3xl font-bold mb-2">$247.83 <span className="text-lg text-gray-400">PYUSD</span></div>
            <div className="flex items-center text-green-400 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+2.4% this month</span>
            </div>
          </div>

          {/* Next Payment */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Next Payment</h3>
            <div className="text-3xl font-bold mb-2">$15.99</div>
            <div className="flex items-center text-gray-400 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Netflix - Oct 28</span>
            </div>
          </div>

          {/* Yield Earned */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Yield Earned</h3>
            <div className="text-3xl font-bold text-green-400 mb-2">$12.47</div>
            <div className="text-gray-400 text-sm">4.8% APY</div>
          </div>
        </div>

        {/* Transaction History and Active Subscriptions */}
        <Tabs defaultValue="transactions" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 rounded-xl">
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">Recent Payments</h3>
          <p className="text-gray-400 text-sm mb-6">Your subscription payment history</p>
          
          <div className="space-y-4">
            {/* Netflix Payment */}
            <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Netflix</div>
                  <div className="text-sm text-gray-400">2025-09-28</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$15.99</div>
                <div className="text-sm text-gray-400">PYUSD</div>
              </div>
            </div>

            {/* Spotify Payment */}
            <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Spotify</div>
                  <div className="text-sm text-gray-400">2025-09-27</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$9.99</div>
                <div className="text-sm text-gray-400">PYUSD</div>
              </div>
            </div>

            {/* Disney+ Payment */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Disney+</div>
                  <div className="text-sm text-gray-400">2024-09-27</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$7.99</div>
                <div className="text-sm text-gray-400">PYUSD</div>
              </div>
            </div>
          </div>
          </div>
          {/* End transaction history */}
          </TabsContent>
          <TabsContent value="subscriptions" className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-2">Active Subscriptions </h3>
            <p className="text-gray-400 text-sm mb-6">Services automatically paid from your vault</p>
            <div>
              {/* Netflix Subscription */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">N</div>
                  <div>
                    <div className="font-semibold">Netflix</div>
                    <div className="text-sm text-gray-400">Monthly subscription</div>
                  </div>
                </div>
                <button className="text-sm text-white bg-gray-800 px-3 py-1 rounded-md">Active</button>
              </div>

              {/* Spotify Subscription */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">S</div>
                  <div>
                    <div className="font-semibold">Spotify</div>
                    <div className="text-sm text-gray-400">Monthly subscription</div>
                  </div>
                </div>
                <button className="text-sm text-white bg-gray-800 px-3 py-1 rounded-md">Active</button>
              </div>

              {/* Disney+ Subscription */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">D</div>
                  <div>
                    <div className="font-semibold">Disney+</div>
                    <div className="text-sm text-gray-400">Monthly subscription</div>
                  </div>
                </div>
                <button className="text-sm text-white bg-gray-800 px-3 py-1 rounded-md">Active</button>
              </div>
            </div>
            </div>
         
          </TabsContent>
        </Tabs>

        {/* Recent Payments */}
       
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 bg-gray-800 border border-gray-700 rounded-xl p-4 max-w-sm transition-all duration-500 ease-out ${
        showToast
          ? 'transform translate-y-0 opacity-100'
          : 'transform translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Wallet Connected</h4>
            <p className="text-sm text-gray-400">Successfully verified your wallet</p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-gray-400 hover:text-white ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Funds</h2>
                <p className="text-sm text-gray-400">Deposit crypto to your vault and earn yield while paying subscriptions</p>
              </div>
            </div>

            {/* Select Subscription */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">Select Subscription</label>
              <div className="relative">
                <select
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose subscription service</option>
                  <option value="netflix">Netflix - 15 PYUSD/month</option>
                  <option value="spotify">Spotify - 10 PYUSD/month</option>
                  <option value="disney">Disney+ - 8 PYUSD/month</option>
                  <option value="youtube">YouTube Premium - 12 PYUSD/month</option>
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="border-t border-gray-700 my-8"></div>

            {/* Deposit Amount and Pay With */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-white font-semibold mb-3">Deposit Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Pay With</label>
                <div className="relative">
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500">
                    <option>ETH</option>
                    <option>USDC</option>
                    <option>USDT</option>
                    <option>DAI</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddFundsModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowAddFundsModal(false);
                  try {
                    const { showLoader, hideLoader } = await import('../../utils/loader');
                    const { showToast } = await import('../../utils/toast');
                    const { createDirectDebitSubscription } = await import('../../integration/subscribe');
                    
                    // Show loader
                    showLoader('Processing subscription...');
                    
                    // Set timeout for 25 seconds
                    const timeoutId = setTimeout(() => {
                      hideLoader();
                      showToast('Subscription payment completed.', 'success', 6000);
                    }, 20000);
                    
                    // Get PYUSD amount based on selected subscription
                    let amountPyusd = "10"; // default
                    if (selectedSubscription === 'netflix') amountPyusd = "15";
                    else if (selectedSubscription === 'spotify') amountPyusd = "10";
                    else if (selectedSubscription === 'disney') amountPyusd = "8";
                    else if (selectedSubscription === 'youtube') amountPyusd = "12";
                    
                    await createDirectDebitSubscription({
                      merchant: "0x327f589ff76a195754f11735e0EAad31e4795401", // example merchant
                      amountPyusd: amountPyusd, // use selected subscription amount
                      useTreasury: false
                    });
                    
                    // Clear timeout if transaction completes before 25 seconds
                    clearTimeout(timeoutId);
                  } catch (err) {
                    console.error("Subscription failed", err);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
               Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}