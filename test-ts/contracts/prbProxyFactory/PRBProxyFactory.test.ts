import { integrationFixturePrbProxyFactory } from "../../shared/fixtures";
import { shouldBehaveLikeDeploy } from "./effects/deploy.test";
import { shouldBehaveLikeDeployFor } from "./effects/deployFor.test";
import { shouldBehaveLikeVersionGetter } from "./view/version.test";

export function integrationTestPrbProxyFactory(): void {
  describe("PRBProxyFactory", function () {
    beforeEach(async function () {
      const { prbProxy, prbProxyFactory } = await this.loadFixture(integrationFixturePrbProxyFactory);
      this.contracts.prbProxy = prbProxy;
      this.contracts.prbProxyFactory = prbProxyFactory;
    });

    describe("View Functions", function () {
      shouldBehaveLikeVersionGetter();
    });

    describe("Effects Functions", function () {
      describe("deploy", function () {
        shouldBehaveLikeDeploy();
      });

      describe("deployFor", function () {
        shouldBehaveLikeDeployFor();
      });
    });
  });
}
