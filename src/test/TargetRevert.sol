// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

error TargetError();

/// @title TargetRevert
/// @author Paul Razvan Berg
contract TargetRevert {
    function revertLackPayableModifier() external pure returns (uint256) {
        return 0;
    }

    function revertWithCustomError() external pure {
        revert TargetError();
    }

    function revertWithNothing() external pure {
        revert();
    }

    function revertWithReason() external pure {
        revert("This is a reason");
    }

    function revertWithRequire() external pure {
        require(false);
    }
}
