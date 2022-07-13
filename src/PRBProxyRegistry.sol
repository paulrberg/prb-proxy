// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "./IPRBProxy.sol";
import "./IPRBProxyFactory.sol";
import "./IPRBProxyRegistry.sol";

/// @notice Emitted when a proxy already exists for the given owner.
error PRBProxyRegistry__ProxyAlreadyExists(address owner);

/// @title PRBProxyRegistry
/// @author Paul Razvan Berg
contract PRBProxyRegistry is IPRBProxyRegistry {
    /// PUBLIC STORAGE ///

    /// @inheritdoc IPRBProxyRegistry
    IPRBProxyFactory public override factory;

    /// INTERNAL STORAGE ///

    /// @notice Internal mapping of owners to current proxies.
    mapping(address => IPRBProxy) internal currentProxies;

    /// CONSTRUCTOR ///

    constructor(IPRBProxyFactory factory_) {
        factory = factory_;
    }

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @inheritdoc IPRBProxyRegistry
    function getCurrentProxy(address owner) external view override returns (IPRBProxy proxy) {
        proxy = currentProxies[owner];
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IPRBProxyRegistry
    function deploy() external override returns (address payable proxy) {
        proxy = deployFor(msg.sender);
    }

    /// @inheritdoc IPRBProxyRegistry
    function deployFor(address owner) public override returns (address payable proxy) {
        IPRBProxy currentProxy = currentProxies[owner];

        // Do not deploy if the proxy already exists and the owner is the same.
        if (address(currentProxy) != address(0) && currentProxy.owner() == owner) {
            revert PRBProxyRegistry__ProxyAlreadyExists(owner);
        }

        // Deploy the proxy via the factory.
        proxy = factory.deployFor(owner);

        // Set or override the current proxy for the owner.
        currentProxies[owner] = IPRBProxy(proxy);
    }
}
