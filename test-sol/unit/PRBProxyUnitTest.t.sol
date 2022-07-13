// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import { ERC20GodMode } from "@prb/contracts/token/erc20/ERC20GodMode.sol";
import { IERC20 } from "@prb/contracts/token/erc20/IERC20.sol";

import { Test } from "forge-std/Test.sol";

/// @title PRBProxyUnitTest
/// @author Paul Razvan Berg
/// @notice Common contract members needed across Sablier V2 test contracts.
abstract contract PRBProxyUnitTest is Test {
    /// STRUCTS ///

    struct Users {
        address payable alice;
        address payable bob;
        address payable eve;
    }

    /// CONSTANTS ///

    uint256 internal constant MAX_UINT256 = type(uint256).max;
    uint256 internal constant ONE_MILLION_DAI = 1_000_000e18;
    uint256 internal constant ONE_MILLION_USDC = 1_000_000e6;

    /// TESTING VARIABLES ///

    ERC20GodMode internal dai = new ERC20GodMode("Dai Stablecoin", "DAI", 18);
    bytes32 internal nextUser = keccak256(abi.encodePacked("user address"));
    ERC20GodMode internal usdc = new ERC20GodMode("USD Coin", "USDC", 6);
    Users internal users;

    /// CONSTRUCTOR ///

    /// @dev A setup function invoked before each test case.
    function setUp() public virtual {
        // Create 2 users for testing. Order matters.
        users = Users({ alice: getNextUser(), bob: getNextUser(), eve: getNextUser() });

        fundUser(users.alice);
        vm.label(users.alice, "Alice");

        fundUser(users.bob);
        vm.label(users.bob, "Bob");

        fundUser(users.eve);
        vm.label(users.eve, "Eve");

        // Sets all subsequent calls' `msg.sender` to be Alice.
        vm.startPrank(users.alice);
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

    /// @dev Helper function that multiplies the `amount` by `10^decimals` and returns a `uint256.`
    function bn(uint256 amount, uint256 decimals) internal pure returns (uint256 result) {
        result = amount * 10**decimals;
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///

    /// @dev Helper function to compare two `IERC20` arrays.
    function assertEq(IERC20[] memory a, IERC20[] memory b) internal {
        address[] memory castedA;
        address[] memory castedB;
        assembly {
            castedA := a
            castedB := b
        }
        assertEq(castedA, castedB);
    }

    /// @dev Give each user 100 ETH, 1M DAI and 1M USDC.
    function fundUser(address payable user) internal {
        vm.deal(user, 100 ether);
        dai.mint(user, ONE_MILLION_DAI);
        usdc.mint(user, ONE_MILLION_USDC);
    }

    /// @dev Converts bytes32 to address.
    function getNextUser() internal returns (address payable) {
        address payable user = payable(address(uint160(uint256(nextUser))));
        nextUser = keccak256(abi.encodePacked(nextUser));
        return user;
    }
}
