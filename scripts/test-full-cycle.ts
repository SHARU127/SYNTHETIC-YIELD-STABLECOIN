import { network } from "hardhat";

const { ethers, ignition } = await network.connect();
const Deploy = (await import("../ignition/modules/Deploy.js")).default;

const { stablecoin, MockstETH, vault, perpExchange } = await ignition.deploy(Deploy);

const [user] = await ethers.getSigners();

// 1. Give the user some mock collateral via the faucet
await MockstETH.faucet(ethers.parseEther("10"));
console.log("Minted 10 mstETH to test user");

// 2. Approve Vault to pull that collateral
await MockstETH.approve(await vault.getAddress(), ethers.parseEther("10"));
console.log("Approved Vault to spend mstETH");

// 3. Deposit — should mint USDn and open a short position
await vault.deposit(ethers.parseEther("1"));
const usdnBalance = await stablecoin.balanceOf(user.address);
console.log("USDn minted:", ethers.formatUnits(usdnBalance, 18));

// 4. Check the hedge actually opened
const position = await perpExchange.position();
console.log("Short position size:", position.size.toString());

// 5. Redeem — should burn USDn and return collateral
await vault.redeem(usdnBalance);
const finalCollateral = await MockstETH.balanceOf(user.address);
console.log("Final mstETH balance:", ethers.formatUnits(finalCollateral, 18));