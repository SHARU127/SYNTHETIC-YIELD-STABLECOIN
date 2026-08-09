import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("USDnDeploymentSepolia", (m) => {
  const deployer = m.getAccount(0);

  const stablecoin = m.contract("Stablecoin", [deployer]);
  const mockStETH = m.contract("MockStETH", []);

  const priceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // real Chainlink

  const vault = m.contract("Vault", [mockStETH, stablecoin, priceFeed]);
  const perpExchange = m.contract("PerpExchange", [vault, priceFeed]);

  m.call(vault, "setPerpExchange", [perpExchange]);

  const MINTER_ROLE = m.staticCall(stablecoin, "MINTER_ROLE");
  m.call(stablecoin, "grantRole", [MINTER_ROLE, vault]);

  return { stablecoin, mockStETH, vault, perpExchange };
});