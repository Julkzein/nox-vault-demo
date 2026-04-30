# iExec Nox Vaults 🏦🔒

Welcome to the **Nox Vaults Demo**! This repository demonstrates how to build a fully confidential ERC-4626 Vault using the [iExec Nox protocol](https://docs.iex.ec). 

Unlike standard ERC-4626 vaults where balances, total value locked (TVL), and trade flows are entirely public, this vault utilizes Trusted Execution Environments (TEEs) to ensure complete confidentiality.

## Overview

This repository is split into two main components:
- **`contracts/`**: The smart contract infrastructure, featuring `ConfidentialERC4626.sol`. This contract leverages the Nox Coprocessor to perform encrypted math (addition, multiplication, division) securely inside an enclave, preventing any public leakage of user deposits or shares.
- **`front/`**: A beautiful Next.js application that allows users to interact with the confidential vault. It seamlessly encrypts user inputs locally on the client-side using the `@iexec-nox/nox-client-sdk` before the data is ever sent to the blockchain.

## Getting Started

### 1. Smart Contracts
Navigate to the `contracts` directory, install dependencies, and deploy to Arbitrum Sepolia:
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat ignition deploy ignition/modules/ConfidentialVaultFactory.ts --network arbitrumSepolia
```
*(Make sure to set your `PRIVATE_KEY` and `ARBITRUM_SEPOLIA_RPC_URL` in `contracts/.env`)*

### 2. Frontend
Once your contract is deployed, copy the Factory address and paste it into `front/src/config/contracts.ts`. Then, launch the application:
```bash
cd front
npm install
npm run dev
```
Open `http://localhost:3000` to start depositing into your confidential vault!

## Branches
- **`demo`**: Contains placeholder `// TODO` sections in the smart contract and frontend encryption logic. Perfect for live coding presentations or learning!
- **`completed`**: The full, working version of the application.

Built with ❤️ using iExec Nox.
