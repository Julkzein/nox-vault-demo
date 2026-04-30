# iExec Nox Vaults - Live Demo Presentation Plan

This guide provides a step-by-step script and live coding guide for a 20-25 minute presentation on building confidential Vaults using iExec Nox.

## Pre-requisites & Setup

1. Make sure you have the `nox-vault-demo` repository open in your IDE (e.g. Cursor or VSCode).
2. Ensure you are on the `demo` branch: `git checkout demo`.
3. Open a terminal in the `contracts` directory.
4. Open a second terminal in the `front` directory.
5. Have your Arbitrum Sepolia `PRIVATE_KEY` ready in `contracts/.env`.

---

## 🕒 0:00 - 0:05 | Introduction to Confidential Vaults
**Goal:** Explain the "Why" and "What" of cVault.

**Talking Points:**
- Welcome everyone! Today we're building a Confidential Vault.
- Standard ERC-4626 vaults leak information: an observer can see exactly how much you deposited and your exact share of the pool.
- Even worse, they can infer the exact total value locked (TVL) and trade flows.
- We will use **iExec Nox** to build a vault where user balances, total assets, and total supply are entirely encrypted using Fully Homomorphic Encryption (FHE).
- We'll build the missing parts of the smart contract and frontend together!

---

## 🕒 0:05 - 0:12 | Live Coding: Smart Contract
**Goal:** Implement the FHE math in `ConfidentialERC4626.sol`.

**Talking Points:**
- Let's look at `contracts/contracts/vault/ConfidentialERC4626.sol`.
- We need to implement `_convertToShares` and `_convertToAssets`. 
- In normal Solidity, we'd do `shares = assets * totalSupply / totalAssets`. But here, those values are encrypted! We must use `Nox.mul` and `Nox.div`.

### Step 1: `_convertToShares`
Navigate to `_convertToShares` (around line 210) and replace the `// TODO` with:

```solidity
    function _convertToShares(euint256 assets, euint256 totalAssetsBefore, euint256 totalSupplyBefore)
        internal
        virtual
        returns (euint256 shares)
    {
        euint256 numerator = Nox.mul(assets, Nox.add(totalSupplyBefore, Nox.toEuint256(10 ** _decimalsOffset())));
        euint256 denominator = Nox.add(totalAssetsBefore, Nox.toEuint256(1));
        shares = Nox.div(numerator, denominator);
        Nox.allowThis(shares);
    }
```
**Explanation:** 
- We use `Nox.add`, `Nox.mul`, and `Nox.div` to perform math on ciphertexts directly on the blockchain. 
- `Nox.allowThis(shares)` ensures the vault contract itself has ACL (Access Control List) permissions to manipulate this new encrypted value later.

### Step 2: `_convertToAssets`
Navigate to `_convertToAssets` (around line 225) and replace the `// TODO` with:

```solidity
    function _convertToAssets(euint256 shares, euint256 totalAssetsBefore, euint256 totalSupplyBefore)
        internal
        virtual
        returns (euint256 assets)
    {
        euint256 numerator = Nox.mul(shares, Nox.add(totalAssetsBefore, Nox.toEuint256(1)));
        euint256 denominator = Nox.add(totalSupplyBefore, Nox.toEuint256(10 ** _decimalsOffset()));
        assets = Nox.div(numerator, denominator);
        Nox.allowThis(assets);
    }
```

---

## 🕒 0:12 - 0:15 | Deploying the Smart Contract
**Goal:** Compile and deploy the newly written contract.

**Terminal 1 (Contracts):**
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat ignition deploy ignition/modules/ConfidentialVaultFactory.ts --network arbitrumSepolia
```

**Talking Points:**
- Hardhat compiles our contract with the Nox FHE operations.
- We deploy it to Arbitrum Sepolia. The Nox protocol is integrated natively there, meaning FHE operations are incredibly fast compared to traditional L1 FHE rollups.

---

## 🕒 0:15 - 0:20 | Live Coding: The Frontend (TypeScript)
**Goal:** Encrypt the user's input safely on the client side.

**Talking Points:**
- Now that the smart contract is ready, the frontend needs to send encrypted inputs. We can't just send plain numbers, or it defeats the whole purpose!
- We'll use the `@iexec-nox/nox-client-sdk` to encrypt the user's deposit amount locally before it ever touches the network.

### Step 3: Deposit Encryption
Navigate to `front/src/components/RequestModals.tsx` (around line 262) and replace the `// TODO` with:

```typescript
        run: async () => {
          // Encrypts `amountWei` as euint256 bound to the vault. Does NOT emit a tx.
          const { handle, handleProof } = await handleClient.encryptInput(
            amountWei,
            "uint256",
            vaultAddress,
          );
          // Stash on window for the next step — avoids re-encrypting.
          (window as unknown as { __noxEnc?: { handle: Hex; proof: Hex } }).__noxEnc = {
            handle: handle as Hex,
            proof: handleProof as Hex,
          };
          return undefined;
        },
```
**Explanation:** 
- `handleClient.encryptInput` encrypts the value directly in the browser. 
- It creates an `externalEuint256` (the `handle`) and an `inputProof` verifying it was encrypted properly.
- We bind this encryption specifically to `vaultAddress`, so no other contract can decrypt it!

### Step 4: Redeem Encryption
Scroll down in `RequestModals.tsx` (around line 493) to the redeem flow and replace the `// TODO` with:

```typescript
        run: async () => {
          const { handle, handleProof } = await handleClient.encryptInput(
            amountWei,
            "uint256",
            vaultAddress,
          );
          (window as unknown as { __noxEncR?: { handle: Hex; proof: Hex } }).__noxEncR = {
            handle: handle as Hex,
            proof: handleProof as Hex,
          };
          return undefined;
        },
```

---

## 🕒 0:20 - 0:25 | Local Frontend & Interaction
**Goal:** Start the frontend and do a live transaction!

**Terminal 2 (Frontend):**
```bash
cd front
npm install
npm run dev
```

**Talking Points:**
- Open `http://localhost:3000`.
- I'm going to connect my wallet.
- Look at the UI: we can see the Vault but the TVL and balances are shielded!
- Let's do a deposit. We enter `10 cUSDC`.
- MetaMask pops up: Notice how the data payload doesn't have the number `10` anywhere. It's fully encrypted ciphertext.
- Once mined, the balance updates securely. We just built a confidential ERC-4626 vault!

## 🎉 Wrap Up
- The FHE math ran directly on the blockchain.
- The input was encrypted client-side.
- State is fully shielded from observers.
- Thank you! Check out the `nox-dev-kit` to start building!
