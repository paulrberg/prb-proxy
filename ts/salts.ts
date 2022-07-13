import { defaultAbiCoder } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";

export function computeSalt(deployer: string, seed: string): string {
  return keccak256(defaultAbiCoder.encode(["address", "bytes32"], [deployer, seed]));
}
