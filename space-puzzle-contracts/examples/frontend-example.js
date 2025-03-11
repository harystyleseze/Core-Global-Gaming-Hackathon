// Deployed contract addresses on Core testnet
const DEPLOYED_ADDRESSES = {
  gameToken: "0x1cB328e8cc735000C5bdfF117Abf89709d93E995",
  rewardPool: "0xd34ADC4cdB838454d5961B042d8c554C8c10d5bb",
  nft: "0xdA642E774b6e75Af7Ef3D20828653617052eD9B9",
};

// Chain ID can be in hex or decimal format
const CORE_TESTNET_CHAIN_ID = 1114;
const CORE_TESTNET_CHAIN_ID_HEX = "0x45a";

let provider;
let gameHelper;
let signer;

// Event listeners setup
function setupEventListeners() {
  if (!gameHelper) return;

  gameHelper.setupEventListeners({
    onKeysTokenized: (player, amount) => {
      console.log(
        `${player} tokenized ${gameHelper.formatAmount(amount)} keys`
      );
      updateUI();
      addTransaction(`Tokenized ${gameHelper.formatAmount(amount)} keys`);
    },
    onKeysDetokenized: (player, amount) => {
      console.log(
        `${player} detokenized ${gameHelper.formatAmount(amount)} keys`
      );
      updateUI();
      addTransaction(`Detokenized ${gameHelper.formatAmount(amount)} keys`);
    },
    onRewardClaimed: (player, amount, consecutiveDays) => {
      console.log(
        `${player} claimed ${gameHelper.formatAmount(
          amount
        )} tokens (${consecutiveDays} consecutive days)`
      );
      updateUI();
      addTransaction(
        `Claimed ${gameHelper.formatAmount(amount)} tokens reward`
      );
    },
    onAchievementAdded: (id, name, rarity) => {
      console.log(
        `New achievement added: ${name} (ID: ${id}, Rarity: ${rarity})`
      );
      updateUI();
      addTransaction(`New achievement added: ${name}`);
    },
  });

  // Setup MetaMask event listeners
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
  }
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    document.getElementById("walletStatus").textContent =
      "Please connect your wallet";
    document.getElementById("gameContent").style.display = "none";
    document.getElementById("connectWalletBtn").disabled = false;
  } else {
    // Reload the page to avoid any state issues
    window.location.reload();
  }
}

// Handle network changes
function handleChainChanged(_chainId) {
  // Reload the page when the network changes
  window.location.reload();
}

// Helper functions for UI feedback
function showError(message) {
  const transactions = document.getElementById("transactions");
  transactions.innerHTML =
    `<div style="color: red">Error: ${message}</div>` + transactions.innerHTML;
}

function showSuccess(message) {
  const transactions = document.getElementById("transactions");
  transactions.innerHTML =
    `<div style="color: green">Success: ${message}</div>` +
    transactions.innerHTML;
}

function showInfo(message) {
  const transactions = document.getElementById("transactions");
  transactions.innerHTML =
    `<div style="color: blue">Info: ${message}</div>` + transactions.innerHTML;
}

function addTransaction(message) {
  const transactions = document.getElementById("transactions");
  const timestamp = new Date().toLocaleTimeString();
  transactions.innerHTML =
    `<div>${timestamp}: ${message}</div>` + transactions.innerHTML;
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Set up connect wallet button
  const connectButton = document.getElementById("connectWalletBtn");
  if (connectButton) {
    connectButton.onclick = connectWallet;
  } else {
    console.error("Connect wallet button not found!");
  }

  // Set up game action buttons
  const tokenizeBtn = document.getElementById("tokenizeBtn");
  const detokenizeBtn = document.getElementById("detokenizeBtn");
  const claimRewardBtn = document.getElementById("claimRewardBtn");
  const checkAchievementBtn = document.getElementById("checkAchievementBtn");

  if (tokenizeBtn) {
    tokenizeBtn.onclick = () => {
      const amount = document.getElementById("tokenizeAmount").value;
      tokenizeKeys(amount);
    };
  }

  if (detokenizeBtn) {
    detokenizeBtn.onclick = () => {
      const amount = document.getElementById("tokenizeAmount").value;
      detokenizeKeys(amount);
    };
  }

  if (claimRewardBtn) {
    claimRewardBtn.onclick = claimDailyReward;
  }

  if (checkAchievementBtn) {
    checkAchievementBtn.onclick = () => {
      const achievementId = document.getElementById("achievementId").value;
      checkAchievementProgress(achievementId);
    };
  }

  // Check if already connected
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
});

