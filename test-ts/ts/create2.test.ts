import { expect } from "chai";
import forEach from "mocha-each";

import { PRB_PROXY_FACTORY_ADDRESS } from "../../src";
import { computeProxyAddress } from "../../src/create2";
import { PRBProxy__factory } from "../../src/types/factories/PRBProxy__factory";
import { DEPLOYER_ADDRESS, SEED_ONE, SEED_ZERO } from "../shared/constants";
import { integrationFixtureCreate2Utility } from "../shared/fixtures";

export function shouldBehaveLikeCreate2(): void {
  beforeEach(async function () {
    const { create2Utility } = await this.loadFixture(integrationFixtureCreate2Utility);
    this.contracts.create2Utility = create2Utility;
  });

  const testSets = [
    [DEPLOYER_ADDRESS, SEED_ZERO],
    [DEPLOYER_ADDRESS, SEED_ONE],
    [DEPLOYER_ADDRESS, "0x250cf77c5e9ae4bc917c7f2cb1b42e3e5d7cd29de5199c2ac358ecb811311a59"],
    [DEPLOYER_ADDRESS, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"],
  ];

  forEach(testSets).it(
    "takes %.6s... and %.8s... and computes the correct contract address",
    async function (deployer: string, seed: string) {
      const result: string = computeProxyAddress(deployer, seed);
      const expected: string = await this.contracts.create2Utility.computeAddress(
        deployer,
        seed,
        PRB_PROXY_FACTORY_ADDRESS,
        PRBProxy__factory.bytecode,
      );
      expect(expected).to.equal(result);
    },
  );
}
