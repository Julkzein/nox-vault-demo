import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

// `VAULT_OWNER_PRIVATE_KEY` is read from `process.env`, populated by `dotenv-cli` from `.env`
// when running scripts via `npm run …`. Other infrastructure secrets (RPC URL, Etherscan API
// key) live in the Hardhat keystore, accessed through `configVariable`.
let privateKey = process.env.VAULT_OWNER_PRIVATE_KEY ?? "";
if (privateKey && !privateKey.startsWith("0x")) {
  privateKey = `0x${privateKey}`;
}

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  // Etherscan v2 unified API key — same key works for all supported chains
  // (mainnet, Arbitrum, Arbitrum Sepolia, Base, …). Get one at https://etherscan.io/myapikey.
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY ?? "",
    },
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    // EDR-simulated fork of Arbitrum Sepolia. chainId is preserved (421614),
    // so `Nox.noxComputeContract()` resolves to the live NoxCompute deployment.
    arbitrumSepoliaFork: {
      type: "edr-simulated",
      chainType: "generic",
      chainId: 421614,
      forking: { url: process.env.ARBITRUM_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc" },
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "op",
      chainId: 421614,
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: privateKey ? [privateKey as `0x${string}`] : [],
    },
  },
});
