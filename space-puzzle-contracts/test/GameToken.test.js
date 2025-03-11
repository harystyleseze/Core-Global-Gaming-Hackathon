const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameToken", function () {
  let gameToken;
  let owner;
  let player;
  let gameContract;

  beforeEach(async function () {
    [owner, player, gameContract] = await ethers.getSigners();

    // Deploy GameToken
    const GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy();
    await gameToken.waitForDeployment();

    // Grant GAME_ROLE to the game contract
    const GAME_ROLE = await gameToken.GAME_ROLE();
    await gameToken.grantRole(GAME_ROLE, gameContract.address);
  });

  describe("Basic Token Functions", function () {
    it("Should have correct name and symbol", async function () {
      expect(await gameToken.name()).to.equal("Space Puzzle Key");
      expect(await gameToken.symbol()).to.equal("KEY");
    });

    it("Should assign roles correctly", async function () {
      const GAME_ROLE = await gameToken.GAME_ROLE();
      const MINTER_ROLE = await gameToken.MINTER_ROLE();

      expect(await gameToken.hasRole(GAME_ROLE, gameContract.address)).to.be
        .true;
      expect(await gameToken.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Key Tokenization", function () {
    it("Should allow players to tokenize keys", async function () {
      const amount = BigInt(10);

      // Player tokenizes keys
      await gameToken.connect(player).tokenizeKeys(amount);

      // Check balance
      expect(await gameToken.balanceOf(player.address)).to.equal(amount);
    });

    it("Should enforce tokenization limits", async function () {
      const maxAmount = await gameToken.MAX_TOKENIZE_AMOUNT();

      // Should fail when exceeding max amount
      await expect(
        gameToken.connect(player).tokenizeKeys(maxAmount + BigInt(1))
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should enforce cooldown period", async function () {
      // First tokenization
      await gameToken.connect(player).tokenizeKeys(BigInt(10));

      // Second tokenization should fail due to cooldown
      await expect(
        gameToken.connect(player).tokenizeKeys(BigInt(10))
      ).to.be.revertedWith("Tokenization on cooldown");
    });
  });

  describe("Key Management", function () {
    beforeEach(async function () {
      // Mint some tokens to player for testing
      await gameToken
        .connect(gameContract)
        .mintKeys(player.address, BigInt(100));
    });

    it("Should allow detokenizing keys", async function () {
      const amount = BigInt(50);

      // Get initial balance
      const initialBalance = await gameToken.balanceOf(player.address);

      // Detokenize keys
      await gameToken.connect(player).detokenizeKeys(amount);

      // Check new balance
      expect(await gameToken.balanceOf(player.address)).to.equal(
        initialBalance - amount
      );
    });

    it("Should allow game contract to burn keys", async function () {
      const amount = BigInt(30);

      // Get initial balance
      const initialBalance = await gameToken.balanceOf(player.address);

      // Burn keys
      await gameToken.connect(gameContract).burnKeys(player.address, amount);

      // Check new balance
      expect(await gameToken.balanceOf(player.address)).to.equal(
        initialBalance - amount
      );
    });

    it("Should allow checking key balance", async function () {
      const balance = await gameToken.keyBalance(player.address);
      expect(balance).to.equal(BigInt(100));
    });

    it("Should verify if player has enough keys", async function () {
      expect(await gameToken.hasEnoughKeys(player.address, BigInt(50))).to.be
        .true;
      expect(await gameToken.hasEnoughKeys(player.address, BigInt(150))).to.be
        .false;
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow admin to pause/unpause", async function () {
      // Pause
      await gameToken.pause();
      expect(await gameToken.paused()).to.be.true;

      // Operations should fail when paused
      await expect(
        gameToken.connect(player).tokenizeKeys(BigInt(10))
      ).to.be.revertedWith("Pausable: paused");

      // Unpause
      await gameToken.unpause();
      expect(await gameToken.paused()).to.be.false;

      // Operations should work after unpausing
      await gameToken.connect(player).tokenizeKeys(BigInt(10));
      expect(await gameToken.balanceOf(player.address)).to.equal(BigInt(10));
    });
  });
});
