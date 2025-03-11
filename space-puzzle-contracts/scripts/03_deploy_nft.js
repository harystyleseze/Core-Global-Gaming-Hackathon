const hre = require("hardhat");

async function main() {
  console.log("Deploying SpacePuzzleNFT...");

  const SpacePuzzleNFT = await hre.ethers.getContractFactory("SpacePuzzleNFT");
  const nft = await SpacePuzzleNFT.deploy();
  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log("SpacePuzzleNFT deployed to:", nftAddress);

  return nftAddress;
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
