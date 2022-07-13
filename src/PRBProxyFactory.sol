// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "./IPRBProxy.sol";
import "./IPRBProxyFactory.sol";
import "./PRBProxy.sol";

/// @title PRBProxyFactory
/// @author Paul Razvan Berg
contract PRBProxyFactory is IPRBProxyFactory {
    /// PUBLIC STORAGE ///

    /// @inheritdoc IPRBProxyFactory
    uint256 public constant override version = 2;

    /// INTERNAL STORAGE ///

    /// @dev Internal mapping to track all deployed proxies.
    mapping(address => bool) internal proxies;

    /// @dev Internal mapping to track the next seed to be used by an EOA.
    mapping(address => bytes32) internal nextSeeds;

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @inheritdoc IPRBProxyFactory
    function getNextSeed(address eoa) external view override returns (bytes32 nextSeed) {
        nextSeed = nextSeeds[eoa];
    }

    /// @inheritdoc IPRBProxyFactory
    function isProxy(address proxy) external view override returns (bool result) {
        result = proxies[proxy];
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IPRBProxyFactory
    function deploy() external override returns (address payable proxy) {
        proxy = deployFor(msg.sender);
    }

    /// @inheritdoc IPRBProxyFactory
    function deployFor(address owner) public override returns (address payable proxy) {
        bytes32 seed = nextSeeds[tx.origin];

        // Prevent front-running the salt by hashing the concatenation of "tx.origin" and the user-provided seed.
        bytes32 salt = keccak256(abi.encode(tx.origin, seed));

        // Deploy the proxy with CREATE2.
        proxy = payable(new PRBProxy{ salt: salt }());

        // Transfer the ownership from this factory contract to the specified owner.
        IPRBProxy(proxy).transferOwnership(owner);

        // Mark the proxy as deployed.
        proxies[proxy] = true;

        // Increment the seed.
        unchecked {
            nextSeeds[tx.origin] = bytes32(uint256(seed) + 1);
        }

        // Log the proxy via en event.
        emit DeployProxy(tx.origin, msg.sender, owner, seed, salt, address(proxy));
    }
}
