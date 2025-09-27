// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/WorldVerification.sol";
import "../src/Treasury.sol";
import "../src/SubscriptionManager.sol";

contract DeployContracts is Script {
    function run() external {
        // -----------------------------
        // Replace this with your Sepolia PYUSD address
        // -----------------------------
        address pyusdAddress = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9; 

        // -----------------------------
        // Start broadcasting transactions
        // -----------------------------
        vm.startBroadcast();

        // Deploy WorldVerification contract
        WorldVerification worldVerifier = new WorldVerification(address(0)); // pass 0 for test/mock
        console.log("WorldVerification deployed at:", address(worldVerifier));

        // Deploy Treasury contract
        Treasury treasury = new Treasury(pyusdAddress);
        console.log("Treasury deployed at:", address(treasury));

        // Deploy SubscriptionManager contract
        SubscriptionManager subscriptionManager = new SubscriptionManager(
            pyusdAddress,
            address(worldVerifier),
            address(treasury)
        );
        console.log("SubscriptionManager deployed at:", address(subscriptionManager));

        // Approve SubscriptionManager as spender in Treasury
        treasury.setApprovedSpender(address(subscriptionManager), true);
        console.log("SubscriptionManager approved as spender in Treasury");

        vm.stopBroadcast();
    }
}
