import { integrationFixturePrbProxyRegistry } from "../../shared/fixtures";
import { shouldBehaveLikeDeploy } from "./effects/deploy.test";
import { shouldBehaveLikeDeployFor } from "./effects/deployFor.test";

export function integrationTestPrbProxyRegistry(): void {
  describe("PRBProxyRegistry", function () {
    beforeEach(async function () {
      const { prbProxy, prbProxyFactory, prbProxyRegistry } = await this.loadFixture(
        integrationFixturePrbProxyRegistry,
      );
      this.contracts.prbProxy = prbProxy;
      this.contracts.prbProxyFactory = prbProxyFactory;
      this.contracts.prbProxyRegistry = prbProxyRegistry;
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
