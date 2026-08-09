import { network } from "hardhat";

const { ethers } = await network.connect();

const stablecoin = await ethers.getContractAt(
  "Stablecoin",
  "0xbd35CF5372624bb39d7451db785e94B7df16E802"
);
const vaultAddress = "0xad02026CC788E02269ad3836bcD1C28D98f1B0CE";

const MINTER_ROLE = await stablecoin.MINTER_ROLE();
console.log("MINTER_ROLE hash:", MINTER_ROLE);

const alreadyHasRole = await stablecoin.hasRole(MINTER_ROLE, vaultAddress);
console.log("Vault already has MINTER_ROLE?", alreadyHasRole);

if (!alreadyHasRole) {
  const tx = await stablecoin.grantRole(MINTER_ROLE, vaultAddress);
  await tx.wait();
  console.log("MINTER_ROLE granted to Vault. Tx hash:", tx.hash);
} else {
  console.log("Nothing to do — already granted.");
}