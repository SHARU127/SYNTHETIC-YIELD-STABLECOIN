import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("USDnDeploymentSepolia", (m) => {
  const deployer = m.getAccount(0);

  // Real Chainlink ETH/USD feed, live on Sepolia
  const priceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

  // 1. Deploy Stablecoin (deployer becomes admin)
  const stablecoin = m.contract("Stablecoin", [deployer]);

  // 2. Deploy mock collateral token
  const mockStETH = m.contract("MockstETH", []);

  // 3. Deploy Vault
  const vault = m.contract("Vault", [mockStETH, stablecoin, priceFeed]);

  // 4. Deploy PerpExchange — needs Vault's address
  const perpExchange = m.contract("PerpExchange", [vault, priceFeed]);

  // 5. Wire Vault -> PerpExchange
  m.call(vault, "setPerpExchange", [perpExchange]);

  // 6. Grant Vault permission to mint/burn USDn — THE STEP THAT WAS MISSING
  const MINTER_ROLE = m.staticCall(stablecoin, "MINTER_ROLE");
  m.call(stablecoin, "grantRole", [MINTER_ROLE, vault]);

  return { stablecoin, mockStETH, vault, perpExchange };
});