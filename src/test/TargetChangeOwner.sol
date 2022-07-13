// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title TargetChangeOwner
/// @author Paul Razvan Berg
contract TargetChangeOwner {
    address public owner;

    function changeOwner() external {
        owner = address(1);
    }
}
