const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RewardPool", function () {
  let rewardToken;
  let rewardPool;
  let owner;
  let player;
  let funder;

  beforeEach(async function () {
    [owner, player, funder] = await ethers.getSigners();

    // Deploy GameToken (as reward token)
    const GameToken = await ethers.getContractFactory("GameToken");
    rewardToken = await GameToken.deploy();
    await rewardToken.waitForDeployment();

    // Grant roles to funder
    const MINTER_ROLE = await rewardToken.MINTER_ROLE();
    const GAME_ROLE = await rewardToken.GAME_ROLE();
    await rewardToken.grantRole(MINTER_ROLE, funder.address);
    await rewardToken.grantRole(GAME_ROLE, funder.address);

    // Deploy RewardPool
    const RewardPool = await ethers.getContractFactory("RewardPool");
    rewardPool = await RewardPool.deploy(await rewardToken.getAddress());
    await rewardPool.waitForDeployment();

    // Fund the reward pool
    const fundAmount = ethers.parseEther("1000"); // 1000 tokens
    await rewardToken.connect(funder).mintKeys(funder.address, fundAmount);
    await rewardToken
      .connect(funder)
      .approve(await rewardPool.getAddress(), fundAmount);
    await rewardPool.connect(funder).fundRewardPool(fundAmount);
  });

  describe("Reward Pool Setup", function () {
    it("Should have correct reward token", async function () {
      expect(await rewardPool.rewardToken()).to.equal(
        await rewardToken.getAddress()
      );
    });

    it("Should have correct base reward", async function () {
      expect(await rewardPool.baseReward()).to.equal(ethers.parseEther("10")); // 10 tokens
    });
  });

  describe("Daily Rewards", function () {
    it("Should allow claiming daily reward", async function () {
      // First claim
      await rewardPool.connect(player).claimDailyReward();

      // Check player's balance (should be base reward)
      const baseReward = await rewardPool.baseReward();
      expect(await rewardToken.balanceOf(player.address)).to.equal(baseReward);
    });

    it("Should prevent claiming twice in same day", async function () {
      // First claim
      await rewardPool.connect(player).claimDailyReward();

      // Try to claim again
      await expect(
        rewardPool.connect(player).claimDailyReward()
      ).to.be.revertedWith("Cannot claim reward yet");
    });

    it("Should increase reward for consecutive days", async function () {
      // First day claim
      await rewardPool.connect(player).claimDailyReward();
      const firstReward = await rewardToken.balanceOf(player.address);

      // Advance time by 24 hours
      await time.increase(24 * 60 * 60);

      // Second day claim
      await rewardPool.connect(player).claimDailyReward();
      const secondReward = await rewardToken.balanceOf(player.address);

      // Second reward should be higher (2x base reward)
      expect(secondReward - firstReward).to.equal(firstReward * BigInt(2));
    });

    it("Should reset consecutive days after 48 hours", async function () {
      // First day claim
      await rewardPool.connect(player).claimDailyReward();

      // Advance time by 49 hours
      await time.increase(49 * 60 * 60);

      // Claim after gap
      await rewardPool.connect(player).claimDailyReward();

      // Check consecutive days (should be 1)
      expect(await rewardPool.getConsecutiveDays(player.address)).to.equal(1);
    });
  });

  describe("Reward Pool Management", function () {
    it("Should allow funding the reward pool", async function () {
      const fundAmount = ethers.parseEther("100");

      // Fund pool
      await rewardToken.connect(funder).mintKeys(funder.address, fundAmount);
      await rewardToken
        .connect(funder)
        .approve(await rewardPool.getAddress(), fundAmount);
      await rewardPool.connect(funder).fundRewardPool(fundAmount);

      // Check pool balance
      expect(
        await rewardToken.balanceOf(await rewardPool.getAddress())
      ).to.be.above(fundAmount);
    });

    it("Should provide correct reward information", async function () {
      // Check next reward amount
      const nextReward = await rewardPool.getNextRewardAmount(player.address);
      expect(nextReward).to.equal(await rewardPool.baseReward());

      // Claim reward
      await rewardPool.connect(player).claimDailyReward();

      // Check last claim time
      expect(await rewardPool.getLastClaimTime(player.address)).to.be.above(0);
    });
  });
});
