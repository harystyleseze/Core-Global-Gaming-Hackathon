// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRewardPool Interface
 * @dev Interface for the Space Puzzle reward pool system
 */
interface IRewardPool {
    /**
     * @dev Emitted when a player claims their daily reward
     * @param player Address of the player claiming reward
     * @param amount Amount of tokens rewarded
     * @param consecutiveDays Number of consecutive days claimed
     */
    event RewardClaimed(address indexed player, uint256 amount, uint256 consecutiveDays);

    /**
     * @dev Emitted when the reward pool is funded
     * @param funder Address funding the pool
     * @param amount Amount of tokens added to pool
     */
    event RewardPoolFunded(address indexed funder, uint256 amount);

    /**
     * @dev Claims daily reward for the caller
     * Requirements:
     * - Must be eligible to claim (24 hours since last claim)
     * - Reward pool must have sufficient balance
     */
    function claimDailyReward() external;

    /**
     * @dev Checks if a player can claim their daily reward
     * @param player Address to check
     * @return bool True if player can claim reward
     */
    function canClaimReward(address player) external view returns (bool);

    /**
     * @dev Calculates the reward amount for a player
     * @param player Address to calculate reward for
     * @return uint256 Amount of tokens to be rewarded
     */
    function calculateReward(address player) external view returns (uint256);

    /**
     * @dev Gets the amount of the next reward for a player
     * @param player Address to check
     * @return uint256 Amount of next reward
     */
    function getNextRewardAmount(address player) external view returns (uint256);

    /**
     * @dev Gets the timestamp of player's last reward claim
     * @param player Address to check
     * @return uint256 Timestamp of last claim
     */
    function getLastClaimTime(address player) external view returns (uint256);

    /**
     * @dev Gets the number of consecutive days a player has claimed
     * @param player Address to check
     * @return uint256 Number of consecutive days
     */
    function getConsecutiveDays(address player) external view returns (uint256);

    /**
     * @dev Adds tokens to the reward pool
     * @param amount Amount of tokens to add
     * Requirements:
     * - Caller must approve tokens first
     */
    function fundRewardPool(uint256 amount) external;
} 