import { ethers } from "ethers";
import TreasuryABI from "../abis/Treasury.json";
import SubscriptionManagerABI from "../abis/SubscriptionManager.json";
import ERC20ABI from "../abis/ERC20.json";
import { showToast } from "../utils/toast.js";

const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const TREASURY_ADDRESS = "0xDe40b9919B0F3850D7726FE590a890E0Dc86A83e";
const SUBSCRIPTION_MANAGER_ADDRESS = "0x1f4034b7E39592492B469Fe60f3B4745F0a982B6";

export async function createDirectDebitSubscription({
  merchant,
  amountPyusd,
  useTreasury = false
}) {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);
  const subscriptionManager = new ethers.Contract(
    SUBSCRIPTION_MANAGER_ADDRESS,
    SubscriptionManagerABI,
    signer
  );
  const pyusd = new ethers.Contract(PYUSD_ADDRESS, ERC20ABI, signer);

  const amount = ethers.parseUnits(amountPyusd, 6); // PYUSD uses 6 decimals

  // Check user's PYUSD balance first
  const userAddress = await signer.getAddress();
  const userBalance = await pyusd.balanceOf(userAddress);
  showToast(`User PYUSD balance: ${ethers.formatUnits(userBalance, 6)}`, 'info');
  showToast(`Amount needed: ${amountPyusd}`, 'info');
  
  if (userBalance < amount) {
    throw new Error(`Insufficient PYUSD balance. You have ${ethers.formatUnits(userBalance, 6)} PYUSD but need ${amountPyusd} PYUSD`);
  }

  // Set up Treasury to authorize SubscriptionManager if using Treasury
  if (useTreasury) {
    try {
      const setManagerTx = await treasury.setSubscriptionManager(SUBSCRIPTION_MANAGER_ADDRESS);
      await setManagerTx.wait();
      showToast("Treasury authorized SubscriptionManager", 'success');
    } catch (error) {
      // If it fails, it might already be set or we don't have permissions
      showToast(`Treasury authorization step skipped: ${error.message}`, 'warning');
    }
  }

  // Approve the correct contract based on useTreasury
  if (useTreasury) {
    const approveTx = await pyusd.approve(TREASURY_ADDRESS, amount);
    await approveTx.wait();
    showToast(`Treasury approved for ${amountPyusd} PYUSD`, 'success');
  } else {
    // Approve a larger amount to handle multiple attempts
    const approveAmount = amount * 10n; // Approve 10x the needed amount
    const approveTx = await pyusd.approve(SUBSCRIPTION_MANAGER_ADDRESS, approveAmount);
    await approveTx.wait();
    showToast(`SubscriptionManager approved for ${ethers.formatUnits(approveAmount, 6)} PYUSD`, 'success');
  }

  showToast("Creating subscription...", 'info');
  
  // Validate merchant address
  if (!ethers.isAddress(merchant)) {
    throw new Error(`Invalid merchant address: ${merchant}`);
  }
  showToast(`Merchant address is valid: ${merchant}`, 'success');
  
  const tx = await subscriptionManager.createSubscription(
    merchant,
    amount,
    0, // interval = 0 = direct debit
    useTreasury
  );
  const receipt = await tx.wait();

  const event = receipt.logs
    .map(log => {
      try { return subscriptionManager.interface.parseLog(log); } catch { return null; }
    })
    .find(e => e && e.name === "SubscriptionCreated");

  const subId = event?.args?.subId;
  showToast(`Subscription created with ID: ${subId?.toString()}`, 'success');

  if (useTreasury) {
    showToast(`Depositing into Treasury for subId: ${subId?.toString()}`, 'info');
    
    // Check Treasury balance before deposit
    const balanceBefore = await treasury.balances(subId);
    showToast(`Treasury balance before deposit: ${balanceBefore.toString()}`, 'info');
    
    const depositTx = await treasury.deposit(subId, amount);
    await depositTx.wait();
    
    // Check Treasury balance after deposit
    const balanceAfter = await treasury.balances(subId);
    showToast(`Treasury balance after deposit: ${balanceAfter.toString()}`, 'info');
    showToast(`Successfully deposited ${amountPyusd} PYUSD into Treasury`, 'success');
  }

  showToast("Executing payment...", 'info');
  
  // Add debugging before executing payment
  showToast(`About to execute payment for subId: ${subId?.toString()}`, 'info');
  showToast(`useTreasury: ${useTreasury}`, 'info');
  
  try {
    const payTx = await subscriptionManager.executePayment(subId);
    await payTx.wait();
    showToast("Payment executed successfully!", 'success');
  } catch (error) {
    showToast(`Payment execution failed: ${error.message}`, 'error');
    
    // Try to get the subscription details to debug
    try {
      const subscription = await subscriptionManager.subscriptions(subId);
      const details = {
        user: subscription.user,
        merchant: subscription.merchant,
        amount: ethers.formatUnits(subscription.amount, 6),
        active: subscription.active,
        useTreasury: subscription.useTreasury
      };
      showToast(`Subscription details: ${JSON.stringify(details)}`, 'info');
      
      // Additional debugging: check if merchant address is a contract
      const merchantCode = await provider.getCode(subscription.merchant);
      showToast(`Merchant is contract: ${merchantCode !== "0x"}`, 'info');
      
    } catch (subError) {
      showToast(`Failed to get subscription details: ${subError.message}`, 'error');
    }
    
    throw error;
  }

  return subId?.toString();
}