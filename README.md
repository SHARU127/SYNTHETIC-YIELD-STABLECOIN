# Synthetic Yield Stablecoin (USDb)

A delta-neutral synthetic dollar protocol built on Solidity/Ethereum — inspired by designs like Ethena's USDe. Users deposit stETH collateral, the protocol opens an offsetting short position to hedge price risk, and mints USDb, a stablecoin backed by yield-bearing collateral rather than cash reserves.

## How it works

1. **Deposit** — a user deposits stETH collateral into `Vault.sol`.
2. **Hedge** — the vault opens a simulated short position of equal USD value on `PerpExchange.sol`, so the collateral's price exposure is neutralized (delta-neutral).
3. **Mint** — `Stablecoin.sol` mints USDb to the user, valued against live ETH/USD pricing from a Chainlink oracle.
4. **Redeem** — reversing the flow: USDb is burned, the hedge position is closed, and collateral is returned.

The result: USDb is intended to hold its peg regardless of ETH price movement, because collateral price risk is hedged rather than left exposed.

## Contracts

| Contract | Purpose |
|---|---|
| `Stablecoin.sol` | ERC-20 token (USDb). Mint/burn restricted to whichever address holds `MINTER_ROLE` (the Vault), via OpenZeppelin `AccessControl`. |
| `Vault.sol` | Core protocol logic — ERC-4626-style vault. Takes stETH collateral, reads live price via Chainlink, mints/burns USDb, and coordinates the hedge with `PerpExchange`. |
| `PerpExchange.sol` | Simulates a short derivatives position (size, entry price, funding rate) so the delta-neutral hedge can be demonstrated without integrating a real exchange. |
| `MockstETH.sol` / `MockV3Aggregator.sol` | Test mocks for collateral token and Chainlink price feed. |

## Scope

This is a scoped academic implementation of a larger architecture. **Implemented:** ERC-20 stablecoin with access-controlled mint/burn, collateral vault with live Chainlink pricing, simulated delta-neutral hedging via a mock perp exchange, and full deposit/redeem flow. **Deferred as future work:** real DEX/lending/CEX integrations, automated keeper bots, circuit-breaker monitoring, and formal verification — these are architected for but not built, which is standard for a testnet-scoped academic project.

## Tech stack

- **Contracts:** Solidity ^0.8.20, OpenZeppelin (ERC-20, AccessControl, SafeERC20), Chainlink price feeds
- **Tooling:** Hardhat 3, TypeScript, Ignition (deployment)
- **Network:** Ethereum Sepolia testnet

## Setup

```bash
npm install
npx hardhat test
```

Deploy to Sepolia (requires a funded account):

```bash
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat ignition deploy --network sepolia ignition/modules/Deploy.ts
```

## Status

Academic project — deployed and tested on Sepolia testnet only. Not audited; not intended for mainnet or real funds.
















# Sample Hardhat 3 Project (`mocha` and `ethers`)

This project showcases a Hardhat 3 project using `mocha` for tests and the `ethers` library for Ethereum interactions.

To learn more about Hardhat 3, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3](https://hardhat.org/hardhat3-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
