# WorldPayX 🌍💳

[![Live Demo](https://img.shields.io/badge/Live%20Demo-🚀%20Try%20Now-blue?style=for-the-badge)](https://world-pay-x.vercel.app/)

## Overview

WorldPayX is a crypto-native subscription payment platform that combines secure World ID verification with automatic PYUSD conversions and yield-earning capabilities. Users can manage recurring subscriptions while their prepaid balances generate returns through DeFi protocols.

**🌐 Live Application**: [https://world-pay-x.vercel.app/](https://world-pay-x.vercel.app/)

### 🚀 Key Features

- **World ID Verification**: Secure, privacy-preserving human verification
- **Auto-swap Technology**: Pay with any token, automatically converted to PYUSD via 1inch
- **Yield Generation**: Earn returns on prepaid subscription balances
- **Subscription Management**: Automated recurring payments for digital services
- **Treasury System**: Secure fund management with yield optimization

## 🏗️ Architecture

### Smart Contracts

- **SubscriptionManager**: Core subscription logic and payment execution
- **Treasury**: Secure balance management with yield-earning capabilities
- **PYUSD Integration**: Stablecoin payments for subscription services

### Frontend

- **Next.js 15**: Modern React framework with server-side rendering
- **Web3 Integration**: wagmi + Web3Modal for wallet connectivity
- **World ID SDK**: Privacy-preserving identity verification
- **Tailwind CSS**: Responsive, modern UI design

## 🛠️ Technology Stack

### Blockchain & Smart Contracts
- **Solidity ^0.8.20**: Smart contract development
- **Foundry**: Development framework and testing
- **OpenZeppelin**: Security-audited contract libraries
- **Sepolia Testnet**: Ethereum testing environment

### Frontend & Web3
- **Next.js 15**: React framework
- **React 19**: Latest React features
- **ethers.js v6**: Ethereum interaction
- **wagmi v2**: React hooks for Ethereum
- **Web3Modal v5**: Multi-wallet connection
- **Tailwind CSS v4**: Utility-first styling
- **Radix UI**: Accessible component primitives

### External Integrations
- **World ID**: Worldcoin identity verification
- **1inch API**: Token swapping infrastructure
- **PYUSD**: PayPal's stablecoin for payments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn
- Git
- Foundry (for smart contracts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsshantanu/world-pay-x.git
   cd world-pay-x
   ```

2. **Setup Smart Contracts**
   ```bash
   cd smart-contracts
   forge install
   forge build
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   Create `.env.local` in the frontend directory:
   ```env
   NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_WORLD_ID_APP_ID=your_world_id_app_id
   NEXT_PUBLIC_RPC_URL=your_rpc_endpoint
   ```

### Development

1. **Start Smart Contract Development**
   ```bash
   cd smart-contracts
   forge test          # Run tests
   forge script script/DeployContracts.s.sol --rpc-url sepolia --broadcast --verify
   ```

2. **Start Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

   Access the application at `http://localhost:3000`

## 📝 Smart Contract Deployment

### Deployed Contracts (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| **Treasury** | [`0xDe40b9919B0F3850D7726FE590a890E0Dc86A83e`](https://sepolia.etherscan.io/address/0xDe40b9919B0F3850D7726FE590a890E0Dc86A83e) |
| **SubscriptionManager** | [`0x1f4034b7E39592492B469Fe60f3B4745F0a982B6`](https://sepolia.etherscan.io/address/0x1f4034b7E39592492B469Fe60f3B4745F0a982B6) |

Update the deployment script with your PYUSD token address:

```solidity
// In script/DeployContracts.s.sol
address pyusdAddress = 0xYourPYUSDTokenAddress;
```

### Deployment Commands

```bash
# Deploy to Sepolia
forge script script/DeployContracts.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Interact with contracts
forge script script/InteractSubscription.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

## 🔧 Core Components

### SubscriptionManager Contract

Handles subscription creation, payment execution, and management:

```solidity
struct Subscription {
    address user;
    address merchant;
    uint256 amount;
    uint256 interval;
    uint256 nextPayment;
    bool active;
    bool useTreasury;
}
```

**Key Functions:**
- `createSubscription()`: Create new recurring subscription
- `executePayment()`: Process subscription payments
- `cancelSubscription()`: Cancel active subscriptions

### Treasury Contract

Manages prepaid balances and yield generation:

- **Deposit**: Add funds for subscription payments
- **Withdraw**: Remove unused funds
- **Pay**: Execute payments from treasury balance
- **Yield**: Generate returns on stored balances

### Frontend Dashboard

**Features:**
- Wallet connection with World ID verification
- Subscription management interface
- Balance and yield tracking
- Transaction history
- Multi-token payment support

## 🔒 Security Features

- **OpenZeppelin Libraries**: Industry-standard security patterns
- **Access Controls**: Role-based permissions
- **Reentrancy Guards**: Protection against attacks
- **Pausable Contracts**: Emergency stop mechanisms
- **World ID Integration**: Sybil-resistant user verification

## 🌐 Supported Networks

- **Ethereum Sepolia** (Testnet)
- **Ethereum Mainnet** (Production ready)
- Extensible to other EVM-compatible chains

## 📊 Use Cases

1. **Streaming Subscriptions**: Netflix, Spotify, YouTube Premium
2. **SaaS Payments**: Software subscriptions with crypto
3. **Gaming Subscriptions**: Web3 gaming platforms
4. **Creator Economy**: Patreon-like recurring payments
5. **DeFi Services**: Protocol subscription fees

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity best practices and style guide
- Write comprehensive tests for smart contracts
- Maintain code coverage above 90%
- Use conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Worldcoin** for World ID integration
- **PayPal** for PYUSD stablecoin
- **1inch** for DEX aggregation
- **OpenZeppelin** for secure smart contract libraries
- **Foundry** development framework

## 📞 Support & Community

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community discussions
- **Twitter**: [@WorldPayX](https://twitter.com/WorldPayX)
- **Documentation**: [docs.worldpayx.io](https://docs.worldpayx.io)

---

**Built with ❤️ for the future of subscription payments**

*WorldPayX - Where traditional subscriptions meet the decentralized future*