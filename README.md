# PRBProxy [![GitHub Actions][gha-badge]][gha] [![Coverage Status][coveralls-badge]][coveralls] [![Styled with Prettier][prettier-badge]][prettier] [![License: Unlicense][license-badge]][license]

[gha]: https://github.com/paulrberg/prb-proxy/actions
[gha-badge]: https://github.com/paulrberg/prb-proxy/actions/workflows/integration.yml/badge.svg
[coveralls]: https://coveralls.io/github/paulrberg/prb-proxy
[coveralls-badge]: https://coveralls.io/repos/github/paulrberg/prb-proxy/badge.svg?branch=main
[prettier]: https://prettier.io
[prettier-badge]: https://img.shields.io/badge/Code_Style-Prettier-ff69b4.svg
[license]: https://unlicense.org/
[license-badge]: https://img.shields.io/badge/License-Unlicense-blue.svg

**Proxy contract to compose Ethereum transactions on behalf of the owner.** Think of this as a smart wallet that enables
the execution of multiple contract calls in one transaction. Externally owned accounts (EOAs) do not have this feature; they are
limited to interacting with only one contract per transaction.

- Forwards calls with [DELEGATECALL][2]
- Uses [CREATE2][1] to deploy the proxies at deterministic addresses
- Employs a permission table to allow third-party accounts to call target contracts on behalf of the owner
- Reverts with custom errors instead of reason strings
- Well-documented via NatSpec comments
- Thoroughly tested with Hardhat and Waffle

## Background

