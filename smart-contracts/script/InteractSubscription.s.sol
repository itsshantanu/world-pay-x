// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Treasury.sol";
import "../src/SubscriptionManager.sol";

contract InteractSubscription is Script {
    function run() external {
        // -----------------------------
        // Replace with your deployed contract addresses
        // -----------------------------
        address pyusdAddr = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9; // PYUSD Sepolia
        address treasuryAddr = 0x07A838422Abaaa39b8D4a42cd04B82c1E6639c69;
        address subscriptionManagerAddr = 0x7b0490e800df9dE4c00e16104bFb3d22C081d237;

        Treasury treasury = Treasury(treasuryAddr);
        SubscriptionManager subscriptionManager = SubscriptionManager(subscriptionManagerAddr);
        IERC20 pyusd = IERC20(pyusdAddr);

        vm.startBroadcast();

        // -----------------------------
        // 0️⃣ Check initial Treasury balance
        // -----------------------------
        uint256 initialTreasuryBalance = pyusd.balanceOf(treasuryAddr);
        console.log("Initial Treasury PYUSD balance:", initialTreasuryBalance);

        // -----------------------------
        // 1️⃣ Define subscription parameters
        // -----------------------------
        address merchant = 0x327f589ff76a195754f11735e0EAad31e4795401; 
        uint256 amount = 10;  
        uint256 interval = 0;       
        bool useTreasury = true;     // Testing without treasury     

        // -----------------------------
        // 2️⃣ Approve the correct contract to spend PYUSD
        // -----------------------------
        if (useTreasury) {
            pyusd.approve(treasuryAddr, amount * 2); // Approve for 2 payments
            console.log("Approved Treasury to spend PYUSD:", amount * 2);
        } else {
            pyusd.approve(subscriptionManagerAddr, amount * 2); // Approve for 2 payments
            console.log("Approved SubscriptionManager to spend PYUSD:", amount * 2);
        }

        // -----------------------------
        // 3️⃣ Create subscription
        // -----------------------------
        uint256 subId = subscriptionManager.createSubscription(
            merchant,
            amount,
            interval,
            useTreasury
        );
        console.log("Subscription created with ID:", subId);

        // -----------------------------
        // 4️⃣ Deposit into Treasury
        // -----------------------------
        if (useTreasury) {
            treasury.deposit(subId, amount * 2); // Deposit enough for 2 payments
            console.log("Deposited", amount * 2, "PYUSD into Treasury for subId:", subId);
            
            // Check Treasury balance after deposit
            uint256 balanceAfterDeposit = pyusd.balanceOf(treasuryAddr);
            console.log("Treasury PYUSD balance after deposit:", balanceAfterDeposit);
        }

        // -----------------------------
        // 5️⃣ Warp time so payment is due
        // -----------------------------
        vm.warp(block.timestamp + interval + 1);

        // -----------------------------
        // 6️⃣ Execute payment
        // -----------------------------
        subscriptionManager.executePayment(subId);
        console.log("Payment executed for subscription ID:", subId);
        
        // Check Treasury balance after first payment
        uint256 balanceAfterFirstPayment = pyusd.balanceOf(treasuryAddr);
        console.log("Treasury PYUSD balance after first payment:", balanceAfterFirstPayment);

        // -----------------------------
        // 7️⃣ Execute second payment (warp time again)
        // -----------------------------
        vm.warp(block.timestamp + interval + 1);
        subscriptionManager.executePayment(subId);
        console.log("Second payment executed for subscription ID:", subId);
        
        // Check Treasury balance after second payment
        uint256 balanceAfterSecondPayment = pyusd.balanceOf(treasuryAddr);
        console.log("Treasury PYUSD balance after second payment:", balanceAfterSecondPayment);

        // -----------------------------
        // 8️⃣ Cancel subscription
        // -----------------------------
        subscriptionManager.cancelSubscription(subId);
        console.log("Subscription cancelled for ID:", subId);

        vm.stopBroadcast();
    }
}
