/* eslint-disable camelcase */
/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { constants } from "ethers";
import { ethers } from "hardhat";
import {
  ADDRESS,
  DEPLOYED_CONTRACTS,
  TOKENS,
  AVAILABLE_VAULTS,
  ZAP_ROUTES,
  DEPLOYED_VAULTS,
} from "../../../scripts/utils";
import { AladdinZap, ConcentratorGateway, ConcentratorIFOVault, IConvexBooster, IERC20 } from "../../../typechain";
// eslint-disable-next-line camelcase
import { request_fork } from "../../utils";

const POOL_FORK_CONFIG: {
  [name: string]: {
    height: number;
    pid: number;
    deployer: string;
    holder: string;
    amount: string;
    harvest: boolean;
  };
} = {
  silofrax: {
    height: 15193360,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xabc508dda7517f195e416d77c822a4861961947a",
    amount: "1000",
    harvest: true,
  },
  tusd: {
    height: 15193360,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xd34f3e85bb7c8020c7959b80a4b87a369d639dc0",
    amount: "1000",
    harvest: false,
  },
  susdfraxbp: {
    height: 15193360,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x99F4176EE457afedFfCB1839c7aB7A030a5e4A92",
    amount: "1000",
    harvest: false,
  },
  busdfraxbp: {
    height: 15193360,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xB1748C79709f4Ba2Dd82834B8c82D4a505003f27",
    amount: "1000",
    harvest: false,
  },
  alusdfraxbp: {
    height: 15193360,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x5180db0237291a6449dda9ed33ad90a38787621c",
    amount: "1000",
    harvest: false,
  },
  tusdfraxbp: {
    height: 15193360,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x5180db0237291a6449dda9ed33ad90a38787621c",
    amount: "1000",
    harvest: false,
  },
  lusdfraxbp: {
    height: 15190189,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xb1748c79709f4ba2dd82834b8c82d4a505003f27",
    amount: "1000",
    harvest: false,
  },
  peth: {
    height: 15876065,
    pid: 31,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x51c2cef9efa48e08557a361b52db34061c025a1b",
    amount: "10",
    harvest: true,
  },
  cbeth: {
    height: 15876065,
    pid: 31,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16ff8270133f063aab6c9977183d9e72835428",
    amount: "10",
    harvest: false,
  },
  frxeth: {
    height: 15876065,
    pid: 31,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xda035641151d42aa4a25ce51de8f6e53eae0ded7",
    amount: "10",
    harvest: false,
  },
  blusd: {
    height: 16245350,
    pid: 34,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xa5cd3bc3f3d34b3a716111643e19db88bfa649c7",
    amount: "10000",
    harvest: true,
  },
  sbtc2: {
    height: 16248720,
    pid: 34,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16ff8270133f063aab6c9977183d9e72835428",
    amount: "1",
    harvest: false,
  },
  multibtc: {
    height: 16340740,
    pid: 36,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x6ae7bf291028ccf52991bd020d2dc121b40bce2a",
    amount: "0.00001",
    harvest: true,
  },
  clevcvx: {
    height: 16434600,
    pid: 37,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x1aceff73c5c3afc630c1fc8b484527a23f4eb134",
    amount: "10",
    harvest: false,
  },
  clevusd: {
    height: 16434600,
    pid: 37,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xb957dccaa1ccfb1eb78b495b499801d591d8a403",
    amount: "10",
    harvest: false,
  },
  "ETH/CLEV": {
    height: 16524480,
    pid: 39,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x0a27dab612e9f254417ea61598de46e88f3d1730",
    amount: "1",
    harvest: true,
  },
  "ETH/rETH": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x17fd68F4F3035A1b51E6e662238784001f76A8F9",
    amount: "1",
    harvest: false,
  },
  "GEAR/ETH": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7338afb07db145220849B04A45243956f20B14d9",
    amount: "1000",
    harvest: true,
  },
  "WETH/stETH": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xD1caD198fa57088C01f2B6a8c64273ef6D1eC085",
    amount: "10",
    harvest: false,
  },
  "STG/USDC": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xA489e9daf10cEd86811d59e4D00ce1b0DEC95f5e",
    amount: "1000",
    harvest: true,
  },
  "ETH/LDO": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xdB5F9b2869Cec66382790cFE883fbBFa8a1f6B27",
    amount: "10",
    harvest: true,
  },
  "ETH/MATIC": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x3732FE38e7497Da670bd0633D565a5d80D3565e2",
    amount: "1000",
    harvest: true,
  },
  "ETH/CNC": {
    height: 16701141,
    pid: 40,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x4e122c62742eB4811659f6d85fdA51cC63764940",
    amount: "10",
    harvest: true,
  },
  "tBTC/crvWSBTC": {
    height: 16776780,
    pid: 47,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x9bC8d30d971C9e74298112803036C05db07D73e3",
    amount: "0.01",
    harvest: true,
  },
  "ETH/CTR": {
    height: 16776780,
    pid: 47,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xC62eECc24cb6E84dA2409e945Ddcf7386118c57a",
    amount: "100",
    harvest: false,
  },
  "USDP/3CRV": {
    height: 16889700,
    pid: 49,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x4e7c361be194Beb26C3666225d4A7301b917Ea87",
    amount: "1000",
    harvest: false,
  },
  "CRV/cvxCRV": {
    height: 16889700,
    pid: 49,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xecdED8b1c603cF21299835f1DFBE37f10F2a29Af",
    amount: "10000",
    harvest: false,
  },
  "eCFX/ETH": {
    height: 17033000,
    pid: 51,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7D7a9bFC87256AfaE4186FB8fBf5c2588D12118d",
    amount: "10000",
    harvest: false,
  },
  "rETH/frxETH": {
    height: 17108720,
    pid: 52,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xB1748C79709f4Ba2Dd82834B8c82D4a505003f27",
    amount: "10",
    harvest: true,
  },
  "stETH/frxETH": {
    height: 17108720,
    pid: 52,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xB1748C79709f4Ba2Dd82834B8c82D4a505003f27",
    amount: "20",
    harvest: true,
  },
  "cbETH/frxETH": {
    height: 17108720,
    pid: 52,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xB1748C79709f4Ba2Dd82834B8c82D4a505003f27",
    amount: "15",
    harvest: true,
  },
  "sETH/frxETH": {
    height: 17108720,
    pid: 52,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xB1748C79709f4Ba2Dd82834B8c82D4a505003f27",
    amount: "15",
    harvest: true,
  },
  "FRAX/USDP": {
    height: 17108720,
    pid: 52,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x39E761E4F039Ed77286F393c948AD6716170F897",
    amount: "10000",
    harvest: true,
  },
  "UZD/FRAXBP": {
    height: 17252690,
    pid: 57,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xF9605D8c4c987d7Cb32D0d11FbCb8EeeB1B22D5d",
    amount: "100",
    harvest: true,
  },
  "ETH/wBETH": {
    height: 17252690,
    pid: 57,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xE6DA683076b7eD6ce7eC972f21Eb8F91e9137a17",
    amount: "0.1",
    harvest: false,
  },
  "USDT/crvUSD": {
    height: 17377350,
    pid: 59,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "USDP/crvUSD": {
    height: 17377350,
    pid: 59,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "TUSD/crvUSD": {
    height: 17377350,
    pid: 59,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "USDC/crvUSD": {
    height: 17377350,
    pid: 59,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "USDC/WBTC/ETH": {
    height: 17447590,
    pid: 63,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xeCb456EA5365865EbAb8a2661B0c503410e9B347",
    amount: "0.01",
    harvest: true,
  },
  "USDT/WBTC/ETH": {
    height: 17447590,
    pid: 63,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xeCb456EA5365865EbAb8a2661B0c503410e9B347",
    amount: "0.01",
    harvest: true,
  },
  "ETH/stETH-ng": {
    height: 17497260,
    pid: 65,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x0FCbf9A4398C15d6609580879681Aa5382FF8542",
    amount: "10",
    harvest: true,
  },
};

const BOOSTER = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const PRINT_ZAP = true;
const POOLS = (process.env.POOLS || "").split(",");

describe("ConcentratorIFOVault.add.spec", async () => {
  let deployer: SignerWithAddress;
  let signer: SignerWithAddress;
  let lpToken: IERC20;
  let vault: ConcentratorIFOVault;
  let zap: AladdinZap;
  let gateway: ConcentratorGateway;

  if (PRINT_ZAP) {
    DEPLOYED_VAULTS.aCRV.forEach(({ name, fees }) => {
      const config = AVAILABLE_VAULTS[name];
      const fork = POOL_FORK_CONFIG[name];
      if (fork === undefined) {
        return;
      }
      if (!POOLS.includes(name)) return;

      console.log(
        `add pool[${name}]:`,
        `convexCurveID[${config.convexCurveID}]`,
        `rewards[${config.rewards}]`,
        `withdrawFee[${fees.withdraw}]`,
        `platformFee[${fees.platform}]`,
        `harvestBounty[${fees.harvest}]`
      );
    });
    console.log("{");
    DEPLOYED_VAULTS.aCRV.forEach(({ name }) => {
      const config = AVAILABLE_VAULTS[name];
      const fork = POOL_FORK_CONFIG[name];
      if (fork === undefined) {
        return;
      }
      if (!POOLS.includes(name)) return;

      console.log(`  "${name}": [`);
      Object.entries(config.deposit).forEach(([symbol, routes]) => {
        if (symbol === "WETH") {
          console.log(
            `    {"symbol": "ETH", "address": "${constants.AddressZero}", "routes": [${routes
              .map((x) => `"${x.toHexString()}"`)
              .join(",")}]},`
          );
        }
        console.log(
          `    {"symbol": "${symbol}", "address": "${TOKENS[symbol].address}", "routes": [${routes
            .map((x) => `"${x.toHexString()}"`)
            .join(",")}]},`
        );
      });
      console.log(`  ],`);
    });
    console.log("}");
  }

  const genTests = async (
    name: string,
    fees: {
      withdraw: number;
      harvest: number;
      platform: number;
    }
  ) => {
    const config = AVAILABLE_VAULTS[name];
    const fork = POOL_FORK_CONFIG[name];
    if (fork === undefined) {
      return;
    }
    if (!POOLS.includes(name)) return;

    context(`ifo for pool: ${name}`, async () => {
      beforeEach(async () => {
        request_fork(fork.height, [
          fork.deployer,
          fork.holder,
          DEPLOYED_CONTRACTS.CommunityMultisig,
          DEPLOYED_CONTRACTS.ManagementMultisig,
          DEPLOYED_CONTRACTS.Concentrator.Treasury,
        ]);
        deployer = await ethers.getSigner(fork.deployer);
        signer = await ethers.getSigner(fork.holder);
        const manager = await ethers.getSigner(DEPLOYED_CONTRACTS.ManagementMultisig);
        const owner = await ethers.getSigner(DEPLOYED_CONTRACTS.Concentrator.Treasury);

        await deployer.sendTransaction({ to: signer.address, value: ethers.utils.parseEther("10") });
        await deployer.sendTransaction({ to: manager.address, value: ethers.utils.parseEther("10") });
        await deployer.sendTransaction({ to: owner.address, value: ethers.utils.parseEther("10") });

        lpToken = await ethers.getContractAt("IERC20", ADDRESS[`${config.token}_TOKEN`]);

        const TokenZapLogic = await ethers.getContractFactory("TokenZapLogic", deployer);
        const logic = await TokenZapLogic.deploy();
        await logic.deployed();

        // upgrade zap contract
        const proxyAdmin = await ethers.getContractAt("ProxyAdmin", DEPLOYED_CONTRACTS.Concentrator.ProxyAdmin, owner);
        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        const impl = await AladdinZap.deploy();
        await proxyAdmin.upgrade(DEPLOYED_CONTRACTS.AladdinZap, impl.address);
        zap = await ethers.getContractAt("AladdinZap", DEPLOYED_CONTRACTS.AladdinZap, manager);

        // setup withdraw zap
        await zap.updatePoolTokens([ADDRESS[`${config.token}_POOL`]], [lpToken.address]);
        await zap.updatePoolTokens([ADDRESS.CURVE_LUSD3CRV_POOL], [ADDRESS.CURVE_LUSD3CRV_TOKEN]);
        if (ADDRESS[`${config.token}_DEPOSIT`]) {
          await zap.updatePoolTokens([ADDRESS[`${config.token}_DEPOSIT`]], [lpToken.address]);
        }
        for (const [symbol, routes] of Object.entries(config.withdraw)) {
          await zap.updateRoute(lpToken.address, ADDRESS[symbol], routes);
        }

        gateway = await ethers.getContractAt(
          "ConcentratorGateway",
          DEPLOYED_CONTRACTS.Concentrator.ConcentratorGateway,
          manager
        );
        const gatewayOwner = await ethers.getSigner(await gateway.owner());
        await gateway.connect(gatewayOwner).updateLogic(logic.address);

        vault = await ethers.getContractAt(
          "ConcentratorIFOVault",
          DEPLOYED_CONTRACTS.Concentrator.cvxCRV.ConcentratorIFOVault,
          owner
        );
        await vault.updateHarvester(constants.AddressZero).catch((_) => {});
        await vault.addPool(config.convexCurveID!, config.rewards, fees.withdraw, fees.platform, fees.harvest);
      });

      context("deposit", async () => {
        const amountLP = ethers.utils.parseEther(fork.amount);
        if (config.deposit.WETH !== undefined) {
          it("deposit, withdraw as ETH, deposit from ETH", async () => {
            // deposit
            await lpToken.connect(signer).approve(vault.address, amountLP);
            await vault.connect(signer)["deposit(uint256,uint256)"](fork.pid, amountLP);
            const sharesOut = await vault.getUserShare(fork.pid, signer.address);
            expect(sharesOut).to.eq(amountLP);
            // withdraw to ETH
            const etherBefore = await signer.getBalance();
            const tx = await vault.connect(signer).withdrawAndZap(fork.pid, sharesOut, constants.AddressZero, 0);
            expect(await vault.getUserShare(fork.pid, signer.address)).to.eq(constants.Zero);
            const receipt = await tx.wait();
            const baseFee = (await ethers.provider.getFeeData()).lastBaseFeePerGas!;
            const effectiveGasPrice = tx.gasPrice ? tx.gasPrice : baseFee.add(tx.maxPriorityFeePerGas!);
            const etherAfter = await signer.getBalance();
            expect(etherAfter.add(receipt.gasUsed.mul(effectiveGasPrice))).gt(etherBefore);
            // zap from ETH
            const amountIn = etherAfter.add(receipt.gasUsed.mul(effectiveGasPrice)).sub(etherBefore);
            await gateway
              .connect(signer)
              .deposit(
                vault.address,
                fork.pid,
                constants.AddressZero,
                lpToken.address,
                amountIn,
                config.deposit.WETH,
                0,
                {
                  value: amountIn,
                }
              );
            const zapSharesOut = await vault.getUserShare(fork.pid, signer.address);
            console.log(
              `amountLP[${ethers.utils.formatEther(amountLP)}]`,
              `amountIn[${ethers.utils.formatEther(amountIn)}]`,
              `zapSharesOut[${ethers.utils.formatEther(zapSharesOut)}]`
            );
            expect(zapSharesOut).to.gt(constants.Zero);
            expect(zapSharesOut).to.closeToBn(sharesOut, sharesOut.mul(2).div(100)); // 2% error
          });
        }

        Object.entries(config.deposit).forEach(([symbol, routes]) => {
          it(`deposit, withdraw as ${symbol}, deposit from ${symbol}`, async () => {
            // deposit
            await lpToken.connect(signer).approve(vault.address, amountLP);
            await vault.connect(signer)["deposit(uint256,uint256)"](fork.pid, amountLP);
            const sharesOut = await vault.getUserShare(fork.pid, signer.address);
            expect(sharesOut).to.eq(amountLP);
            // withdraw to token
            const token = await ethers.getContractAt("IERC20", ADDRESS[symbol], signer);
            const tokenBefore = await token.balanceOf(signer.address);
            await vault.connect(signer).withdrawAndZap(fork.pid, sharesOut, token.address, 0);
            const tokenAfter = await token.balanceOf(signer.address);
            expect(tokenAfter.gt(tokenBefore));
            // zap from token
            const amountIn = tokenAfter.sub(tokenBefore);
            await token.approve(gateway.address, constants.MaxUint256);
            await gateway
              .connect(signer)
              .deposit(vault.address, fork.pid, token.address, lpToken.address, amountIn, routes, 0);
            const zapSharesOut = await vault.getUserShare(fork.pid, signer.address);
            console.log(
              `amountLP[${ethers.utils.formatEther(amountLP)}]`,
              `amountIn[${ethers.utils.formatUnits(amountIn, TOKENS[symbol].decimals)}]`,
              `zapSharesOut[${ethers.utils.formatEther(zapSharesOut)}]`
            );
            expect(zapSharesOut).to.gt(constants.Zero);
            expect(zapSharesOut).to.closeToBn(sharesOut, sharesOut.mul(2).div(100)); // 2% error
          });
        });
      });

      if (fork.harvest) {
        context("harvest", async () => {
          const amountLP = ethers.utils.parseEther(fork.amount);
          let booster: IConvexBooster;
          let firstCall = true;

          beforeEach(async () => {
            booster = await ethers.getContractAt("IConvexBooster", BOOSTER, deployer);
            for (const reward of config.rewards) {
              const symbol = Object.entries(ADDRESS).find(([, address]) => address === reward)![0];
              if (symbol === "CRV") continue;
              const routes = ZAP_ROUTES[symbol].WETH;
              if (firstCall) {
                console.log(
                  `harvest zap ${symbol}=>WETH:`,
                  `from[${reward}]`,
                  `to[${ADDRESS.WETH}]`,
                  `routes[${routes.toString()}]`
                );
              }
              await zap.updateRoute(reward, ADDRESS.WETH, routes);
            }
            firstCall = false;

            await lpToken.connect(signer).approve(vault.address, amountLP);
            await vault.connect(signer)["deposit(uint256,uint256)"](fork.pid, amountLP);
            const sharesOut = await vault.getUserShare(fork.pid, signer.address);
            expect(sharesOut).to.eq(amountLP);
          });

          it("should succeed", async () => {
            await booster.earmarkRewards(config.convexCurveID!);
            const token = await ethers.getContractAt("IERC20", DEPLOYED_CONTRACTS.Concentrator.cvxCRV.aCRV, deployer);
            const amount = await vault.callStatic.harvest(fork.pid, deployer.address, 0);
            const before = await token.balanceOf(vault.address);
            await vault.harvest(fork.pid, deployer.address, 0);
            const after = await token.balanceOf(vault.address);
            console.log(
              "harvested cvxCRV:",
              ethers.utils.formatEther(amount),
              "aCRV:",
              ethers.utils.formatEther(after.sub(before))
            );
            expect(amount).gt(constants.Zero);
          });
        });
      }
    });
  };

  DEPLOYED_VAULTS.aCRV.forEach(({ name, fees }) => {
    genTests(name, fees);
  });
});
