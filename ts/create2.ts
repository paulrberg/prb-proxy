import { getCreate2Address } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/keccak256";

import { PRB_PROXY_FACTORY_ADDRESS } from "./constants";
import { computeSalt } from "./salts";
import { PRBProxy__factory } from "./types/factories/PRBProxy__factory";

export function computeProxyAddress(deployer: string, seed: string): string {
  return getCreate2Address(
    PRB_PROXY_FACTORY_ADDRESS,
    computeSalt(deployer, seed),
    keccak256(PRBProxy__factory.bytecode),
  );
}
