// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; 
//the '^' is used cuase 0.8.21, 0.8.22, 0.8.23 etc can also compile this program
//why 0.8.x  bcux it has built-in overflow and underflow in it.

//openZeppelin is an library for smart contracts.
//why use npm ?
//its a node package manager, its a tool used in javascript/typescript environments to manage external open-source libraries.
//to compile,test,deploy these smart contracts the tool is built on javascript/typescript,so npm is used.
//npm downloads and manages tools like hardhat, testing libraries and smart contract libraries.
//HARDHAT is a development environment where it automates complex tasks required to turn a raw solidity code into functional blockchain applications. 
//hardhat runs local test network,compiles smart contracts, deploys on ethereum testnets or mainnets.





import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


//natspec (a ethereum natural language specification) its a built-in comment format in solidity, for documenting contracts, functions, variables in a way that that both humans and tools parse consistently.
//parsing means these automated software tools can read any contract and understand it without guessing.
//Displaying Friendly UI Messages to Users


/**
 * @title stablecoin (USDn)
 * @notice The ERC-20 token users hold. Minting and buring are burning are restricted  
 *         to whichever address holds MINTER_ROLE - that will our vault 
 *         contract, not any random wallet.
 */

contract Stablecoin is ERC20, AccessControl{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    //MINTER_ROLE is a fiexd lock it never changes. what varies is who's been given 
    //a copy of the key(grantRole). which is tracked separately in mappings inside AccessControl
    
    
    //when we deploy the contract, i will pass the wallet address.
    //ERC20 constructor accepts token name, symbol. USDn Stablecoin - shows up in wallets like MetaMask, "USDn" shows up next to my balance like "ETH".
    constructor (address admin) ERC20("USDb Stablecoin","USDb"){
        _grantRole(DEFAULT_ADMIN_ROLE,admin);
    }

    /**
     * @notice Mint new USDb. ONLY callable by an address holding MINTER_ROLE.
     * @dev In my system, this will be called by Vault.sol when a user
     *      deposits collateral - never called directly by user.
     */

    //MinterRole --> [_roles[MINTER_ROLE][msg.sender] == true]
    //_ underscore prefix means this is an internal function, inherited from ERC20.sol 
    function Mint(address to, uint256 amount) external onlyRole(MINTER_ROLE)  {
        _mint(to , amount);
        
    }


    /**
     * @notice burn new USDb. ONLY callable by an address holding MINTER_ROLE.
     * @dev called by Vault.sol when a user redeems their collateral back.
     */


    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE){
        _burn(from, amount);
    }
}