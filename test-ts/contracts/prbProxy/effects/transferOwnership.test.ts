import { AddressZero } from "@ethersproject/constants";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

import { PRBProxyErrors } from "../../../shared/errors";

export function shouldBehaveLikeTransferOwnership(): void {
  let owner: SignerWithAddress;

  beforeEach(async function () {
    owner = this.signers.alice;
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      const raider: SignerWithAddress = this.signers.bob;
      await expect(this.contracts.prbProxy.connect(raider).transferOwnership(raider.address)).to.be.revertedWith(
        PRBProxyErrors.NOT_OWNER,
      );
    });
  });

  context("when the caller is the owner", function () {
    context("when the new owner is the zero address", function () {
      it("transfers the ownership", async function () {
        const newOwner: string = AddressZero;
        await this.contracts.prbProxy.connect(owner).transferOwnership(newOwner);
        expect(newOwner).to.equal(await this.contracts.prbProxy.owner());
      });

      it("emits a TransferOwnership event", async function () {
        const newOwner: string = AddressZero;
        await expect(this.contracts.prbProxy.connect(owner).transferOwnership(newOwner))
          .to.emit(this.contracts.prbProxy, "TransferOwnership")
          .withArgs(owner.address, newOwner);
      });
    });

    context("when the new owner is not the zero address", function () {
      it("transfers the ownership", async function () {
        const newOwner: string = this.signers.bob.address;
        await this.contracts.prbProxy.connect(owner).transferOwnership(newOwner);
        expect(newOwner).to.equal(await this.contracts.prbProxy.owner());
      });

      it("emits a TransferOwnership event", async function () {
        const newOwner: string = this.signers.bob.address;
        await expect(this.contracts.prbProxy.connect(owner).transferOwnership(newOwner))
          .to.emit(this.contracts.prbProxy, "TransferOwnership")
          .withArgs(owner.address, newOwner);
      });
    });
  });
}