// Wallet connection handling
async function connectWallet() {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      showError("Please install MetaMask to use this application");
      return;
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Check if we're on the correct network
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const chainIdDecimal = parseInt(chainId, 16);

    if (chainIdDecimal !== CORE_TESTNET_CHAIN_ID) {
      document.getElementById("networkError").style.display = "block";
      try {
        // Try to switch to Core testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CORE_TESTNET_CHAIN_ID_HEX }],
        });
      } catch (switchError) {
        // If the network doesn't exist in MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: CORE_TESTNET_CHAIN_ID_HEX,
                  chainName: "Core Testnet",
                  nativeCurrency: {
                    name: "CORE",
                    symbol: "CORE",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.test2.btcs.network"],
                  blockExplorerUrls: ["https://scan.test2.btcs.network"],
                },
              ],
            });
          } catch (addError) {
            showError("Failed to add Core Testnet network to MetaMask");
            return;
          }
        } else {
          showError("Failed to switch to Core Testnet network");
          return;
        }
      }
    }

    // Initialize provider and contracts
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    // Update UI
    document.getElementById(
      "walletStatus"
    ).textContent = `Connected: ${address.substring(
      0,
      6
    )}...${address.substring(38)}`;
    document.getElementById("gameContent").style.display = "block";
    document.getElementById("connectWalletBtn").disabled = true;

    // Initialize game helper
    gameHelper = new GameContractHelper(provider);
    await gameHelper.init(DEPLOYED_ADDRESSES);

    // Set up event listeners
    setupEventListeners();

    // Update game UI
    await updateUI();
  } catch (error) {
    console.error("Error connecting wallet:", error);
    showError(error.message);
  }
}

// Game action functions
async function tokenizeKeys(amount) {
  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      showError("Please enter a valid amount of keys to tokenize");
      return;
    }

    // Validate amount is within limits
    if (amount > 100) {
      showError("Maximum tokenization amount is 100 keys");
      return;
    }

    // Check cooldown period first
    const playerAddress = await signer.getAddress();
    const lastTokenizeTime =
      await gameHelper.contracts.gameToken.lastTokenizeTime(playerAddress);
    const cooldownPeriod =
      await gameHelper.contracts.gameToken.TOKENIZE_COOLDOWN();
    const currentTime = Math.floor(Date.now() / 1000);

    if (lastTokenizeTime.gt(0)) {
      // If user has tokenized before
      const nextTokenizeTime = lastTokenizeTime.add(cooldownPeriod);
      if (nextTokenizeTime.gt(currentTime)) {
        const timeLeft = nextTokenizeTime.sub(currentTime).toNumber();
        const minutesLeft = Math.ceil(timeLeft / 60);
        showError(
          `Tokenization on cooldown. Please wait ${minutesLeft} minutes before trying again.`
        );
        return;
      }
    }

    // Show pending state
    const tokenizeBtn = document.getElementById("tokenizeBtn");
    const originalText = tokenizeBtn.textContent;
    tokenizeBtn.textContent = "Preparing Transaction...";
    tokenizeBtn.disabled = true;

    try {
      // Get the contract with signer
      const gameTokenContract = gameHelper.contracts.gameToken.connect(signer);

      // Convert amount to BigNumber
      const parsedAmount = ethers.BigNumber.from(amount);

      // Estimate gas with the full contract context
      let gasEstimate;
      try {
        gasEstimate = await gameTokenContract.estimateGas.tokenizeKeys(
          parsedAmount
        );
        showInfo("Gas estimated successfully");
      } catch (error) {
        console.error("Gas estimation failed:", error);
        // Use a safe default if estimation fails
        gasEstimate = ethers.BigNumber.from("300000");
        showInfo("Using default gas limit");
      }

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate.mul(120).div(100);

      // Update button text
      tokenizeBtn.textContent = "Confirm in MetaMask...";

      // Prepare and send transaction
      const tx = await gameTokenContract.tokenizeKeys(parsedAmount, {
        gasLimit: gasLimit,
      });

      showInfo(`Transaction submitted: ${tx.hash}`);
      tokenizeBtn.textContent = "Transaction Pending...";

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      showSuccess(
        `Successfully tokenized ${amount} keys. Transaction confirmed in block ${receipt.blockNumber}`
      );
      await updateUI(); // Refresh UI after successful transaction
    } finally {
      tokenizeBtn.textContent = originalText;
      tokenizeBtn.disabled = false;
    }
  } catch (error) {
    console.error("Error tokenizing keys:", error);
    if (error.code === 4001) {
      showError("Transaction was rejected by user");
    } else if (error.data?.message) {
      if (error.data.message.includes("Invalid amount")) {
        showError("Amount must be between 1 and 100 keys");
      } else if (error.data.message.includes("cooldown")) {
        showError(
          "Please wait for the cooldown period to end before tokenizing again"
        );
      } else {
        showError(error.data.message);
      }
    } else if (error.message) {
      showError(error.message);
    } else {
      showError("Failed to tokenize keys. Please try again.");
    }
  }
}

