import type { Signer } from "@ethersproject/abstract-signer";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { PRBProxy } from "../../src/types/PRBProxy";
import type { PRBProxyFactory } from "../../src/types/PRBProxyFactory";
import type { PRBProxyRegistry } from "../../src/types/PRBProxyRegistry";
import { PRBProxy__factory } from "../../src/types/factories/PRBProxy__factory";
import type { Create2Utility } from "../../src/types/test/Create2Utility";
import type { TargetChangeOwner } from "../../src/types/test/TargetChangeOwner";
import type { TargetEcho } from "../../src/types/test/TargetEcho";
import type { TargetEnvoy } from "../../src/types/test/TargetEnvoy";
import type { TargetMinGasReserve } from "../../src/types/test/TargetMinGasReserve";
import type { TargetPanic } from "../../src/types/test/TargetPanic";
import type { TargetRevert } from "../../src/types/test/TargetRevert";
import type { TargetSelfDestruct } from "../../src/types/test/TargetSelfDestruct";

type IntegrationFixturePrbProxyReturnType = {
  prbProxy: PRBProxy;
  targets: {
    changeOwner: TargetChangeOwner;
    echo: TargetEcho;
    envoy: TargetEnvoy;
    minGasReserve: TargetMinGasReserve;
    panic: TargetPanic;
    revert: TargetRevert;
    selfDestruct: TargetSelfDestruct;
  };
};

export async function integrationFixturePrbProxy(signers: Signer[]): Promise<IntegrationFixturePrbProxyReturnType> {
  const deployer: Signer = signers[0];

  const prbProxyFactoryArtifact: Artifact = await artifacts.readArtifact("PRBProxyFactory");
  const prbProxyFactory: PRBProxyFactory = <PRBProxyFactory>(
    await waffle.deployContract(deployer, prbProxyFactoryArtifact, [])
  );

  const deployerAddress: string = await deployer.getAddress();
  const prbProxyAddress: string = await prbProxyFactory.connect(deployer).callStatic.deployFor(deployerAddress);
  await prbProxyFactory.connect(deployer).deployFor(deployerAddress);
  const prbProxy: PRBProxy = PRBProxy__factory.connect(prbProxyAddress, deployer);

  const targetChangeOwnerArtifact: Artifact = await artifacts.readArtifact("TargetChangeOwner");
  const targetChangeOwner: TargetChangeOwner = <TargetChangeOwner>(
    await waffle.deployContract(deployer, targetChangeOwnerArtifact, [])
  );

  const targetEchoArtifact: Artifact = await artifacts.readArtifact("TargetEcho");
  const targetEcho: TargetEcho = <TargetEcho>await waffle.deployContract(deployer, targetEchoArtifact, []);

  const targetEnvoyArtifact: Artifact = await artifacts.readArtifact("TargetEnvoy");
  const targetEnvoy: TargetEnvoy = <TargetEnvoy>await waffle.deployContract(deployer, targetEnvoyArtifact, []);

  const targetPanicArtifact: Artifact = await artifacts.readArtifact("TargetPanic");
  const targetPanic: TargetPanic = <TargetPanic>await waffle.deployContract(deployer, targetPanicArtifact, []);

  const targetRevertArtifact: Artifact = await artifacts.readArtifact("TargetRevert");
  const targetRevert: TargetRevert = <TargetRevert>await waffle.deployContract(deployer, targetRevertArtifact, []);

  const targetSelfDestructArtifact: Artifact = await artifacts.readArtifact("TargetSelfDestruct");
  const targetSelfDestruct: TargetSelfDestruct = <TargetSelfDestruct>(
    await waffle.deployContract(deployer, targetSelfDestructArtifact, [])
  );

  const targetMinGasReserveArtifact: Artifact = await artifacts.readArtifact("TargetMinGasReserve");
  const targetMinGasReserve: TargetMinGasReserve = <TargetMinGasReserve>(
    await waffle.deployContract(deployer, targetMinGasReserveArtifact, [])
  );

  return {
    prbProxy,
    targets: {
      changeOwner: targetChangeOwner,
      echo: targetEcho,
      envoy: targetEnvoy,
      minGasReserve: targetMinGasReserve,
      panic: targetPanic,
      revert: targetRevert,
      selfDestruct: targetSelfDestruct,
    },
  };
}

type IntegrationFixturePrbProxyFactoryReturnType = {
  prbProxy: PRBProxy;
  prbProxyFactory: PRBProxyFactory;
};

export async function integrationFixturePrbProxyFactory(
  signers: Signer[],
): Promise<IntegrationFixturePrbProxyFactoryReturnType> {
  const deployer: Signer = signers[0];

  const prbProxyArtifact: Artifact = await artifacts.readArtifact("PRBProxy");
  const prbProxy: PRBProxy = <PRBProxy>await waffle.deployContract(deployer, prbProxyArtifact, []);

  const prbProxyFactoryArtifact: Artifact = await artifacts.readArtifact("PRBProxyFactory");
  const prbProxyFactory: PRBProxyFactory = <PRBProxyFactory>(
    await waffle.deployContract(deployer, prbProxyFactoryArtifact, [])
  );

  return { prbProxy, prbProxyFactory };
}

type IntegrationFixturePrbProxyRegistryReturnType = {
  prbProxy: PRBProxy;
  prbProxyFactory: PRBProxyFactory;
  prbProxyRegistry: PRBProxyRegistry;
};

export async function integrationFixturePrbProxyRegistry(
  signers: Signer[],
): Promise<IntegrationFixturePrbProxyRegistryReturnType> {
  const deployer: Signer = signers[0];

  const prbProxyArtifact: Artifact = await artifacts.readArtifact("PRBProxy");
  const prbProxy: PRBProxy = <PRBProxy>await waffle.deployContract(deployer, prbProxyArtifact, []);

  const prbProxyFactoryArtifact: Artifact = await artifacts.readArtifact("PRBProxyFactory");
  const prbProxyFactory: PRBProxyFactory = <PRBProxyFactory>(
    await waffle.deployContract(deployer, prbProxyFactoryArtifact, [])
  );

  const prbProxyRegistryArtifact: Artifact = await artifacts.readArtifact("PRBProxyRegistry");
  const prbProxyRegistry: PRBProxyRegistry = <PRBProxyRegistry>(
    await waffle.deployContract(deployer, prbProxyRegistryArtifact, [prbProxyFactory.address])
  );

  return { prbProxy, prbProxyFactory, prbProxyRegistry };
}

type IntegrationFixtureCreate2Utility = {
  create2Utility: Create2Utility;
};

export async function integrationFixtureCreate2Utility(signers: Signer[]): Promise<IntegrationFixtureCreate2Utility> {
  const deployer: Signer = signers[0];

  const create2UtilityArtifact: Artifact = await artifacts.readArtifact("Create2Utility");
  const create2Utility: Create2Utility = <Create2Utility>(
    await waffle.deployContract(deployer, create2UtilityArtifact, [])
  );

  return { create2Utility };
}
