// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title TargetPanic
/// @author Paul Razvan Berg
contract TargetPanic {
    function panicAssert() external pure {
        assert(false);
    }

    function panicDivisionByZero() external pure returns (uint256) {
        uint256 x = 0;
        return type(uint256).max / x;
    }

    function panicArithmeticOverflow() external pure returns (uint256) {
        return type(uint256).max + 1;
    }

    function panicArithmeticUnderflow() external pure returns (uint256) {
        return type(uint256).min - 1;
    }
}
