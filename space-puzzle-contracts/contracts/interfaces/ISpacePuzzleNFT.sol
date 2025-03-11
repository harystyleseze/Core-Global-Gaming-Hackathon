// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libraries/GameTypes.sol";

/**
 * @title ISpacePuzzleNFT Interface
 * @dev Interface for the Space Puzzle achievement NFT system
 */
interface ISpacePuzzleNFT {
    /**
     * @dev Emitted when a new achievement is added to the system
     * @param achievementId ID of the new achievement
     * @param name Name of the achievement
     * @param rarity Rarity level of the achievement
     */
    event NewAchievementAdded(uint256 indexed achievementId, string name, uint256 rarity);

    /**
     * @dev Emitted when a player unlocks an achievement
     * @param player Address of the player
     * @param achievementId ID of the achievement unlocked
     * @param tokenId ID of the NFT minted
     */
    event AchievementUnlocked(address indexed player, uint256 indexed achievementId, uint256 tokenId);

    /**
     * @dev Creates a new achievement type
     * @param name Name of the achievement
     * @param description Description of the achievement
     * @param rarity Rarity level (1-5)
     * @param requiredScore Score required to unlock
     * @param requiredLevel Level required to unlock
     * @return uint256 ID of the new achievement
     * Requirements:
     * - Caller must be contract owner
     */
    function createAchievement(
        string memory name,
        string memory description,
        uint256 rarity,
        uint256 requiredScore,
        uint256 requiredLevel
    ) external returns (uint256);

    /**
     * @dev Mints an achievement NFT to a player
     * @param player Address to receive the NFT
     * @param achievementId ID of the achievement to mint
     * Requirements:
     * - Achievement must exist
     * - Player must not already have the achievement
     */
    function mintAchievement(address player, uint256 achievementId) external;

    /**
     * @dev Gets all achievements unlocked by a player
     * @param player Address to check
     * @return uint256[] Array of achievement IDs
     */
    function getPlayerAchievements(address player) external view returns (uint256[] memory);

    /**
     * @dev Checks if a player has unlocked an achievement
     * @param player Address to check
     * @param achievementId Achievement ID to check
     * @return bool True if achievement is unlocked
     */
    function isAchievementUnlocked(address player, uint256 achievementId) external view returns (bool);
} 