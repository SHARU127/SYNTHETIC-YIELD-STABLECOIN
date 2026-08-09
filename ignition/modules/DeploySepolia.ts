import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("USDnDeploymentSepolia", (m) => {
  const deployer = m.getAccount(0);

  const stablecoin = m.contract("Stablecoin", [deployer]);
  
  // 1. String "MockstETH" MUST match `contract MockstETH` in MockstETH.sol
  const mockstETH = m.contract("MockstETH", []);

  const priceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink Sepolia

  // 2. Pass `mockstETH` (matching variable name above) as 1st arg to Vault
  const vault = m.contract("Vault", [mockstETH, stablecoin, priceFeed]);
  const perpExchange = m.contract("PerpExchange", [vault, priceFeed]);

  m.call(vault, "setPerpExchange", [perpExchange]);

  return { stablecoin, mockstETH, vault, perpExchange };
});