import { ethers } from "ethers";
import TreasuryABI from "../abis/Treasury.json";
import SubscriptionManagerABI from "../abis/SubscriptionManager.json";
import ERC20ABI from "../abis/ERC20.json";

const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const TREASURY_ADDRESS = "0x750b11718166324b08f1553ee7033EA6e7E3E158";
const SUBSCRIPTION_MANAGER_ADDRESS = "0xF11Fa9F478679a10918a82eC1DB0ffa6f3220778";

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

  const amount = ethers.parseUnits(amountPyusd, 18);

  if (useTreasury) {
    const approveTx = await pyusd.approve(TREASURY_ADDRESS, amount);
    await approveTx.wait();
    console.log("Treasury approved for", amountPyusd, "PYUSD");
  }

  console.log("Creating subscription...");
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
    const depositTx = await treasury.deposit(subId, amount);
    await depositTx.wait();
    console.log("Deposited into Treasury for subId:", subId.toString());
  }

  console.log("Executing payment...");
  const payTx = await subscriptionManager.executePayment(subId);
  await payTx.wait();
  console.log("Payment executed successfully!");

  return subId?.toString();
}