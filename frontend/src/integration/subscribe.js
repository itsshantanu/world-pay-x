import { ethers } from "ethers";
import TreasuryABI from "../abis/Treasury.json";
import SubscriptionManagerABI from "../abis/SubscriptionManager.json";
import ERC20ABI from "../abis/ERC20.json";

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
  console.log("User PYUSD balance:", ethers.formatUnits(userBalance, 6));
  console.log("Amount needed:", amountPyusd);
  
  if (userBalance < amount) {
    throw new Error(`Insufficient PYUSD balance. You have ${ethers.formatUnits(userBalance, 6)} PYUSD but need ${amountPyusd} PYUSD`);
  }

  // Set up Treasury to authorize SubscriptionManager if using Treasury
  if (useTreasury) {
    try {
      const setManagerTx = await treasury.setSubscriptionManager(SUBSCRIPTION_MANAGER_ADDRESS);
      await setManagerTx.wait();
      console.log("Treasury authorized SubscriptionManager");
    } catch (error) {
      // If it fails, it might already be set or we don't have permissions
      console.log("Treasury authorization step skipped (might already be set):", error.message);
    }
  }

  // Approve the correct contract based on useTreasury
  if (useTreasury) {
    const approveTx = await pyusd.approve(TREASURY_ADDRESS, amount);
    await approveTx.wait();
    console.log("Treasury approved for", amountPyusd, "PYUSD");
  } else {
    // Approve a larger amount to handle multiple attempts
    const approveAmount = amount * 10n; // Approve 10x the needed amount
    const approveTx = await pyusd.approve(SUBSCRIPTION_MANAGER_ADDRESS, approveAmount);
    await approveTx.wait();
    console.log("SubscriptionManager approved for", ethers.formatUnits(approveAmount, 6), "PYUSD");
  }

  console.log("Creating subscription...");
  
  // Validate merchant address
  if (!ethers.isAddress(merchant)) {
    throw new Error(`Invalid merchant address: ${merchant}`);
  }
  console.log("Merchant address is valid:", merchant);
  
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
  console.log("Subscription created with ID:", subId?.toString());

  if (useTreasury) {
    console.log("Depositing into Treasury for subId:", subId?.toString());
    
    // Check Treasury balance before deposit
    const balanceBefore = await treasury.balances(subId);
    console.log("Treasury balance for subId before deposit:", balanceBefore.toString());
    
    const depositTx = await treasury.deposit(subId, amount);
    await depositTx.wait();
    
    // Check Treasury balance after deposit
    const balanceAfter = await treasury.balances(subId);
    console.log("Treasury balance for subId after deposit:", balanceAfter.toString());
    console.log("Successfully deposited", amountPyusd, "PYUSD into Treasury");
  }

  console.log("Executing payment...");
  
  // Add debugging before executing payment
  console.log("About to execute payment for subId:", subId?.toString());
  console.log("useTreasury:", useTreasury);
  
  try {
    const payTx = await subscriptionManager.executePayment(subId);
    await payTx.wait();
    console.log("Payment executed successfully!");
  } catch (error) {
    console.error("Payment execution failed:", error);
    
    // Try to get the subscription details to debug
    try {
      const subscription = await subscriptionManager.subscriptions(subId);
      console.log("Subscription details:", {
        user: subscription.user,
        merchant: subscription.merchant,
        amount: ethers.formatUnits(subscription.amount, 6),
        active: subscription.active,
        useTreasury: subscription.useTreasury
      });
      
      // Additional debugging: check if merchant address is a contract
      const merchantCode = await provider.getCode(subscription.merchant);
      console.log("Merchant is contract:", merchantCode !== "0x");
      
    } catch (subError) {
      console.error("Failed to get subscription details:", subError);
    }
    
    throw error;
  }

  return subId?.toString();
}