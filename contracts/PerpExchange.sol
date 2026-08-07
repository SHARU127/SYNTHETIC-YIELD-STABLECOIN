// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title PerExchange (simualted)
 * @notice Simulate a short position so Vault.sol can demonstrate
 *         delta-neutral hedging withhout integrating a real derivatives exchange
 * 
 */

contract  PerpExchange {
    address public immutable vault;
    AggregatorV3Interface public immutable priceFeed;

    struct Position {
        uint256 size;   //usd value of the short position (8 decimal, matches chainlink)
        uint256 entryPrice;  //ETH/USD price when this was opened 
    }

    Position public position;

    // simulated annual funding raate, in basis points(e.g. 800 = 8% APY)
    uint256 public fundingRateBps = 800;
    uint256 public latestFundingTimestamp;


    modifier  onlyVault() {
        require(msg.sender == vault, "only vault can this");
        _;
    }

    constructor(address _vault, address _priceFeed) {
        vault = _vault;
        priceFeed = AggregatorV3Interface(_priceFeed);
        latestFundingTimestamp =  block.timestamp; //global variable giving the current block's time
    }

    //open/increase the short position- called when a user deposits 
    function openPosition(uint256 usdAmount) external onlyVault {
        uint256 currentPrice = getLatestPrice();
        
        //weighted - average price if a position already exists
        if (position.size == 0 ) {
            position.entryPrice = currentPrice;
        } else {
            position.entryPrice = 
            ((position.size * position.entryPrice) + (usdAmount * currentPrice))/(position.size + usdAmount);
        }
        position.size += usdAmount;


    }

    function getLatestPrice() public view returns (uint256) {
    (, int256 price, , , ) = priceFeed.latestRoundData();
    require(price > 0, "Invalid price feed response");
    return uint256(price);
    }

    //close/reduce the position - called when a user redeems

    function closePosition(uint usdAmount) external onlyVault returns (int256 pnl) {
        require(position.size >= usdAmount, "position to small");

        uint256 currentPrice = getLatestPrice();

        //short position profits when price Falls below entry -this is the hedge math
        pnl = (int256(position.entryPrice) - int256(currentPrice)) * int256(usdAmount) / int256(position.entryPrice);

        position.size -= usdAmount;
    }

    function claimFunding() external onlyVault returns (uint256 fundingEarned) {
        uint timeElapsed = block.timestamp - latestFundingTimestamp;

        //// Simplified: (position size * rate * time elapsed) / (seconds in a year * 10000 bps)
        fundingEarned = (position.size * fundingRateBps * timeElapsed) / (365 days * 10000);

        latestFundingTimestamp = block.timestamp;
    
    }
}