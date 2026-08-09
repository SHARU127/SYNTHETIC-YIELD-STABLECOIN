// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Mock Chainlink Price Feed
 * @notice A fake price feed for LOCAL testing only, so we don't depend on
 *         a real network connection to test deposit/redeem logic.
 */
contract MockV3Aggregator is AggregatorV3Interface {
    uint8 public constant override decimals = 8;
    int256 private _price;

    constructor(int256 initialPrice) {
        _price = initialPrice;
    }

    function latestRoundData()
        external
        view
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (0, _price, block.timestamp, block.timestamp, 0);
    }

    // Lets us simulate a price crash in tests later, e.g. for your "black swan" stress test
    function setPrice(int256 newPrice) external {
        _price = newPrice;
    }

    function description() external pure override returns (string memory) { return "Mock ETH/USD"; }
    function version() external pure override returns (uint256) { return 1; }
    function getRoundData(uint80) external view override returns (uint80, int256, uint256, uint256, uint80) {
        return (0, _price, block.timestamp, block.timestamp, 0);
    }
}