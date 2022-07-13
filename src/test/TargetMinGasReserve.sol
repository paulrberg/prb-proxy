// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title TargetMinGasReserve
/// @author Paul Razvan Berg
contract TargetMinGasReserve {
    address public owner;
    uint256 public minGasReserve;

    function setMinGasReserve(uint256 newMinGasReserve) external {
        minGasReserve = newMinGasReserve;
    }
}
