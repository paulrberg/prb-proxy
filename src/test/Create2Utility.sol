// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title Create2Utility
/// @author Paul Razvan Berg
/// @dev Forked from OpenZeppelin
/// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.5.0/contracts/utils/Create2.sol
contract Create2Utility {
    function computeAddress(
        address deployer,
        bytes32 seed,
        address factory,
        bytes memory bytecode
    ) external pure returns (address) {
        bytes32 salt = keccak256(abi.encode(deployer, seed));
        bytes32 data = keccak256(abi.encodePacked(bytes1(0xff), factory, salt, keccak256(bytecode)));
        return address(uint160(uint256(data)));
    }
}
