import type { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, MaxUint256, Zero } from "@ethersproject/constants";
import { parseEther } from "@ethersproject/units";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { PRBProxyErrors, PanicCodes } from "../../../shared/errors";
import { bn } from "../../../shared/numbers";

export function shouldBehaveLikeExecute(): void {
  let envoy: SignerWithAddress;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    envoy = this.signers.bob;
    owner = this.signers.alice;
  });

  context("when the caller is not authorized", function () {
    context("when the caller does not have permission for anything", function () {
      it("reverts", async function () {
        const raider: SignerWithAddress = this.signers.carol;
        const target = this.contracts.targets.envoy.address;
        const data: string = this.contracts.targets.envoy.interface.encodeFunctionData("foo");
        await expect(this.contracts.prbProxy.connect(raider).execute(target, data)).to.be.revertedWith(
          PRBProxyErrors.EXECUTION_NOT_AUTHORIZED,
        );
      });
    });

    context("when the caller has permission for a different target", function () {
      beforeEach(async function () {
        const target = this.contracts.targets.echo.address;
        const selector: string = this.contracts.targets.echo.interface.getSighash("echoUint256");
        await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);
      });

      it("reverts", async function () {
        const target = this.contracts.targets.envoy.address;
        const data: string = this.contracts.targets.envoy.interface.encodeFunctionData("foo");
        await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
          PRBProxyErrors.EXECUTION_NOT_AUTHORIZED,
        );
      });
    });

    context("when the caller has permission for a different function than the one being called", function () {
      let target: string;

      beforeEach(async function () {
        target = this.contracts.targets.envoy.address;
        const selector: string = this.contracts.targets.envoy.interface.getSighash("bar");
        await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);
      });

      it("reverts", async function () {
        const data: string = this.contracts.targets.envoy.interface.encodeFunctionData("foo");
        await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
          PRBProxyErrors.EXECUTION_NOT_AUTHORIZED,
        );
      });
    });
  });

  context("when the caller is authorized", function () {
    context("when the target is not a contract", function () {
      context("when the target is the zero address", function () {
        const data: string = "0x";
        const target: string = AddressZero;

        it("reverts", async function () {
          await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
            PRBProxyErrors.TARGET_INVALID,
          );
        });
      });

      context("when the target is not the zero address", function () {
        const data: string = "0x";
        const target: string = "0x0000000000000000000000000000000000000001";

        it("reverts", async function () {
          await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
            PRBProxyErrors.TARGET_INVALID,
          );
        });
      });
    });

    context("when the target is a contract", function () {
      context("when the gas stipend calculation results into an underflow", function () {
        const gasLimit: BigNumber = bn("2e6");
        let data: string;
        let selector: string;
        let target: string;

        beforeEach(async function () {
          (async () => {
            const target: string = this.contracts.targets.minGasReserve.address;
            const data: string = this.contracts.targets.minGasReserve.interface.encodeFunctionData("setMinGasReserve", [
              gasLimit.add(1),
            ]);
            await this.contracts.prbProxy.connect(owner).execute(target, data);
          })();
          target = this.contracts.targets.echo.address;
          data = this.contracts.targets.echo.interface.encodeFunctionData("echoUint256", [Zero]);
          selector = this.contracts.targets.echo.interface.getSighash("echoUint256");
          await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);
        });

        it("reverts", async function () {
          await expect(this.contracts.prbProxy.connect(owner).execute(target, data, { gasLimit })).to.be.revertedWith(
            PanicCodes.ARITHMETIC_OVERFLOW_OR_UNDERFLOW,
          );
          await expect(this.contracts.prbProxy.connect(envoy).execute(target, data, { gasLimit })).to.be.revertedWith(
            PanicCodes.ARITHMETIC_OVERFLOW_OR_UNDERFLOW,
          );
        });
      });

      context("when the gas stipend calculation does not result into an underflow", function () {
        context("when the owner was changed during the delegate call", function () {
          let data: string;
          let selector: string;
          let target: string;

          beforeEach(async function () {
            target = this.contracts.targets.changeOwner.address;
            data = this.contracts.targets.changeOwner.interface.encodeFunctionData("changeOwner");
            selector = this.contracts.targets.changeOwner.interface.getSighash("changeOwner");
            await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);
          });

          it("reverts", async function () {
            await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
              PRBProxyErrors.OWNER_CHANGED,
            );
            await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
              PRBProxyErrors.OWNER_CHANGED,
            );
          });
        });

        context("when the owner was not changed during the delegate call", function () {
          context("when the delegate call does not succeed", function () {
            context("when the exception is a panic", function () {
              let target: string;

              beforeEach(async function () {
                target = this.contracts.targets.panic.address;
              });

              it("panics due to assert", async function () {
                const data: string = this.contracts.targets.panic.interface.encodeFunctionData("panicAssert");
                const selector: string = this.contracts.targets.panic.interface.getSighash("panicAssert");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  PanicCodes.ASSERT,
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  PanicCodes.ASSERT,
                );
              });

              it("panics due to division by zero", async function () {
                const data: string = this.contracts.targets.panic.interface.encodeFunctionData("panicDivisionByZero");
                const selector: string = this.contracts.targets.panic.interface.getSighash("panicDivisionByZero");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  PanicCodes.DIVISION_BY_ZERO,
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  PanicCodes.DIVISION_BY_ZERO,
                );
              });

              it("panics due to arithmetic overflow", async function () {
                const data: string =
                  this.contracts.targets.panic.interface.encodeFunctionData("panicArithmeticOverflow");
                const selector: string = this.contracts.targets.panic.interface.getSighash("panicArithmeticOverflow");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  PanicCodes.ARITHMETIC_OVERFLOW_OR_UNDERFLOW,
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  PanicCodes.ARITHMETIC_OVERFLOW_OR_UNDERFLOW,
                );
              });

              it("panics due to arithmetic underflow", async function () {
                const data: string =
                  this.contracts.targets.panic.interface.encodeFunctionData("panicArithmeticUnderflow");
                const selector: string = this.contracts.targets.panic.interface.getSighash("panicArithmeticUnderflow");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  PanicCodes.ARITHMETIC_OVERFLOW_OR_UNDERFLOW,
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  PanicCodes.ARITHMETIC_OVERFLOW_OR_UNDERFLOW,
                );
              });
            });

            context("when the exception is an error", function () {
              let target: string;

              beforeEach(async function () {
                target = this.contracts.targets.revert.address;
              });

              it("reverts due to lack of payable modifier", async function () {
                const data: string =
                  this.contracts.targets.revert.interface.encodeFunctionData("revertLackPayableModifier");
                const selector: string =
                  this.contracts.targets.revert.interface.getSighash("revertLackPayableModifier");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(
                  this.contracts.prbProxy.connect(owner).execute(target, data, { value: parseEther("3.14") }),
                ).to.be.revertedWith(PRBProxyErrors.EXECUTION_REVERTED);
                await expect(
                  this.contracts.prbProxy.connect(envoy).execute(target, data, { value: parseEther("3.14") }),
                ).to.be.revertedWith(PRBProxyErrors.EXECUTION_REVERTED);
              });

              // Improve this when https://github.com/nomiclabs/hardhat/issues/1618 gets fixed.
              it("reverts with custom error", async function () {
                const data: string =
                  this.contracts.targets.revert.interface.encodeFunctionData("revertWithCustomError");
                const selector: string = this.contracts.targets.revert.interface.getSighash("revertWithCustomError");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.reverted;
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.reverted;
              });

              it("reverts with nothing", async function () {
                const data: string = this.contracts.targets.revert.interface.encodeFunctionData("revertWithNothing");
                const selector: string = this.contracts.targets.revert.interface.getSighash("revertWithNothing");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  PRBProxyErrors.EXECUTION_REVERTED,
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  PRBProxyErrors.EXECUTION_REVERTED,
                );
              });

              it("reverts with reason", async function () {
                const data: string = this.contracts.targets.revert.interface.encodeFunctionData("revertWithReason");
                const selector: string = this.contracts.targets.revert.interface.getSighash("revertWithReason");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  "This is a reason",
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  "This is a reason",
                );
              });

              it("reverts with require", async function () {
                const data: string = this.contracts.targets.revert.interface.encodeFunctionData("revertWithRequire");
                const selector: string = this.contracts.targets.revert.interface.getSighash("revertWithRequire");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                await expect(this.contracts.prbProxy.connect(owner).execute(target, data)).to.be.revertedWith(
                  PRBProxyErrors.EXECUTION_REVERTED,
                );
                await expect(this.contracts.prbProxy.connect(envoy).execute(target, data)).to.be.revertedWith(
                  PRBProxyErrors.EXECUTION_REVERTED,
                );
              });
            });
          });

          context("when the delegate call succeeds", function () {
            context("when ether is sent", function () {
              it("returns the ether amount back", async function () {
                const target: string = this.contracts.targets.echo.address;
                const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoMsgValue");
                const selector: string = this.contracts.targets.echo.interface.getSighash("echoMsgValue");
                await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                const sentAmount: BigNumber = parseEther("3.14");
                const ownerResponse: string = await this.contracts.prbProxy
                  .connect(owner)
                  .callStatic.execute(target, data, { value: sentAmount });
                expect(sentAmount).to.equal(bn(ownerResponse));

                const envoyResponse: string = await this.contracts.prbProxy
                  .connect(envoy)
                  .callStatic.execute(target, data, { value: sentAmount });
                expect(sentAmount).to.equal(bn(envoyResponse));
              });
            });

            context("when ether is not sent", function () {
              context("when the target self destructs", function () {
                const etherAmount: BigNumber = parseEther("3.14");
                let data: string;
                let target: string;

                beforeEach(async function () {
                  target = this.contracts.targets.selfDestruct.address;
                  data = this.contracts.targets.selfDestruct.interface.encodeFunctionData("destroyMe", [AddressZero]);
                  await this.signers.alice.sendTransaction({
                    to: this.contracts.prbProxy.address,
                    value: etherAmount,
                  });
                });

                context("when the caller is the owner", function () {
                  it("returns an empty response and sends the ether to the selfdestruct recipient", async function () {
                    const response: string = await this.contracts.prbProxy
                      .connect(owner)
                      .callStatic.execute(target, data);
                    expect(response).to.equal("0x");

                    await this.contracts.prbProxy.connect(owner).execute(target, data);
                    const balance: BigNumber = await ethers.provider.getBalance(AddressZero);
                    expect(balance).to.equal(etherAmount);
                  });
                });

                context("when the caller is the envoy", function () {
                  beforeEach(async function () {
                    const selector: string = this.contracts.targets.selfDestruct.interface.getSighash("destroyMe");
                    await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);
                  });

                  it("returns an empty response and sends the ether to the selfdestruct recipient", async function () {
                    const response: string = await this.contracts.prbProxy
                      .connect(envoy)
                      .callStatic.execute(target, data);
                    expect(response).to.equal("0x");

                    await this.contracts.prbProxy.connect(envoy).execute(target, data);
                    const balance: BigNumber = await ethers.provider.getBalance(AddressZero);
                    expect(balance).to.equal(etherAmount);
                  });
                });
              });

              context("when the target does not self destruct", function () {
                let target: string;

                beforeEach(async function () {
                  target = this.contracts.targets.echo.address;
                });

                it("returns the response as address", async function () {
                  const address: string = "0x0000000000000000000000000000000000000001";
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoAddress", [
                    address,
                  ]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoAddress");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  const decodedResponses: string[] = responses.map(response => {
                    return this.contracts.targets.echo.interface
                      .decodeFunctionResult("echoAddress", response)
                      .toString();
                  });
                  expect(address).to.equal(decodedResponses[0]);
                  expect(address).to.equal(decodedResponses[1]);
                });

                it("returns the response as array", async function () {
                  const array: BigNumber[] = [bn("3"), bn("1"), bn("4")];
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoArray", [array]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoArray");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  const decodedResponses: BigNumber[][] = responses.map(response => {
                    return <BigNumber[]>(
                      this.contracts.targets.echo.interface.decodeFunctionResult("echoArray", response)[0]
                    );
                  });
                  const rawArray: number[] = array.map(x => x.toNumber());
                  expect(rawArray).to.have.all.members(decodedResponses[0].map(x => x.toNumber()));
                  expect(rawArray).to.have.all.members(decodedResponses[1].map(x => x.toNumber()));
                });

                it("returns the response as bytes", async function () {
                  const bytes: string = "0x602a423dfb9fc3767163c83caa68f6578d12c5f93e0157078c2382c59243d9e1";
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoBytes", [bytes]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoBytes");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  const decodedResponses: string[] = responses.map(response => {
                    return this.contracts.targets.echo.interface.decodeFunctionResult("echoBytes", response).toString();
                  });
                  expect(bytes).to.equal(decodedResponses[0]);
                  expect(bytes).to.equal(decodedResponses[1]);
                });

                it("returns the response as bytes32", async function () {
                  const bytes32: string = "0xfc9dd41a581a55690af49d7b0943aa18aa5007089f11a3d738dfdcae43a2ef69";
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoBytes32", [
                    bytes32,
                  ]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoBytes32");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  expect(bytes32).to.equal(responses[0]);
                  expect(bytes32).to.equal(responses[1]);
                });

                it("returns the response as string", async function () {
                  const someString: string = "This is a string";
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoString", [
                    someString,
                  ]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoString");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  const decodedResponses: string[] = responses.map(response => {
                    return this.contracts.targets.echo.interface
                      .decodeFunctionResult("echoString", response)
                      .toString();
                  });
                  expect(someString).to.equal(decodedResponses[0]);
                  expect(someString).to.equal(decodedResponses[1]);
                });

                it("returns the response as struct", async function () {
                  const struct = { foo: bn("3"), bar: bn("1"), baz: bn("4") };
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoStruct", [struct]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoStruct");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  const decodedResponses = responses.map(response => {
                    return <typeof struct>(
                      this.contracts.targets.echo.interface.decodeFunctionResult("echoStruct", response)[0]
                    );
                  });
                  expect(struct.foo).to.equal(decodedResponses[0].foo);
                  expect(struct.foo).to.equal(decodedResponses[1].foo);

                  expect(struct.bar).to.equal(decodedResponses[0].bar);
                  expect(struct.bar).to.equal(decodedResponses[1].bar);

                  expect(struct.baz).to.equal(decodedResponses[0].baz);
                  expect(struct.baz).to.equal(decodedResponses[0].baz);
                });

                it("returns the response as uint8", async function () {
                  const uint8: BigNumber = bn("127");
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoUint8", [uint8]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoUint8");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  expect(uint8).to.equal(bn(responses[0]));
                  expect(uint8).to.equal(bn(responses[1]));
                });

                it("returns the response as uint256", async function () {
                  const uint256: BigNumber = MaxUint256;
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoUint256", [
                    uint256,
                  ]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoUint256");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  const responses: string[] = await Promise.all([
                    this.contracts.prbProxy.connect(owner).callStatic.execute(target, data),
                    this.contracts.prbProxy.connect(envoy).callStatic.execute(target, data),
                  ]);
                  expect(uint256).to.equal(bn(responses[0]));
                  expect(uint256).to.equal(bn(responses[1]));
                });

                it("emits an Execute event", async function () {
                  const uint256: BigNumber = MaxUint256;
                  const data: string = this.contracts.targets.echo.interface.encodeFunctionData("echoUint256", [
                    uint256,
                  ]);
                  const selector: string = this.contracts.targets.echo.interface.getSighash("echoUint256");
                  await this.contracts.prbProxy.connect(owner).setPermission(envoy.address, target, selector, true);

                  await expect(this.contracts.prbProxy.connect(owner).execute(target, data))
                    .to.emit(this.contracts.prbProxy, "Execute")
                    .withArgs(target, data, uint256);
                  await expect(this.contracts.prbProxy.connect(envoy).execute(target, data))
                    .to.emit(this.contracts.prbProxy, "Execute")
                    .withArgs(target, data, uint256);
                });
              });
            });
          });
        });
      });
    });
  });
}
