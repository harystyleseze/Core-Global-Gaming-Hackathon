const hre = require("hardhat");

async function main() {
  console.log("Deploying GameToken...");

  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.waitForDeployment();

  const gameTokenAddress = await gameToken.getAddress();
  console.log("GameToken deployed to:", gameTokenAddress);

  return gameTokenAddress;
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
