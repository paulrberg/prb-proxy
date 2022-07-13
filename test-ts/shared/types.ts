import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { PRBProxy } from "../../src/types/PRBProxy";
import type { PRBProxyFactory } from "../../src/types/PRBProxyFactory";
import type { PRBProxyRegistry } from "../../src/types/PRBProxyRegistry";
import type { Create2Utility } from "../../src/types/test/Create2Utility";
import type { TargetChangeOwner } from "../../src/types/test/TargetChangeOwner";
import type { TargetEcho } from "../../src/types/test/TargetEcho";
import type { TargetEnvoy } from "../../src/types/test/TargetEnvoy";
import type { TargetMinGasReserve } from "../../src/types/test/TargetMinGasReserve";
import type { TargetPanic } from "../../src/types/test/TargetPanic";
import type { TargetRevert } from "../../src/types/test/TargetRevert";
import type { TargetSelfDestruct } from "../../src/types/test/TargetSelfDestruct";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Contracts {
  create2Utility: Create2Utility;
  prbProxy: PRBProxy;
  prbProxyFactory: PRBProxyFactory;
  prbProxyRegistry: PRBProxyRegistry;
  targets: Targets;
}

export interface Signers {
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
}

export interface Targets {
  changeOwner: TargetChangeOwner;
  echo: TargetEcho;
  envoy: TargetEnvoy;
  minGasReserve: TargetMinGasReserve;
  panic: TargetPanic;
  revert: TargetRevert;
  selfDestruct: TargetSelfDestruct;
}
