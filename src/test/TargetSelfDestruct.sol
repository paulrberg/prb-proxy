// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title TargetSelfDestruct
/// @author Paul Razvan Berg
contract TargetSelfDestruct {
    function destroyMe(address payable recipient) external {
        selfdestruct(recipient);
    }
}
