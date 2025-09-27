// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Treasury.sol";
import "../src/SubscriptionManager.sol";

contract DeployContracts is Script {
    function run() external {
        // -----------------------------
        // Replace with your Sepolia PYUSD token address
        // -----------------------------
        address pyusdAddress = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9;

        vm.startBroadcast();

        // Deploy Treasury
        Treasury treasury = new Treasury(pyusdAddress);
        console.log("Treasury deployed at:", address(treasury));

        // Deploy SubscriptionManager
        SubscriptionManager subscriptionManager = new SubscriptionManager(
            pyusdAddress,
            address(treasury)
        );
        console.log("SubscriptionManager deployed at:", address(subscriptionManager));

        // Register SubscriptionManager in Treasury
        treasury.setSubscriptionManager(address(subscriptionManager));
        console.log("SubscriptionManager registered as manager in Treasury");

        vm.stopBroadcast();
    }
}
