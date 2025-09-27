// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Treasury
/// @notice Holds funds (PYUSD) for SubscriptionManager and allows controlled disbursements
/// @dev Only approved contracts (like SubscriptionManager) can execute payments
contract Treasury is Ownable {
    /// ERC20 token used for payments (PYUSD)
    IERC20 public immutable pyusd;

    /// Mapping of approved spenders (contracts) who can pull funds
    mapping(address => bool) public approvedSpenders;

    /// Events
    event SpenderApproved(address spender, bool approved);
    event PaymentExecuted(address spender, address to, uint256 amount);

    /// Constructor
    constructor(address _pyusd) Ownable(msg.sender) {
        require(_pyusd != address(0), "Invalid PYUSD address");
        pyusd = IERC20(_pyusd);
    }

    /// Approve or revoke contracts allowed to pull funds
    function setApprovedSpender(address spender, bool approved) external onlyOwner {
        require(spender != address(0), "Invalid spender");
        approvedSpenders[spender] = approved;
        emit SpenderApproved(spender, approved);
    }

    /// Pull funds from treasury
    /// @param to Recipient of funds
    /// @param amount Amount in PYUSD
    function pay(address to, uint256 amount) external {
        require(approvedSpenders[msg.sender], "Not approved spender");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");

        bool success = pyusd.transfer(to, amount);
        require(success, "Payment failed");

        emit PaymentExecuted(msg.sender, to, amount);
    }

    /// Allow owner to withdraw tokens (for admin purposes)
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        bool success = pyusd.transfer(to, amount);
        require(success, "Withdraw failed");
    }

    /// Check treasury balance
    function balance() external view returns (uint256) {
        return pyusd.balanceOf(address(this));
    }
}
