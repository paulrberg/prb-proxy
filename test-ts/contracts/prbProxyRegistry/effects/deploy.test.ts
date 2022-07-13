import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { artifacts, ethers } from "hardhat";

import { computeProxyAddress } from "../../../shared/create2";

export function shouldBehaveLikeDeploy(): void {
  let deployer: SignerWithAddress;
  let proxyAddress: string;

  beforeEach(async function () {
    deployer = this.signers.alice;
    proxyAddress = await computeProxyAddress.call(this, deployer.address);
  });

  it("deploys the proxy", async function () {
    await this.contracts.prbProxyRegistry.connect(deployer).deploy();
    const deployedBytecode: string = await ethers.provider.getCode(proxyAddress);
    const expectedBytecode: string = (await artifacts.readArtifact("PRBProxy")).deployedBytecode;
    expect(deployedBytecode).to.equal(expectedBytecode);
  });

  it("updates the currentProxies mapping", async function () {
    await this.contracts.prbProxyRegistry.connect(deployer).deploy();
    const currentProxy: string = await this.contracts.prbProxyRegistry.getCurrentProxy(deployer.address);
    expect(proxyAddress).to.equal(currentProxy);
  });
}
