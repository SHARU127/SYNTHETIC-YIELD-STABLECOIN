import { network } from "hardhat";

const { ethers, ignition } = await network.connect();
const Deploy = (await import("../ignition/modules/Deploy.js")).default;

console.log("== Deploying via Ignition ==");
const { stablecoin, MockstETH, vault, perpExchange } = await ignition.deploy(Deploy);
console.log("Stablecoin:", await stablecoin.getAddress());
console.log("MockstETH:", await MockstETH.getAddress());
console.log("Vault:", await vault.getAddress());
console.log("PerpExchange:", await perpExchange.getAddress());

const [user] = await ethers.getSigners();
const depositAmount = ethers.parseEther("1");

console.log("\n== Funding user with test collateral ==");
await (await MockstETH.faucet(ethers.parseEther("10"))).wait();
console.log("Minted 10 mstETH to test user");

console.log("\n== DEPOSIT ==");
await (await MockstETH.approve(await vault.getAddress(), depositAmount)).wait();
const depositTx = await vault.deposit(depositAmount);
const depositReceipt = await depositTx.wait();
console.log("deposit() tx mined, status:", depositReceipt?.status === 1 ? "success" : "FAILED");

const usdnBalanceAfterDeposit = await stablecoin.balanceOf(user.address);
const vaultCollateralBalance = await vault.collateralBalance(user.address);
const position = await perpExchange.position();

console.log("User USDn balance:", ethers.formatUnits(usdnBalanceAfterDeposit, 18));
console.log("Vault-tracked collateral balance:", ethers.formatEther(vaultCollateralBalance));
console.log(
  "PerpExchange position size (8 decimals):",
  ethers.formatUnits(position.size, 8),
  "| entryPrice:",
  ethers.formatUnits(position.entryPrice, 8)
);

console.log("\n== REDEEM (full amount) ==");
const redeemTx = await vault.redeem(usdnBalanceAfterDeposit);
const redeemReceipt = await redeemTx.wait();
console.log("redeem() tx mined, status:", redeemReceipt?.status === 1 ? "success" : "FAILED");

const usdnBalanceAfterRedeem = await stablecoin.balanceOf(user.address);
const mstEthBalanceAfterRedeem = await MockstETH.balanceOf(user.address);
const vaultCollateralAfterRedeem = await vault.collateralBalance(user.address);
const positionAfterRedeem = await perpExchange.position();

console.log("User USDn balance after redeem:", ethers.formatUnits(usdnBalanceAfterRedeem, 18));
console.log("User mstETH balance after redeem:", ethers.formatEther(mstEthBalanceAfterRedeem));
console.log("Vault-tracked collateral balance after redeem:", ethers.formatEther(vaultCollateralAfterRedeem));
console.log("PerpExchange position size after redeem:", ethers.formatUnits(positionAfterRedeem.size, 8));

console.log("\n== Sanity checks ==");
console.log("USDn burned back to 0:", usdnBalanceAfterRedeem === 0n ? "PASS" : "FAIL");
console.log(
  "User got their mstETH back:",
  mstEthBalanceAfterRedeem === ethers.parseEther("10") ? "PASS" : "FAIL"
);
console.log("Vault collateral tracking cleared:", vaultCollateralAfterRedeem === 0n ? "PASS" : "FAIL");
console.log("PerpExchange position fully closed:", positionAfterRedeem.size === 0n ? "PASS" : "FAIL");