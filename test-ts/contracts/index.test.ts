import { baseContext } from "../shared/contexts";
import { integrationTestPrbProxy } from "./prbProxy/PRBProxy.test";
import { integrationTestPrbProxyFactory } from "./prbProxyFactory/PRBProxyFactory.test";
import { integrationTestPrbProxyRegistry } from "./prbProxyRegistry/PRBProxyRegistry.test";

baseContext("PRBProxy Solidity", function () {
  integrationTestPrbProxy();
  integrationTestPrbProxyFactory();
  integrationTestPrbProxyRegistry();
});