async function detokenizeKeys(amount) {
  try {
    if (!amount || amount <= 0) {
      showError("Please enter a valid amount of keys to detokenize");
      return;
    }

    // Check token balance first
    const playerAddress = await signer.getAddress();
    const balance = await gameHelper.getKeyBalance(playerAddress);
    const parsedAmount = gameHelper.parseAmount(amount.toString());

    if (balance.lt(parsedAmount)) {
      showError(
        `Insufficient token balance. You have ${gameHelper.formatAmount(
          balance
        )} tokens`
      );
      return;
    }

    // Show pending state
    const detokenizeBtn = document.getElementById("detokenizeBtn");
    const originalText = detokenizeBtn.textContent;
    detokenizeBtn.textContent = "Detokenizing...";
    detokenizeBtn.disabled = true;

    try {
      const tx = await gameHelper.detokenizeKeys(parsedAmount, signer);
      await tx.wait(); // Wait for transaction confirmation
      showSuccess(`Successfully detokenized ${amount} keys`);
      await updateUI(); // Refresh UI after successful transaction
    } finally {
      detokenizeBtn.textContent = originalText;
      detokenizeBtn.disabled = false;
    }
  } catch (error) {
    console.error("Error detokenizing keys:", error);
    if (error.data?.message) {
      showError(error.data.message);
    } else {
      showError(
        "Failed to detokenize keys. Please check your balance and try again."
      );
    }
  }
}

async function claimDailyReward() {
  try {
    const playerAddress = await signer.getAddress();

    // Check if can claim first
    const canClaim = await gameHelper.canClaimReward(playerAddress);
    if (!canClaim) {
      const lastClaimTime = await gameHelper.getLastClaimTime(playerAddress);
      const nextClaimTime = new Date(
        lastClaimTime.toNumber() * 1000 + 24 * 60 * 60 * 1000
      );
      showError(
        `Cannot claim reward yet. Next claim available at ${nextClaimTime.toLocaleString()}`
      );
      return;
    }

    // Check reward pool balance
    const rewardAmount = await gameHelper.getNextRewardAmount(playerAddress);
    const rewardToken = gameHelper.contracts.gameToken;
    const poolBalance = await rewardToken.balanceOf(
      DEPLOYED_ADDRESSES.rewardPool
    );
    const formattedReward = gameHelper.formatAmount(rewardAmount);
    const formattedBalance = gameHelper.formatAmount(poolBalance);

    if (poolBalance.lt(rewardAmount)) {
      showError(
        `The reward pool is empty. Required: ${formattedReward} tokens, Available: ${formattedBalance} tokens. Please contact the game admin to fund the reward pool.`
      );
      return;
    }

    // Show pending state
    const claimBtn = document.getElementById("claimRewardBtn");
    const originalText = claimBtn.textContent;
    claimBtn.textContent = "Claiming...";
    claimBtn.disabled = true;

    try {
      const tx = await gameHelper.claimDailyReward(signer);
      showInfo(`Transaction submitted: ${tx.hash}`);

      const receipt = await tx.wait();
      showSuccess(
        `Successfully claimed ${formattedReward} tokens! Transaction confirmed in block ${receipt.blockNumber}`
      );
      await updateUI();
    } finally {
      claimBtn.textContent = originalText;
      claimBtn.disabled = false;
    }
  } catch (error) {
    console.error("Error claiming reward:", error);
    if (error.code === 4001) {
      showError("Transaction was rejected by user");
    } else if (error.data?.message) {
      if (error.data.message.includes("transfer amount exceeds balance")) {
        showError(
          "The reward pool is currently empty. Please contact the game admin to fund the reward pool."
        );
      } else {
        showError(error.data.message);
      }
    } else {
      showError("Failed to claim reward. Please try again later.");
    }
  }
}

