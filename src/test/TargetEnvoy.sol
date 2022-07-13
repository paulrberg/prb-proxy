// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title TargetEnvoy
/// @author Paul Razvan Berg
contract TargetEnvoy {
    function foo() external pure returns (string memory) {
        return "foo";
    }

    function bar() external pure returns (string memory) {
        return "bar";
    }
}
