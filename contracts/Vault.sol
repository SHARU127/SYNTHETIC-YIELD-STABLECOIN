// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//stETH a staked eth on ethereum blockchain, via lido protocol


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./Stablecoin.sol";
import "./PerpExchange.sol"; 

//token is like a digital currency its just numbers shown next to a account.
//say like alice has 300 tokens balance in his game account.
contract Vault {
    
    //so inorder to use transfer, transferFrom, balanceof
    //SafeERC20 is just making the code return in safer manner, by jsut giving true or false in the end of return.
    using SafeERC20 for IERC20;

    IERC20 public immutable collateralToken;
    Stablecoin public immutable usdb;
    AggregatorV3Interface public immutable priceFeed;

    PerpExchange public perpExchange;   // NEW — not immutable, set after deploy
    address public owner;

    mapping (address => uint256) public collateralBalance;

    event Deposited(address indexed user, uint256 collateralAmount, uint256 usdbMinted);
    event Redeemed(address indexed user, uint256 usdbBurned, uint256 collateralReturned);
    event PerpExchangeSet(address perpExchange); 

    constructor(address _collateralToken, address _usdb, address _priceFeed){
        collateralToken = IERC20(_collateralToken);
        usdb = Stablecoin(_usdb);
        priceFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender; 
    }

    //called right after PerpExchange is deployed 
    function setPerpExchange(address _perpExchange) external {
        require(msg.sender == owner, "not owner");
        require(address(perpExchange) == address(0), "already set");
        perpExchange = PerpExchange(_perpExchange);
        emit PerpExchangeSet(_perpExchange);
    }

    function getsLatestPrice() public view returns (uint256) {
        (,int256 price,,,) = priceFeed.latestRoundData();
        require(price >0, "Invalid price");
        return uint256(price);
    }

    function deposit(uint256 amount) external {
        require(amount >0, "amount must be > 0");
        require(address(perpExchange) != address(0), "perp not wired");
        
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        collateralBalance[msg.sender] += amount;

        uint256 price = getsLatestPrice();
        uint256 usdbValue = (amount * price)/ 1e8;

        usdb.Mint(msg.sender, usdbValue);        // casing fix — match Stablecoin.sol exactly
        perpExchange.openPosition(usdbValue);
        
        
        emit Deposited(msg.sender, amount, usdbValue);
    }

    function redeem(uint256 usdbAmount) external{
        require(usdbAmount > 0, "Amount msut be > 0");
        require(address(perpExchange) != address(0), "perp not wired");
        
        uint256 price = getsLatestPrice();
        uint256 collateralAmount = (usdbAmount*1e8)/price;
        require(collateralBalance[msg.sender] >= collateralAmount ,"Insufficient collateral");

        perpExchange.closePosition(usdbAmount);  

        collateralBalance[msg.sender] -= collateralAmount;
        usdb.burn(msg.sender, usdbAmount);
        collateralToken.safeTransfer(msg.sender, collateralAmount);

        emit Redeemed(msg.sender, usdbAmount, collateralAmount); 

    }
}
