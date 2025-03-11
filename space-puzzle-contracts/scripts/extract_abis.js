const fs = require("fs");
const path = require("path");

const contracts = ["GameToken", "RewardPool", "SpacePuzzleNFT"];

function extractABI(contractName) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  const abiPath = path.join(__dirname, "..", "abi", `${contractName}.json`);

  const artifact = require(artifactPath);
  const abi = {
    abi: artifact.abi,
  };

  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

  console.log(`Extracted ABI for ${contractName}`);
}

// Create abi directory if it doesn't exist
const abiDir = path.join(__dirname, "..", "abi");
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir);
}

// Extract ABIs
contracts.forEach(extractABI);
