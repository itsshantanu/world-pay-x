// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Treasury contract to hold prepaid balances for subscriptions
contract Treasury is Ownable {
    IERC20 public immutable pyusd;

    // Mapping: subId => balance
    mapping(uint256 => uint256) public balances;

    // SubscriptionManager address allowed to call pay()
    address public subscriptionManager;

    event Deposited(uint256 indexed subId, uint256 amount);
    event Withdrawn(uint256 indexed subId, uint256 amount);
    event Paid(uint256 indexed subId, address merchant, uint256 amount);
    event SubscriptionManagerUpdated(address subscriptionManager);

    constructor(address _pyusd) Ownable(msg.sender) {
        pyusd = IERC20(_pyusd);
    }

    /// @notice set SubscriptionManager contract
    function setSubscriptionManager(address _manager) external onlyOwner {
        subscriptionManager = _manager;
        emit SubscriptionManagerUpdated(_manager);
    }

    /// @notice deposit funds for a subscription
    function deposit(uint256 subId, uint256 amount) external {
        require(amount > 0, "Zero amount");
        require(pyusd.transferFrom(msg.sender, address(this), amount), "Deposit failed");

        balances[subId] += amount;
        emit Deposited(subId, amount);
    }

    /// @notice withdraw unused funds
    function withdraw(uint256 subId, uint256 amount, address to) external onlyOwner {
        require(balances[subId] >= amount, "Insufficient balance");

        balances[subId] -= amount;
        require(pyusd.transfer(to, amount), "Withdraw failed");

        emit Withdrawn(subId, amount);
    }

    /// @notice pay merchant from subscription balance
    function pay(uint256 subId, address merchant, uint256 amount) external {
        require(msg.sender == subscriptionManager, "Not authorized");
        require(balances[subId] >= amount, "Insufficient balance");

        balances[subId] -= amount;
        require(pyusd.transfer(merchant, amount), "Payment failed");

        emit Paid(subId, merchant, amount);
    }
}
