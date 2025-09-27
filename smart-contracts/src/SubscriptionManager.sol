// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WorldVerification.sol";

/// @title SubscriptionManager
/// @notice Self-repaying subscription manager using yield + stablecoin payments
/// @dev Integrates with WorldVerification for "1 human = 1 subscription" enforcement
contract SubscriptionManager {
    /// -----------------------------------------------------------------------
    /// Events
    /// -----------------------------------------------------------------------
    event SubscriptionCreated(
        uint256 indexed subId,
        address indexed user,
        address indexed merchant,
        uint256 amount,
        uint256 interval
    );
    event SubscriptionCancelled(uint256 indexed subId, address indexed user);
    event PaymentExecuted(uint256 indexed subId, uint256 amount, uint256 timestamp);

    /// -----------------------------------------------------------------------
    /// Structs & Storage
    /// -----------------------------------------------------------------------
    struct Subscription {
        address user;         // subscriber
        address merchant;     // merchant receiving payments
        uint256 amount;       // subscription fee (in PYUSD)
        uint256 interval;     // payment frequency (seconds)
        uint256 nextPayment;  // timestamp of next due payment
        bool active;          // active status
    }

    /// Subscriptions
    mapping(uint256 => Subscription) public subscriptions;
    uint256 public nextSubId;

    /// Address of PYUSD token (ERC20 on Ethereum)
    address public immutable pyusd;

    /// Reference to WorldVerification contract
    WorldVerification public worldVerifier;

    /// Treasury address that holds deposits / yield (to be replaced with yield strategy)
    address public treasury;

    /// Owner
    address public owner;

    /// -----------------------------------------------------------------------
    /// Modifiers
    /// -----------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// -----------------------------------------------------------------------
    /// Constructor
    /// -----------------------------------------------------------------------
    constructor(address _pyusd, address _worldVerifier, address _treasury) {
        require(_pyusd != address(0), "Invalid PYUSD");
        require(_worldVerifier != address(0), "Invalid WorldVerifier");
        require(_treasury != address(0), "Invalid Treasury");

        pyusd = _pyusd;
        worldVerifier = WorldVerification(_worldVerifier);
        treasury = _treasury;
        owner = msg.sender;
    }

    /// -----------------------------------------------------------------------
    /// Core Functions
    /// -----------------------------------------------------------------------

    /// @notice Create a new subscription (requires verified World ID proof)
    /// @param merchant Merchant address to receive payments
    /// @param amount Subscription fee (in PYUSD)
    /// @param interval Payment interval (e.g. 30 days = 2592000 seconds)
    /// @param nullifierHash World ID proof nullifier (already verified externally)
    function createSubscription(
        address merchant,
        uint256 amount,
        uint256 interval,
        uint256 nullifierHash
    ) external returns (uint256) {
        require(merchant != address(0), "Invalid merchant");
        require(amount > 0, "Invalid amount");
        require(interval >= 1 days, "Interval too short");

        //Check World ID proof
        require(worldVerifier.isVerified(nullifierHash), "User not verified");

        uint256 subId = nextSubId++;

        subscriptions[subId] = Subscription({
            user: msg.sender,
            merchant: merchant,
            amount: amount,
            interval: interval,
            nextPayment: block.timestamp + interval,
            active: true
        });

        emit SubscriptionCreated(subId, msg.sender, merchant, amount, interval);
        return subId;
    }

    /// @notice Cancel a subscription
    /// @param subId Subscription ID
    function cancelSubscription(uint256 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.active, "Already inactive");
        require(msg.sender == sub.user, "Not subscriber");

        sub.active = false;
        emit SubscriptionCancelled(subId, msg.sender);
    }

    /// @notice Execute payment for a subscription
    /// @dev Should be triggered by backend cron/worker or FE relayer
    /// @param subId Subscription ID
    function executePayment(uint256 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.active, "Inactive subscription");
        require(block.timestamp >= sub.nextPayment, "Not due yet");

        (bool success, ) = sub.merchant.call{value: 0}(""); // placeholder
        require(success, "Payment transfer failed");

        sub.nextPayment = block.timestamp + sub.interval;

        emit PaymentExecuted(subId, sub.amount, block.timestamp);
    }

    /// -----------------------------------------------------------------------
    /// Admin
    /// -----------------------------------------------------------------------
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }

    function setWorldVerifier(address _worldVerifier) external onlyOwner {
        require(_worldVerifier != address(0), "Invalid address");
        worldVerifier = WorldVerification(_worldVerifier);
    }
}
