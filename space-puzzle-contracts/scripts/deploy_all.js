const deployGameToken = require("./01_deploy_game_token");
const deployRewardPool = require("./02_deploy_reward_pool");
const deployNFT = require("./03_deploy_nft");

async function main() {
  console.log("Starting full deployment sequence...");

  // Deploy GameToken
  const gameTokenAddress = await deployGameToken();
  console.log("\nGameToken deployment completed.");

  // Deploy RewardPool
  process.env.GAME_TOKEN_ADDRESS = gameTokenAddress;
  const rewardPoolAddress = await deployRewardPool();
  console.log("\nRewardPool deployment completed.");

  // Deploy NFT
  const nftAddress = await deployNFT();
  console.log("\nSpacePuzzleNFT deployment completed.");

  // Log all addresses
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("GameToken:", gameTokenAddress);
  console.log("RewardPool:", rewardPoolAddress);
  console.log("SpacePuzzleNFT:", nftAddress);
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
