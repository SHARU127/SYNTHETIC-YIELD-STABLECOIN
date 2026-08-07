import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDbDeployment = buildModule("USDbDeployment", (m) => {
  // 1. Get deployer account
  const deployer = m.getAccount(0);

  // 2. Deploy Stablecoin
  const stablecoin = m.contract("Stablecoin", [deployer]);

  // 3. Deploy MockstETH
  const mockstETH = m.contract("contracts/MockstETH.sol:MockstETH", []);

  // 4. Deploy Vault
  // Passing MockstETH and stablecoin futures directly as constructor arguments
  const vault = m.contract("Vault", [
    mockstETH,
    stablecoin,
    "0x694AA1769357215DE4FAC081bf1f309aDC325306", // Chainlink Sepolia ETH/USD
  ]);

  // 5. Grant Vault MINTER_ROLE on the Stablecoin contract
  const MINTER_ROLE = m.staticCall(stablecoin, "MINTER_ROLE");
  m.call(stablecoin, "grantRole", [MINTER_ROLE, vault]);

  return { stablecoin, mockstETH, vault };
});

export default USDbDeployment;