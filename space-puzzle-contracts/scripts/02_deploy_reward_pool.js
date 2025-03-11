const hre = require("hardhat");
const deployGameToken = require("./01_deploy_game_token");

async function main() {
  console.log("Starting RewardPool deployment...");

  // Deploy GameToken first if not provided
  const gameTokenAddress =
    process.env.GAME_TOKEN_ADDRESS || (await deployGameToken());
  console.log("Using GameToken at:", gameTokenAddress);

  // Deploy RewardPool
  console.log("Deploying RewardPool...");
  const RewardPool = await hre.ethers.getContractFactory("RewardPool");
  const rewardPool = await RewardPool.deploy(gameTokenAddress);
  await rewardPool.waitForDeployment();

  const rewardPoolAddress = await rewardPool.getAddress();
  console.log("RewardPool deployed to:", rewardPoolAddress);

  return rewardPoolAddress;
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

module.exports = main;
