import type { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { bn } from "../../../shared/numbers";

export function shouldBehaveLikeVersionGetter(): void {
  it("returns the correct version", async function () {
    const version: BigNumber = await this.contracts.prbProxyFactory.version();
    const expected: BigNumber = bn("2");
    expect(expected).to.equal(version);
  });
}
