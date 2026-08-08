import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("USDbDeployment", (m) => {
  const deployer = m.getAccount(0);

  const stablecoin = m.contract("Stablecoin", [deployer]);
  const MockstETH = m.contract("MockstETH", []);

  const vault = m.contract("Vault", [
    MockstETH,
    stablecoin,
    "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  ]);

  const perpExchange = m.contract("PerpExchange", [
    vault,
    "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  ]);

  // Wire PerpExchange into Vault — must happen after both are deployed
  m.call(vault, "setPerpExchange", [perpExchange]);

  // Grant Vault permission to mint/burn USDb
  const MINTER_ROLE = m.staticCall(stablecoin, "MINTER_ROLE");
  m.call(stablecoin, "grantRole", [MINTER_ROLE, vault]);

  return { stablecoin, MockstETH, vault, perpExchange };
});