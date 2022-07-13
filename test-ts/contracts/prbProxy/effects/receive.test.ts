import type { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeReceive(): void {
  context("when the call data is not empty", function () {
    it("reverts", async function () {
      await expect(
        this.signers.alice.sendTransaction({
          data: "0xcafe",
          to: this.contracts.prbProxy.address,
          value: parseEther("3.14"),
        }),
      ).to.be.revertedWith(
        "Transaction reverted: function selector was not recognized and there's no fallback function",
      );
    });
  });

  context("when the call data is empty", function () {
    it("receives the ether", async function () {
      const sentAmount: BigNumber = parseEther("3.14");
      await this.signers.alice.sendTransaction({
        to: this.contracts.prbProxy.address,
        value: sentAmount,
      });
      const balance: BigNumber = await ethers.provider.getBalance(this.contracts.prbProxy.address);
      expect(sentAmount).to.equal(balance);
    });
  });
}
