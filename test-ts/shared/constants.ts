import { hexZeroPad } from "@ethersproject/bytes";
import { One } from "@ethersproject/constants";

export const DEPLOYER_ADDRESS: string = "0x1D970A764a53b5234577f1FA19577D36f0e7C52d";
export const SEED_ONE: string = hexZeroPad(One.toHexString(), 32);
export const SEED_ZERO: string = "0x".concat("0".repeat(64));
