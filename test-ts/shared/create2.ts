import { getCreate2Address } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/keccak256";
import { artifacts } from "hardhat";

import { computeSalt } from "../../src/salts";

export async function computeProxyAddress(this: Mocha.Context, deployer: string): Promise<string> {
  const nextSeed: string = await this.contracts.prbProxyFactory.getNextSeed(deployer);
  const bytecode: string = (await artifacts.readArtifact("PRBProxy")).bytecode;
  return getCreate2Address(
    this.contracts.prbProxyFactory.address,
    computeSalt(deployer, nextSeed),
    keccak256(bytecode),
  );
}
