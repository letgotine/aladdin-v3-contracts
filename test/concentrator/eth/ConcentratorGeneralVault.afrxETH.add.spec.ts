/* eslint-disable camelcase */
/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { constants } from "ethers";
import { ethers, network } from "hardhat";
import {
  ADDRESS,
  DEPLOYED_CONTRACTS,
  TOKENS,
  AVAILABLE_VAULTS,
  ZAP_ROUTES,
  DEPLOYED_VAULTS,
} from "../../../scripts/utils";
import {
  AladdinZap,
  ConcentratorGateway,
  ConcentratorAladdinETHVault,
  IConvexBooster,
  IERC20,
} from "../../../typechain";
// eslint-disable-next-line camelcase
import { request_fork } from "../../utils";

const strategies: {
  factory: string;
  impls: { [name: string]: string };
} = {
  factory: "0x23384DD4380b3677b829C6c88c0Ea9cc41C099bb",
  impls: {
    AutoCompoundingConvexFraxStrategy: "0x6Cc546cE582b0dD106c231181f7782C79Ef401da",
    AutoCompoundingConvexCurveStrategy: constants.AddressZero,
    ManualCompoundingConvexCurveStrategy: "0xE25f0E29060AeC19a0559A2EF8366a5AF086222e",
    ManualCompoundingCurveGaugeStrategy: "0x188bd82BF11cC321F7872acdCa4B1a3Bf9a802dE",
    CLeverGaugeStrategy: constants.AddressZero,
    AMOConvexCurveStrategy: "0x2be5B652836C630E15c3530bf642b544ae901239",
  },
};

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
  "tBTC/crvWSBTC": {
    height: 16776780,
    pid: 21,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x9bC8d30d971C9e74298112803036C05db07D73e3",
    amount: "0.01",
    harvest: true,
  },
  "CRV/sdCRV": {
    height: 16776780,
    pid: 21,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xC5d3D004a223299C4F95Bb702534C14A32e8778c",
    amount: "10000",
    harvest: true,
  },
  "USDT/crvUSD": {
    height: 17377350,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "USDP/crvUSD": {
    height: 17377350,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "TUSD/crvUSD": {
    height: 17377350,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "USDC/crvUSD": {
    height: 17377350,
    pid: 24,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0x7a16fF8270133F063aAb6C9977183D9e72835428",
    amount: "10000",
    harvest: false,
  },
  "USDC/WBTC/ETH": {
    height: 17447590,
    pid: 28,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xeCb456EA5365865EbAb8a2661B0c503410e9B347",
    amount: "0.01",
    harvest: true,
  },
  "USDT/WBTC/ETH": {
    height: 17447590,
    pid: 28,
    deployer: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    holder: "0xeCb456EA5365865EbAb8a2661B0c503410e9B347",
    amount: "0.01",
    harvest: true,
  },
};

const BOOSTER = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const PRINT_ZAP = true;
const POOLS = (process.env.POOLS || "").split(",");

describe("ConcentratorGeneralVault.afrxETH.add.spec", async () => {
  let deployer: SignerWithAddress;
  let signer: SignerWithAddress;
  let lpToken: IERC20;
  let vault: ConcentratorAladdinETHVault;
  let zap: AladdinZap;
  let gateway: ConcentratorGateway;

  if (PRINT_ZAP) {
    DEPLOYED_VAULTS.afrxETH.forEach(({ name, fees }) => {
      const config = AVAILABLE_VAULTS[name];
      const fork = POOL_FORK_CONFIG[name];
      if (fork === undefined) {
        return;
      }
      if (!POOLS.includes(name)) return;

      console.log(
        `add pool[${name}]:`,
        `convexCurveID[${config.convexCurveID}]`,
        `gauge[${config.gauge}]`,
        `rewards[${config.rewards}]`,
        `withdrawFee[${fees.withdraw}]`,
        `platformFee[${fees.platform}]`,
        `harvestBounty[${fees.harvest}]`
      );
    });
    console.log("{");
    DEPLOYED_VAULTS.afrxETH.forEach(({ name }) => {
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
    strategy: string,
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

    context(`afrxETH vault for pool: ${name}`, async () => {
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
        if (ADDRESS[`${config.token}_DEPOSIT`]) {
          await zap.updatePoolTokens([ADDRESS[`${config.token}_DEPOSIT`]], [lpToken.address]);
        }
        for (const [symbol, routes] of Object.entries(config.withdraw)) {
          await zap.updateRoute(lpToken.address, ADDRESS[symbol], routes);
        }

        gateway = await ethers.getContractAt(
          "ConcentratorGateway",
          DEPLOYED_CONTRACTS.Concentrator.ConcentratorGateway,
          owner
        );
        await gateway.updateLogic(logic.address);

        const strategyName = `ManualCompounding${strategy}Strategy`;
        const factory = await ethers.getContractAt("ConcentratorStrategyFactory", strategies.factory, deployer);
        const strategyAddress = await factory.callStatic.createStrategy(strategies.impls[strategyName]);
        await factory.createStrategy(strategies.impls[strategyName]);
        const strategyContract = await ethers.getContractAt(strategyName, strategyAddress, deployer);
        const underlying = ADDRESS[`${config.token}_TOKEN`];

        vault = await ethers.getContractAt(
          "ConcentratorAladdinETHVault",
          DEPLOYED_CONTRACTS.Concentrator.frxETH.ConcentratorGeneralVault,
          owner
        );
        if (strategy === "ConvexCurve") {
          await strategyContract.initialize(vault.address, underlying, config.rewarder!, config.rewards);
        } else if (strategy === "CurveGauge") {
          await strategyContract.initialize(vault.address, underlying, config.gauge!, config.rewards);
        }
        await vault.addPool(underlying, strategyAddress, fees.withdraw, fees.platform, fees.harvest);
        await vault.updateHarvester(constants.AddressZero);
      });

      context("deposit", async () => {
        const amountLP = ethers.utils.parseEther(fork.amount);
        if (config.deposit.WETH !== undefined) {
          it("deposit, withdraw as ETH, deposit from ETH", async () => {
            // zap to ETH
            await lpToken.connect(signer).approve(zap.address, amountLP);
            const etherBefore = await signer.getBalance();
            const tx = await zap.connect(signer).zapFrom(lpToken.address, amountLP, constants.AddressZero, 0);
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
            expect(zapSharesOut).to.closeToBn(amountLP, amountLP.mul(2).div(100)); // 2% error
          });
        }

        Object.entries(config.deposit).forEach(([symbol, routes]) => {
          it(`deposit, withdraw as ${symbol}, deposit from ${symbol}`, async () => {
            const token = await ethers.getContractAt("IERC20", ADDRESS[symbol], signer);
            // zap to token
            await lpToken.connect(signer).approve(zap.address, amountLP);
            const tokenBefore = await token.balanceOf(signer.address);
            await zap.connect(signer).zapFrom(lpToken.address, amountLP, token.address, 0);
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
            expect(zapSharesOut).to.closeToBn(amountLP, amountLP.mul(2).div(100)); // 2% error
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
            await vault.connect(signer).deposit(fork.pid, signer.address, amountLP);
            const sharesOut = await vault.getUserShare(fork.pid, signer.address);
            expect(sharesOut).to.eq(amountLP);
          });

          it("should succeed", async () => {
            if (config.convexCurveID) {
              await booster.earmarkRewards(config.convexCurveID);
            }
            const timestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [timestamp + 86400 * 7]);
            await network.provider.send("evm_mine");

            const token = await ethers.getContractAt(
              "IERC20",
              DEPLOYED_CONTRACTS.Concentrator.frxETH.afrxETH,
              deployer
            );
            const amount = await vault.callStatic.harvest(fork.pid, deployer.address, 0);
            const before = await token.balanceOf(vault.address);
            await vault.harvest(fork.pid, deployer.address, 0);
            const after = await token.balanceOf(vault.address);
            console.log(
              "harvested ETH/frxETH LP:",
              ethers.utils.formatEther(amount),
              "afrxETH:",
              ethers.utils.formatEther(after.sub(before))
            );
            expect(amount).gt(constants.Zero);
          });
        });
      }
    });
  };

  DEPLOYED_VAULTS.afrxETH.forEach(({ name, fees, strategy }) => {
    genTests(name, strategy, fees);
  });
});
