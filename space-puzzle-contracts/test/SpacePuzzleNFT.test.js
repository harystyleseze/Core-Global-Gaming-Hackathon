const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SpacePuzzleNFT", function () {
  let nft;
  let owner;
  let player;
  let gameContract;

  beforeEach(async function () {
    [owner, player, gameContract] = await ethers.getSigners();

    // Deploy NFT contract
    const SpacePuzzleNFT = await ethers.getContractFactory("SpacePuzzleNFT");
    nft = await SpacePuzzleNFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Basic NFT Functions", function () {
    it("Should have correct name and symbol", async function () {
      expect(await nft.name()).to.equal("Space Puzzle Achievement");
      expect(await nft.symbol()).to.equal("SPACE");
    });
  });

  describe("Achievement Management", function () {
    let achievementId;

    beforeEach(async function () {
      // Create a test achievement
      const tx = await nft.createAchievement(
        "Master Explorer",
        "Complete 100 levels",
        3, // Rarity
        1000, // Required score
        10 // Required level
      );

      // Get achievement ID from event
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      achievementId = event.args[0]; // First argument is the achievement ID
    });

    it("Should create achievements correctly", async function () {
      const achievement = await nft.achievements(achievementId);

      expect(achievement.name).to.equal("Master Explorer");
      expect(achievement.description).to.equal("Complete 100 levels");
      expect(achievement.rarity).to.equal(3);
      expect(achievement.requiredScore).to.equal(1000);
      expect(achievement.requiredLevel).to.equal(10);
    });

    it("Should mint achievements to players", async function () {
      // Mint achievement
      await nft.mintAchievement(player.address, achievementId);

      // Check ownership
      const tokenId = BigInt(1); // First token
      expect(await nft.ownerOf(tokenId)).to.equal(player.address);

      // Check achievement is unlocked
      expect(await nft.isAchievementUnlocked(player.address, achievementId)).to
        .be.true;
    });

    it("Should prevent minting same achievement twice", async function () {
      // First mint
      await nft.mintAchievement(player.address, achievementId);

      // Second mint should fail
      await expect(
        nft.mintAchievement(player.address, achievementId)
      ).to.be.revertedWith("Achievement already unlocked");
    });

    it("Should track player achievements", async function () {
      // Create multiple achievements
      await nft.createAchievement("Achievement 1", "Description 1", 1, 100, 1);
      await nft.createAchievement("Achievement 2", "Description 2", 2, 200, 2);

      // Mint achievements to player
      await nft.mintAchievement(player.address, BigInt(1));
      await nft.mintAchievement(player.address, BigInt(2));

      // Get player achievements
      const achievements = await nft.getPlayerAchievements(player.address);
      expect(achievements.length).to.equal(2);
      expect(achievements[0]).to.equal(BigInt(1));
      expect(achievements[1]).to.equal(BigInt(2));
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to create achievements", async function () {
      await expect(
        nft
          .connect(player)
          .createAchievement("Test", "Test Description", 1, 100, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
