import { baseContext } from "../shared/contexts";
import { shouldBehaveLikeCreate2 } from "./create2.test";
import { shouldBehaveLikeSalts } from "./salts.test";

baseContext("PRBProxy TypeScript", function () {
  describe("create2", function () {
    shouldBehaveLikeCreate2();
  });

  describe("salts", function () {
    shouldBehaveLikeSalts();
  });
});
