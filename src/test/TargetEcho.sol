// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

/// @title TargetEcho
/// @author Paul Razvan Berg
contract TargetEcho {
    struct TargetStruct {
        uint256 foo;
        uint256 bar;
        uint256 baz;
    }

    function echoAddress(address input) external pure returns (address) {
        return input;
    }

    function echoArray(uint256[] calldata input) external pure returns (uint256[] calldata) {
        return input;
    }

    function echoBytes(bytes memory input) external pure returns (bytes memory) {
        return input;
    }

    function echoBytes32(bytes32 input) external pure returns (bytes32) {
        return input;
    }

    function echoMsgValue() external payable returns (uint256) {
        return msg.value;
    }

    function echoString(string memory input) external pure returns (string memory) {
        return input;
    }

    function echoStruct(TargetStruct calldata input) external pure returns (TargetStruct calldata) {
        return input;
    }

    function echoUint8(uint8 input) external pure returns (uint8) {
        return input;
    }

    function echoUint256(uint256 input) external pure returns (uint256) {
        return input;
    }
}
