const { ethers } = require("hardhat");

async function main() {
  // Get signers for different roles
  const [deployer, player, gameContract] = await ethers.getSigners();
  console.log("Player address:", player.address);

  // Deploy all contracts
  console.log("\nDeploying contracts...");

  // 1. Deploy GameToken
  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.waitForDeployment();
  console.log("GameToken deployed to:", await gameToken.getAddress());

  // 2. Deploy RewardPool
  const RewardPool = await ethers.getContractFactory("RewardPool");
  const rewardPool = await RewardPool.deploy(await gameToken.getAddress());
  await rewardPool.waitForDeployment();
  console.log("RewardPool deployed to:", await rewardPool.getAddress());

  // 3. Deploy SpacePuzzleNFT
  const SpacePuzzleNFT = await ethers.getContractFactory("SpacePuzzleNFT");
  const nft = await SpacePuzzleNFT.deploy();
  await nft.waitForDeployment();
  console.log("SpacePuzzleNFT deployed to:", await nft.getAddress());

  // Setup roles and initial funding
  console.log("\nSetting up roles and initial funding...");

  const GAME_ROLE = await gameToken.GAME_ROLE();
  const MINTER_ROLE = await gameToken.MINTER_ROLE();

  await gameToken.grantRole(GAME_ROLE, gameContract.address);
  await gameToken.grantRole(MINTER_ROLE, gameContract.address);
  console.log("Roles granted to game contract");

  // Fund reward pool
  const fundAmount = ethers.parseEther("10000"); // 10,000 tokens for rewards
  await gameToken.connect(gameContract).mintKeys(deployer.address, fundAmount);
  await gameToken.approve(await rewardPool.getAddress(), fundAmount);
  await rewardPool.fundRewardPool(fundAmount);
  console.log(
    "Reward pool funded with",
    ethers.formatEther(fundAmount),
    "tokens"
  );

  // Example Game Interactions
  console.log("\n=== Example Game Interactions ===");

  // 1. Key Management
  console.log("\n--- Key Management ---");
  try {
    // Mint some keys to player (simulating game rewards)
    const keyAmount = ethers.parseEther("10");
    await gameToken.connect(gameContract).mintKeys(player.address, keyAmount);
    console.log("Minted", ethers.formatEther(keyAmount), "keys to player");

    // Player checks their key balance
    const keyBalance = await gameToken.keyBalance(player.address);
    console.log("Player key balance:", ethers.formatEther(keyBalance));

    // Player tokenizes some keys
    const tokenizeAmount = ethers.parseEther("5");
    await gameToken.connect(player).tokenizeKeys(tokenizeAmount);
    console.log("Player tokenized", ethers.formatEther(tokenizeAmount), "keys");

    // Check if player has enough keys for a game action
    const hasEnough = await gameToken.hasEnoughKeys(
      player.address,
      ethers.parseEther("3")
    );
    console.log("Player has enough keys for action:", hasEnough);

    // Simulate using keys in game
    await gameToken
      .connect(gameContract)
      .burnKeys(player.address, ethers.parseEther("2"));
    console.log("Burned 2 keys from player");
  } catch (error) {
    console.error("Error in key management:", error.message);
  }

  // 2. Daily Rewards
  console.log("\n--- Daily Rewards ---");
  try {
    // Player claims daily reward
    await rewardPool.connect(player).claimDailyReward();
    console.log("Player claimed daily reward");

    // Check player's consecutive days
    const consecutiveDays = await rewardPool.getConsecutiveDays(player.address);
    console.log("Player consecutive days:", consecutiveDays);

    // Check next reward amount
    const nextReward = await rewardPool.getNextRewardAmount(player.address);
    console.log(
      "Next reward amount:",
      ethers.formatEther(nextReward),
      "tokens"
    );

    // Simulate next day
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Check if can claim again
    const canClaim = await rewardPool.canClaimReward(player.address);
    console.log("Can claim reward again:", canClaim);
  } catch (error) {
    console.error("Error in daily rewards:", error.message);
  }

  // 3. Achievements
  console.log("\n--- Achievements ---");
  try {
    // Create some achievements
    await nft.createAchievement(
      "Space Explorer",
      "Complete 10 levels",
      1, // Rarity
      100, // Required score
      10 // Required level
    );
    console.log("Created 'Space Explorer' achievement");

    await nft.createAchievement(
      "Master Puzzler",
      "Complete 50 levels",
      3, // Rarity
      500, // Required score
      50 // Required level
    );
    console.log("Created 'Master Puzzler' achievement");

    // Mint achievement to player (simulating achievement unlock)
    await nft.mintAchievement(player.address, 1);
    console.log("Minted 'Space Explorer' achievement to player");

    // Check player's achievements
    const achievements = await nft.getPlayerAchievements(player.address);
    console.log(
      "Player achievements:",
      achievements.map((a) => a.toString())
    );

    // Check if player has specific achievement
    const hasAchievement = await nft.isAchievementUnlocked(player.address, 1);
    console.log("Player has Space Explorer achievement:", hasAchievement);
  } catch (error) {
    console.error("Error in achievements:", error.message);
  }

  // Print final balances and stats
  console.log("\n=== Final Status ===");
  const finalKeyBalance = await gameToken.balanceOf(player.address);
  const finalRewardBalance = await rewardToken.balanceOf(player.address);
  const totalAchievements = (await nft.getPlayerAchievements(player.address))
    .length;

  console.log("Final key balance:", ethers.formatEther(finalKeyBalance));
  console.log("Final reward balance:", ethers.formatEther(finalRewardBalance));
  console.log("Total achievements:", totalAchievements);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
