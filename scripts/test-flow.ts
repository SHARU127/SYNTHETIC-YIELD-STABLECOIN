import { network } from "hardhat";

const { ethers, ignition } = await network.connect();
const Deploy = (await import("../ignition/modules/Deploy.js")).default;

console.log("== Connecting to deployed Sepolia contracts ==");
const stablecoin = await ethers.getContractAt("Stablecoin", "0xbd35CF5372624bb39d7451db785e94B7df16E802");
const mockStETH = await ethers.getContractAt("MockstETH", "0xA23148f000B46358BF2d79713df2fBAeFaABBD67");
const vault = await ethers.getContractAt("Vault", "0xad02026CC788E02269ad3836bcD1C28D98f1B0CE");
const perpExchange = await ethers.getContractAt("PerpExchange", "0x7dD4683D43bFe3729D60BDCF70898004135b46B6");
console.log("Stablecoin:", await stablecoin.getAddress());
console.log("MockstETH:", await mockStETH.getAddress());
console.log("Vault:", await vault.getAddress());
console.log("PerpExchange:", await perpExchange.getAddress());

const [user] = await ethers.getSigners();
const depositAmount = ethers.parseEther("1");

console.log("\n== Funding user with test collateral ==");
await (await mockStETH.faucet(ethers.parseEther("10"))).wait();
console.log("Minted 10 mstETH to test user");

console.log("\n== DEPOSIT ==");
await (await mockStETH.approve(await vault.getAddress(), depositAmount)).wait();
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
const mstEthBalanceAfterRedeem = await mockStETH.balanceOf(user.address);
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