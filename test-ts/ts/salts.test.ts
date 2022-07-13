import { hexZeroPad } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import forEach from "mocha-each";

import { computeSalt } from "../../src/salts";
import { DEPLOYER_ADDRESS, SEED_ONE, SEED_ZERO } from "../shared/constants";

export function shouldBehaveLikeSalts(): void {
  context("when the deployer is not an address", function () {
    it("throws an error", function () {
      const deployer: string = "foo";
      const seed: string = SEED_ZERO;
      expect(() => computeSalt(deployer, seed)).to.throw("invalid address");
    });
  });

  context("when the deployer is an address", function () {
    context("when the seed is not 32 bytes length", function () {
      const testSets = ["0x01", hexZeroPad("0x00", 30), hexZeroPad("0x00", 34)];

      forEach(testSets).it("takes %.8s... and throws an error", function (seed: string) {
        const deployer: string = DEPLOYER_ADDRESS;
        expect(() => computeSalt(deployer, seed)).to.throw("incorrect data length");
      });
    });

    context("when the seed is 32 bytes length", function () {
      const testSets = [
        [AddressZero, SEED_ZERO, "0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5"],
        [AddressZero, SEED_ONE, "0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49"],
        [
          AddressZero,
          "0x250cf77c5e9ae4bc917c7f2cb1b42e3e5d7cd29de5199c2ac358ecb811311a59",
          "0x39813af9ef58284ab410fff46ad31ede626bf2ea5057543e761f6e60e03c0f33",
        ],
        [DEPLOYER_ADDRESS, SEED_ZERO, "0xab5b4c7b1f080a1009980b72695b134c2bc26e2404d7d8c0aad8e0108b6614fe"],
        [DEPLOYER_ADDRESS, SEED_ONE, "0x30d8ff48ad1f00de01113f04032d08d51f95396e349fd9a495ebedba63074e67"],
        [
          DEPLOYER_ADDRESS,
          "0x250cf77c5e9ae4bc917c7f2cb1b42e3e5d7cd29de5199c2ac358ecb811311a59",
          "0xe214b913f06976f771c70af97ff9972652453e81f56215893e0ef2f58cdfaac3",
        ],
      ];

      forEach(testSets).it(
        "takes %.6s... and %.8s... and returns %.8s...",
        function (deployer: string, seed: string, expected: string) {
          const result: string = computeSalt(deployer, seed);
          expect(expected).to.equal(result);
        },
      );
    });
  });
}
