// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Treasury.sol";

contract SubscriptionManager {
    IERC20 public immutable pyusd;
    Treasury public immutable treasury;

    struct Subscription {
        address user;
        address merchant;
        uint256 amount;
        uint256 interval;
        uint256 nextPayment;
        bool active;
        bool useTreasury;
    }

    uint256 public subscriptionCount;
    mapping(uint256 => Subscription) public subscriptions;

    event SubscriptionCreated(uint256 indexed subId, address user, address merchant, uint256 amount, uint256 interval, bool useTreasury);
    event PaymentExecuted(uint256 indexed subId, uint256 amount, uint256 timestamp);
    event SubscriptionCancelled(uint256 indexed subId);

    constructor(address _pyusd, address _treasury) {
        pyusd = IERC20(_pyusd);
        treasury = Treasury(_treasury);
    }

    /// @notice Create subscription
    function createSubscription(
        address merchant,
        uint256 amount,
        uint256 interval,
        bool useTreasury
    ) external returns (uint256) {

        uint256 subId = subscriptionCount++;
        subscriptions[subId] = Subscription({
            user: msg.sender,
            merchant: merchant,
            amount: amount,
            interval: interval,
            nextPayment: block.timestamp + interval,
            active: true,
            useTreasury: useTreasury
        });

        emit SubscriptionCreated(subId, msg.sender, merchant, amount, interval, useTreasury);
        return subId;
    }

    /// @notice Execute payment for a subscription
    function executePayment(uint256 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.active, "Inactive");
        require(block.timestamp >= sub.nextPayment, "Not due yet");

        if (sub.useTreasury) {
            // Pull funds from Treasury balance
            treasury.pay(subId, sub.merchant, sub.amount);
        } else {
            // Direct pull from user wallet
            require(pyusd.transferFrom(sub.user, sub.merchant, sub.amount), "Direct payment failed");
        }

        sub.nextPayment = block.timestamp + sub.interval;
        emit PaymentExecuted(subId, sub.amount, block.timestamp);
    }

    /// @notice Cancel subscription
    function cancelSubscription(uint256 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(msg.sender == sub.user, "Not subscriber");
        require(sub.active, "Already inactive");

        sub.active = false;
        emit SubscriptionCancelled(subId);
    }
}