The idea of a proxy contract has been popularized by [DappHub](https://github.com/dapphub), a team of developers who
helped create the decentralized stablecoin [DAI](https://makerdao.com). DappHub created
[DSProxy](https://github.com/dapphub/ds-proxy), which grew to become the [de
facto](https://ethereum.stackexchange.com/a/90304/24693) proxy contract for developers who need to execute multiple
contract calls in one transaction. For example, [Maker](https://makerdao.com), [Balancer](https://balancer.fi), and
[DeFi Saver](https://defisaver.com/) all use DSProxy.

The catch is that it got in years. The Ethereum development ecosystem is much different today compared to 2017,
when DSProxy was originally developed. The Solidity compiler has been significantly [improved](https://docs.soliditylang.org/en/v0.8.9/080-breaking-changes.html),
new OPCODES have been added to the EVM, and development environments like [Hardhat](https://hardhat.org/) make writing smart contracts a breeze.

PRBProxy is a modern version of DSProxy, a "DSProxy 2.0", if you will. PRBProxy still uses `DELEGATECALL` to forwards contract calls, though it employs the
[high-level instruction](https://ethereum.stackexchange.com/q/37601/24693) rather than inline assembly, which makes the
code easier to understand. All in all, there are two major improvements:

1. PRBProxy is deployed with [CREATE2][1], unlike DSProxy which is deployed with
   [CREATE](https://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed). This
   enables clients to deterministically compute the address of the proxy contract ahead of time.
2. A PRBProxy user can give permission to third-party accounts to call target contracts on their behalf.

DSProxy has a target contract [caching](https://github.com/dapphub/ds-proxy/blob/e17a2526ad5c9877ba925ff25c1119f519b7369b/src/proxy.sol#L130-L150)
functionality. Talking to the Maker team, I was told that this feature didn't really pick up steam. Thus I decided
not to include it in PRBProxy, making the bytecode smaller.

On the security front, I made three enhancements:

1. The CREATE2 seeds are generated in such a way that they cannot be front-run.
2. The owner cannot be changed during the `DELEGATECALL` operation.
3. A minimum gas reserve is saved in storage such that the proxy does not become unusable if EVM opcode gas costs change in the future.

A noteworthy knock-on effect of using `CREATE2` is that it eliminates the risk of a [chain
reorg](https://en.bitcoin.it/wiki/Chain_Reorganization) overriding the owner of the proxy. With DSProxy, one has to wait for a few blocks to be
mined before one can assume the contract to be safe to use. With PRBProxy, there is no such risk. It is even safe to send funds to the proxy _before_ it is deployed.

Although I covered a lot here, I barely scratched the surface on proxy contracts. Maker's developer guide [Working with
DSProxy](https://github.com/makerdao/developerguides/blob/master/devtools/working-with-dsproxy/working-with-dsproxy.md)
dives deep into how to compose contract calls. For the explanation given herein, that guide applies to PRBProxy as well;
just keep in mind the differences between the two.

## Install

With yarn:

```bash
$ yarn add @prb/proxy ethers@5
```

Or npm:

```bash
$ npm install @prb/proxy ethers@5
```

The trailing package is ethers.js, the only peer dependency of `@prb/proxy`.

## Usage

### Contracts

As an end user, you don't have to deploy the contracts by yourself.

To deploy your own proxy, you can use the registry at the address below. In fact, this is the recommended approach.

| Contract         | Address                                    |
| ---------------- | ------------------------------------------ |
| PRBProxyRegistry | 0x43fA1CFCacAe71492A36198EDAE602Fe80DdcA63 |
| PRBProxyFactory  | 0xb0C00C9B13a978D8F18bd2BAdc8ad1A123E843ED |

### Supported Chains

The address of the contracts are the same on all supported chains.

- [x] Ethereum Mainnet
- [x] Avalanche C-Chain
- [x] Binance Smart Chain Mainnet
- [x] Fantom Opera
- [x] Polygon Mainnet
- [x] Ethereum Goerli Testnet
- [x] Ethereum Kovan Testnet
- [x] Ethereum Rinkeby Testnet
- [x] Ethereum Ropsten Testnet

## Code Snippets

All snippets are written in TypeScript. It is assumed that you run them in a local [Hardhat](https://hardhat.org) project.
Familiarity with [Ethers](https://github.com/ethers-io/ethers.js) and
[TypeChain](https://github.com/ethereum-ts/TypeChain/tree/master/packages/hardhat) is also requisite.

Check out my [solidity-template](https://github.com/paulrberg/solidity-template) for a boilerplate that combines
Hardhat, Ethers and TypeChain.

### Target Contract

You need a "target" contract to do anything meaningful with PRBProxy. This is basically a collection of stateless
scripts. Below is an example for a target that performs a basic ERC-20 transfer.

Note that this is just a dummy example. In the real-world, you would do more complex work, e.g. interacting with a DeFi
protocol.

<details>
<summary>Code Snippet</summary>

```solidity
// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TargetERC20Transfer {
  function transferTokens(
    IERC20 token,
    uint256 amount,
    address to,
    address recipient
  ) external {
    // Transfer tokens from user to PRBProxy.
    token.transferFrom(msg.sender, to, amount);

    // Transfer tokens from PRBProxy to specific recipient.
    token.transfer(recipient, amount);
  }
}

```

</details>

### Compute Proxy Address

The `prb-proxy` package exports a helper function `computeProxyAddress` that can compute the address
of a PRBProxy before it is deployed. The function takes two arguments: `deployer` and `seed`. The first is
the EOA you sign the Ethereum transaction with. The second requires an explanation.

Neither `PRBProxyFactory` nor `PRBProxyRegistry` lets users provide a custom CREATE2 salt when deploying a proxy. Instead,
the factory contract maintains a mapping between
[tx.origin](https://ethereum.stackexchange.com/questions/109680/is-tx-origin-always-an-externally-owned-account-eoa)
accounts and some `bytes32` seeds, each of which starts at `0x00` and grows linearly from there. If you wonder I used
`tx.origin`, that's because it
[prevents](https://ethereum.stackexchange.com/questions/109272/how-to-prevent-front-running-the-salt-when-using-create2)
front-running the CREATE2 salt.

`PRBProxyFactory` increments the value of the seed each time a new proxy is deployed. To get hold of the next
seed that the factory will use, you can query the constant function `getNextSeed`. Putting it all together:

<details>
<summary>Code Snippet</summary>

```ts
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PRBProxyFactory, computeProxyAddress, getPRBProxyFactory } from "@prb/proxy";
import { task } from "hardhat/config";

task("compute-proxy-address").setAction(async function (_, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  // Load PRBProxyFactory as an ethers.js contract.
  const factory: PRBProxyFactory = getPRBProxyFactory(signers[0]);

  // Load the next seed. "signers[0]" is assumed to be the proxy deployer.
  const nextSeed: string = await factory.getNextSeed(signers[0].address);

  // Deterministically compute the address of the PRBProxy.
  const address: string = computeProxyAddress(signers[0].address, nextSeed);
});
```

</details>

### Deploy Proxy

<details>
<summary>Code Snippet</summary>

It is recommended to deploy the proxy via the `PRBProxyRegistry` contract. The registry guarantees that an owner
can have only one proxy at a time.

```ts
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PRBProxyRegistry, getPRBProxyRegistry } from "@prb/proxy";
import { task } from "hardhat/config";

task("deploy-proxy").setAction(async function (_, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  // Load PRBProxyRegistry as an ethers.js contract.
  const registry: PRBProxyRegistry = getPRBProxyRegistry(signers[0]);

  // Call contract function "deploy" to deploy a PRBProxy belonging to "msg.sender".
  const tx = await registry.deploy();

  // Wait for a block confirmation.
  await tx.wait(1);
});
```

</details>

### Get Current Proxy

Before deploying a new proxy, you may need to know if the account owns one already.

<details>
<summary>Code Snippet</summary>

```ts
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PRBProxyRegistry, getPRBProxyRegistry } from "@prb/proxy";
import { task } from "hardhat/config";

task("get-current-proxy").setAction(async function (_, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  // Load PRBProxyRegistry as an ethers.js contract.
  const registry: PRBProxyRegistry = getPRBProxyRegistry(signers[0]);

  // Query the address of the current proxy. "signers[0]" is assumed to be the proxy owner.
  const currentProxy: string = await registry.getCurrentProxy(signers[0].address);
});
```

</details>

### Execute Composite Call

This section assumes that you already own a PRBProxy and that you compiled and deployed the
[TargetERC20Transfer](./README.md#target-contract) contract in a local Hardhat project.

<details>
<summary>Code Snippet</summary>

```ts
import type { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PRBProxy, getPRBProxy } from "@prb/proxy";
import { task } from "hardhat/config";

import type { TargetERC20Transfer } from "../types/TargetERC20Transfer";
import { TargetERC20Transfer__factory } from "../types/factories/TargetERC20Transfer__factory";

task("execute-composite-call").setAction(async function (_, { ethers }) {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  // Load the PRBProxy as an ethers.js contract.
  const prbProxyAddress: string = "0x...";
  const prbProxy: PRBProxy = getPRBProxy(prbProxyAddress, signers[0]);

  // Load the TargetERC20Transfer as an ethers.js contract.
  const targetAddress: string = "0x...";
  const target: TargetERC20Transfer = TargetERC20Transfer__factory.connect(targetAddress, signers[0]);

  // Encode the target contract call as calldata.
  const tokenAddress: string = "0x...";
  const amount: BigNumber = parseUnits("100", 18); // assuming the token has 18 decimals
  const recipient: string = signers[1].address;
  const data: string = target.interface.encodeFunctionData("transferTokens", [tokenAddress, amount, recipient]);

  // Execute the composite call.
  const receipt = await prbProxy.execute(targetAddress, data, { gasLimit });
});
```

</details>

## Gas Efficiency

It costs 562,500 gas to deploy a PRBProxy, whereas DSProxy costs 596,198 gas. That's a slight reduction in deployment costs - but every little helps.

The `execute` function in PRBProxy costs a bit more than its equivalent in DSProxy. This is because of the additional
safety checks, but the lion's share of the gas cost when calling `execute` is due to the logic in the target contract.

## Security

While I set a high bar for code quality and test coverage, you shouldn't assume that this project is completely safe to
use. The contracts have not been audited by a security researcher.

### Caveat Emptor

This is experimental software and is provided on an "as is" and "as available" basis. I do not give any warranties and
will not be liable for any loss, direct or indirect through continued use of this codebase.

### Contact

If you discover any security issues, you can report them via [Keybase](https://keybase.io/paulrberg).

## Related Efforts

- [ds-proxy](https://github.com/dapphub/ds-proxy) - DappHub's proxy, which powers the Maker protocol.
- [wand](https://github.com/nmushegian/wand) - attempt to build DSProxy 2.0, started by one of the original authors of DSProxy.
- [dsa-contracts](https://github.com/Instadapp/dsa-contracts) - InstaDapp's DeFi Smart Accounts.

## Contributing

Feel free to dive in! [Open](https://github.com/paulrberg/prb-proxy/issues/new) an issue,
[start](https://github.com/paulrberg/prb-proxy/discussions/new) a discussion or submit a PR.

### Pre Requisites

You will need the following software on your machine:

- [Git](https://git-scm.com/downloads)
- [Node.Js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)

In addition, familiarity with [Solidity](https://soliditylang.org/), [TypeScript](https://typescriptlang.org/) and [Hardhat](https://hardhat.org) is requisite.

### Set Up

Install the dependencies:

```bash
$ yarn install
```

Then, create a `.env` file and follow the `.env.example` file to add the requisite environment variables. Now you can
start making changes.

## License

[Unlicense](./LICENSE.md) © Paul Razvan Berg

<!-- Links -->

[1]: https://eips.ethereum.org/EIPS/eip-1014
[2]: https://ethereum.stackexchange.com/questions/3667/difference-between-call-callcode-and-delegatecall/3672
