import type { Signer } from "@ethersproject/abstract-signer";
import type { Wallet } from "@ethersproject/wallet";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, waffle } from "hardhat";

import type { Contracts, Signers, Targets } from "./types";

const { createFixtureLoader } = waffle;

export function baseContext(description: string, hooks: () => void): void {
  describe(description, function () {
    before(async function () {
      this.contracts = {} as Contracts;
      this.contracts.targets = {} as Targets;
      this.signers = {} as Signers;

      const signers: SignerWithAddress[] = await ethers.getSigners();
      this.signers.alice = signers[0];
      this.signers.bob = signers[1];
      this.signers.carol = signers[2];

      // Get rid of this when https://github.com/nomiclabs/hardhat/issues/849 gets fixed.
      this.loadFixture = createFixtureLoader(signers as Signer[] as Wallet[]);
    });

    hooks();
  });
}