// Add this helper function at the top level
async function checkAchievementExists(achievementId) {
  try {
    const achievement = await gameHelper.contracts.nft.achievements(
      achievementId
    );
    return achievement.id.gt(0); // If id > 0, achievement exists
  } catch (error) {
    return false;
  }
}

// Update the checkAchievementProgress function
async function checkAchievementProgress(achievementId) {
  try {
    if (!achievementId || achievementId <= 0) {
      showError("Please enter a valid achievement ID");
      return;
    }

    // First check if achievement exists
    const exists = await checkAchievementExists(achievementId);
    if (!exists) {
      showInfo(
        `Achievement ${achievementId} has not been created yet. Only the game admin can create achievements.`
      );
      return;
    }

    const playerAddress = await signer.getAddress();
    const isUnlocked = await gameHelper.isAchievementUnlocked(
      playerAddress,
      achievementId
    );

    if (isUnlocked) {
      showSuccess(`Achievement ${achievementId} already unlocked!`);
      return;
    }

    // Get achievement details
    const achievement = await gameHelper.contracts.nft.achievements(
      achievementId
    );
    showInfo(`
      Achievement: ${achievement.name}
      Description: ${achievement.description}
      Rarity: ${achievement.rarity}
      Required Score: ${achievement.requiredScore}
      Required Level: ${achievement.requiredLevel}
    `);
  } catch (error) {
    console.error("Error checking achievement progress:", error);
    showError("Failed to check achievement progress. Please try again.");
  }
}

// Update the UI update function to show more details
async function updateUI() {
  if (!gameHelper || !signer) return;

  try {
    const playerAddress = await signer.getAddress();

    // Update key balance
    const keyBalance = await gameHelper.getKeyBalance(playerAddress);
    document.getElementById(
      "keyBalance"
    ).textContent = `${gameHelper.formatAmount(keyBalance)} keys`;

    // Update daily reward status
    const canClaim = await gameHelper.canClaimReward(playerAddress);
    const nextReward = await gameHelper.getNextRewardAmount(playerAddress);
    const consecutiveDays = await gameHelper.getConsecutiveDays(playerAddress);
    const lastClaimTime = await gameHelper.getLastClaimTime(playerAddress);

    let rewardStatusText = `
            Can claim: ${canClaim ? "Yes" : "No"}<br>
            Next reward: ${gameHelper.formatAmount(nextReward)} tokens<br>
            Consecutive days: ${consecutiveDays}<br>
        `;

    if (!canClaim && lastClaimTime.gt(0)) {
      const nextClaimTime = new Date(
        lastClaimTime.toNumber() * 1000 + 24 * 60 * 60 * 1000
      );
      rewardStatusText += `Next claim available at: ${nextClaimTime.toLocaleString()}<br>`;
    }

    document.getElementById("rewardStatus").innerHTML = rewardStatusText;

    // Update achievements
    const achievements = await gameHelper.getPlayerAchievements(playerAddress);
    const achievementsList = document.getElementById("achievements");
    achievementsList.innerHTML =
      achievements.length === 0 ? "<p>No achievements unlocked yet</p>" : "";

    for (const achievementId of achievements) {
      const details = await gameHelper.getAchievementDetails(achievementId);
      achievementsList.innerHTML += `
                <div class="achievement">
                    <h3>${details.name}</h3>
                    <p>${details.description}</p>
                    <p>Rarity: ${details.rarity}</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error updating UI:", error);
    showError(
      "Failed to update UI. Please check your connection and try again."
    );
  }
}
