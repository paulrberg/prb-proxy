import { AddressZero } from "@ethersproject/constants";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

import { PRBProxyErrors } from "../../../shared/errors";

export function shouldBehaveLikeSetPermission(): void {
  let envoy: SignerWithAddress;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    envoy = this.signers.bob;
    owner = this.signers.alice;
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      const raider: SignerWithAddress = this.signers.bob;
      const target: string = AddressZero;
      const selector: string = "0x01020304";
      const permission: boolean = true;
      await expect(
        this.contracts.prbProxy.connect(raider).setPermission(raider.address, target, selector, permission),
      ).to.be.revertedWith(PRBProxyErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    let permission: boolean;
    let selector: string;
    let target: string;

    beforeEach(async function () {
      permission = true;
      selector = this.contracts.targets.envoy.interface.getSighash("foo");
      target = this.contracts.targets.envoy.address;
    });

    context("when the permission was not set", function () {
      it("sets the permission to true", async function () {
        await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, permission);
        expect(permission).to.equal(await this.contracts.prbProxy.getPermission(envoy.address, target, selector));
      });
    });

    context("when the permission was set", function () {
      beforeEach(async function () {
        await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, permission);
      });

      it("sets the permission to true again", async function () {
        await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, permission);
        expect(true).to.equal(await this.contracts.prbProxy.getPermission(envoy.address, target, selector));
      });

      it("sets the permission to false", async function () {
        const newPermission: boolean = false;
        await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, newPermission);
        expect(newPermission).to.equal(await this.contracts.prbProxy.getPermission(envoy.address, target, selector));
      });
    });
  });
}
