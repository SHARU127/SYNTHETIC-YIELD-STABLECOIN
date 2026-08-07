// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 *@title Mock stETH
 *@notice A fake, freely-mintable stand-in for real stETH, used only on
 *        testnet so we have a collateral token to deposit into the vault.
 * 
 */

contract MockstETH is ERC20 {
    constructor() ERC20("mock staked ETH","mstETH") {}

    ///@notice anyone can mint themselves test tokens - testnet only, never do this on mainnet.
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
