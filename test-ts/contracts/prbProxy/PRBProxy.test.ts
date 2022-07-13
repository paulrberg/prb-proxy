import { integrationFixturePrbProxy } from "../../shared/fixtures";
import { shouldBehaveLikeExecute } from "./effects/execute.test";
import { shouldBehaveLikeReceive } from "./effects/receive.test";
import { shouldBehaveLikeSetPermission } from "./effects/setPermission.test";
import { shouldBehaveLikeTransferOwnership } from "./effects/transferOwnership.test";

export function integrationTestPrbProxy(): void {
  describe("PRBProxy", function () {
    beforeEach(async function () {
      const { prbProxy, targets } = await this.loadFixture(integrationFixturePrbProxy);
      this.contracts.prbProxy = prbProxy;
      this.contracts.targets.changeOwner = targets.changeOwner;
      this.contracts.targets.echo = targets.echo;
      this.contracts.targets.envoy = targets.envoy;
      this.contracts.targets.minGasReserve = targets.minGasReserve;
      this.contracts.targets.panic = targets.panic;
      this.contracts.targets.revert = targets.revert;
      this.contracts.targets.selfDestruct = targets.selfDestruct;
    });

    describe("Effects Functions", function () {
      describe("execute", function () {
        shouldBehaveLikeExecute();
      });

      describe("receive", function () {
        shouldBehaveLikeReceive();
      });

      describe("setPermission", function () {
        shouldBehaveLikeSetPermission();
      });

      describe("transferOwnership", function () {
        shouldBehaveLikeTransferOwnership();
      });
    });
  });
}
