import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "hardhatMainnet",
  chainType: "l1",
});

async function main() {
  const [deployer, user] = await ethers.getSigners();

  console.log("== Deploying contracts ==");

  // 1. Stablecoin
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const stablecoin = await Stablecoin.deploy(deployer.address);
  await stablecoin.waitForDeployment();
  console.log("Stablecoin:", await stablecoin.getAddress());

  // 2. MockstETH (collateral token)
  const MockstETH = await ethers.getContractFactory("MockstETH");
  const MockstETH = await MockstETH.deploy();
  await MockstETH.waitForDeployment();
  console.log("MockstETH:", await MockstETH.getAddress());

  // 3. MockV3Aggregator (fake Chainlink ETH/USD feed) — 8 decimals, $3000 starting price
  const MockAggregator = await ethers.getContractFactory("MockV3Aggregator");
  const priceFeed = await MockAggregator.deploy(8, 3000n * 10n ** 8n);
  await priceFeed.waitForDeployment();
  console.log("MockV3Aggregator:", await priceFeed.getAddress());

  // 4. Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(
    await MockstETH.getAddress(),
    await stablecoin.getAddress(),
    await priceFeed.getAddress()
  );
  await vault.waitForDeployment();
  console.log("Vault:", await vault.getAddress());

  // 5. Grant Vault MINTER_ROLE on Stablecoin
  const MINTER_ROLE = await stablecoin.MINTER_ROLE();
  await (await stablecoin.grantRole(MINTER_ROLE, await vault.getAddress())).wait();
  console.log("Granted MINTER_ROLE to Vault");

  // 6. PerpExchange
  const PerpExchange = await ethers.getContractFactory("PerpExchange");
  const perpExchange = await PerpExchange.deploy(
    await vault.getAddress(),
    await priceFeed.getAddress()
  );
  await perpExchange.waitForDeployment();
  console.log("PerpExchange:", await perpExchange.getAddress());

  // 7. Wire PerpExchange into Vault
  await (await vault.setPerpExchange(await perpExchange.getAddress())).wait();
  console.log("Wired PerpExchange into Vault");

  console.log("\n== Funding user with test collateral ==");
  const depositAmount = ethers.parseEther("10"); // 10 mstETH
  await (await MockstETH.connect(user).faucet(depositAmount)).wait();
  console.log(`User faucet'd ${ethers.formatEther(depositAmount)} mstETH`);

  console.log("\n== DEPOSIT ==");
  await (await MockstETH.connect(user).approve(await vault.getAddress(), depositAmount)).wait();
  const depositTx = await vault.connect(user).deposit(depositAmount);
  const depositReceipt = await depositTx.wait();
  console.log("deposit() tx mined, status:", depositReceipt?.status === 1 ? "success" : "FAILED");

  const usdbBalanceAfterDeposit = await stablecoin.balanceOf(user.address);
  const vaultCollateralBalance = await vault.collateralBalance(user.address);
  const position = await perpExchange.position();

  console.log("User USDb balance:", ethers.formatUnits(usdbBalanceAfterDeposit, 18));
  console.log("Vault-tracked collateral balance:", ethers.formatEther(vaultCollateralBalance));
  console.log(
    "PerpExchange position size (8 decimals):",
    ethers.formatUnits(position.size, 8),
    "| entryPrice:",
    ethers.formatUnits(position.entryPrice, 8)
  );

  console.log("\n== REDEEM (full amount) ==");
  const redeemTx = await vault.connect(user).redeem(usdbBalanceAfterDeposit);
  const redeemReceipt = await redeemTx.wait();
  console.log("redeem() tx mined, status:", redeemReceipt?.status === 1 ? "success" : "FAILED");

  const usdbBalanceAfterRedeem = await stablecoin.balanceOf(user.address);
  const mstEthBalanceAfterRedeem = await MockstETH.balanceOf(user.address);
  const vaultCollateralAfterRedeem = await vault.collateralBalance(user.address);
  const positionAfterRedeem = await perpExchange.position();

  console.log("User USDb balance after redeem:", ethers.formatUnits(usdbBalanceAfterRedeem, 18));
  console.log("User mstETH balance after redeem:", ethers.formatEther(mstEthBalanceAfterRedeem));
  console.log("Vault-tracked collateral balance after redeem:", ethers.formatEther(vaultCollateralAfterRedeem));
  console.log("PerpExchange position size after redeem:", ethers.formatUnits(positionAfterRedeem.size, 8));

  console.log("\n== Sanity checks ==");
  console.log(
    "USDb burned back to 0:",
    usdbBalanceAfterRedeem === 0n ? "PASS" : "FAIL"
  );
  console.log(
    "User got their mstETH back:",
    mstEthBalanceAfterRedeem === depositAmount ? "PASS" : "FAIL"
  );
  console.log(
    "PerpExchange position fully closed:",
    positionAfterRedeem.size === 0n ? "PASS" : "FAIL"
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });