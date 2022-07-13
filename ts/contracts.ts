import type { Provider } from "@ethersproject/abstract-provider";
import type { Signer } from "@ethersproject/abstract-signer";

import { PRB_PROXY_FACTORY_ADDRESS, PRB_PROXY_REGISTRY_ADDRESS } from "./constants";
import type { PRBProxy } from "./types/PRBProxy";
import type { PRBProxyFactory } from "./types/PRBProxyFactory";
import type { PRBProxyRegistry } from "./types/PRBProxyRegistry";
import { PRBProxyFactory__factory } from "./types/factories/PRBProxyFactory__factory";
import { PRBProxyRegistry__factory } from "./types/factories/PRBProxyRegistry__factory";
import { PRBProxy__factory } from "./types/factories/PRBProxy__factory";

export function getPRBProxy(address: string, signerOrProvider: Provider | Signer): PRBProxy {
  const proxy: PRBProxy = PRBProxy__factory.connect(address, signerOrProvider);
  return proxy;
}

export function getPRBProxyFactory(signerOrProvider: Provider | Signer): PRBProxyFactory {
  const factory: PRBProxyFactory = PRBProxyFactory__factory.connect(PRB_PROXY_FACTORY_ADDRESS, signerOrProvider);
  return factory;
}

export function getPRBProxyRegistry(signerOrProvider: Provider | Signer): PRBProxyRegistry {
  const registry: PRBProxyRegistry = PRBProxyRegistry__factory.connect(PRB_PROXY_REGISTRY_ADDRESS, signerOrProvider);
  return registry;
}
