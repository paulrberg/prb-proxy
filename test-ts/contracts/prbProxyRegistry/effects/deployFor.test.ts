import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { artifacts, ethers } from "hardhat";

import type { PRBProxy } from "../../../../src/types/PRBProxy";
import { PRBProxy__factory } from "../../../../src/types/factories/PRBProxy__factory";
import { computeProxyAddress } from "../../../shared/create2";
import { PRBProxyRegistryErrors } from "../../../shared/errors";

export function shouldBehaveLikeDeployFor(): void {
  let deployer: SignerWithAddress;
  let expectedBytecode: string;
  let owner: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(async function () {
    deployer = this.signers.alice;
    expectedBytecode = (await artifacts.readArtifact("PRBProxy")).deployedBytecode;
    owner = this.signers.bob;
    proxyAddress = await computeProxyAddress.call(this, deployer.address);
  });

  context("when the owner has a proxy", function () {
    beforeEach(async function () {
      await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
    });

    context("when the owner did not transfer ownership", function () {
      it("reverts", async function () {
        await expect(this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address)).to.be.revertedWith(
          PRBProxyRegistryErrors.PROXY_ALREADY_EXISTS,
        );
      });
    });

    context("when the owner transferred ownership", function () {
      let thirdParty: SignerWithAddress;

      beforeEach(async function () {
        thirdParty = this.signers.carol;
        const prbProxy: PRBProxy = PRBProxy__factory.connect(proxyAddress, owner);
        await prbProxy.connect(owner).transferOwnership(thirdParty.address);
      });

      it("deploys the proxy", async function () {
        const newProxyAddress: string = await computeProxyAddress.call(this, deployer.address);
        await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
        const deployedBytecode: string = await ethers.provider.getCode(newProxyAddress);
        expect(deployedBytecode).to.equal(expectedBytecode);
      });
    });
  });

  context("when the owner does not have a proxy", function () {
    context("when the deployer is the same as the owner", function () {
      it("deploys the proxy", async function () {
        await this.contracts.prbProxyRegistry.connect(deployer).deployFor(deployer.address);
        const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
        expect(deployedBytecode).to.equal(expectedBytecode);
      });
    });

    context("when the deployer is not the same as the owner", function () {
      context("when the deployer did not deploy another proxy via the factory for the owner", function () {
        it("deploys the proxy", async function () {
          await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
          const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
          expect(deployedBytecode).to.equal(expectedBytecode);
        });
      });

      context("when the deployer deployed another proxy for the owner via the factory", function () {
        beforeEach(async function () {
          await this.contracts.prbProxyFactory.connect(deployer).deployFor(owner.address);
        });

        context("when the deployer did not deploy another proxy for themselves via the factory", function () {
          let newProxyAddress: string;

          beforeEach(async function () {
            newProxyAddress = await computeProxyAddress.call(this, deployer.address);
          });

          it("deploys the proxy", async function () {
            await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
            const deployedBytecode: string = await ethers.provider.getCode(newProxyAddress);
            expect(deployedBytecode).to.equal(expectedBytecode);
          });

          it("updates the currentProxies mapping", async function () {
            await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
            const currentProxy: string = await this.contracts.prbProxyRegistry.getCurrentProxy(owner.address);
            expect(newProxyAddress).to.equal(currentProxy);
          });
        });

        context("when the deployer deployed another proxy for themselves via the factory", function () {
          let newProxyAddress: string;

          beforeEach(async function () {
            await this.contracts.prbProxyFactory.connect(deployer).deploy();
            newProxyAddress = await computeProxyAddress.call(this, deployer.address);
          });

          it("deploys the proxy", async function () {
            await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
            const deployedBytecode: string = await ethers.provider.getCode(newProxyAddress);
            expect(deployedBytecode).to.equal(expectedBytecode);
          });

          it("updates the currentProxies mapping", async function () {
            await this.contracts.prbProxyRegistry.connect(deployer).deployFor(owner.address);
            const currentProxy: string = await this.contracts.prbProxyRegistry.getCurrentProxy(owner.address);
            expect(newProxyAddress).to.equal(currentProxy);
          });
        });
      });
    });
  });
}
