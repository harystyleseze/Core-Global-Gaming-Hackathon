// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GameTypes Library
 * @dev Library containing shared data structures for the Space Puzzle game
 */
library GameTypes {
    /**
     * @dev Achievement structure defining game achievements
     * @param id Unique identifier for the achievement
     * @param name Name of the achievement
     * @param description Description of what the achievement represents
     * @param rarity Rarity level (1-5, with 5 being most rare)
     * @param requiredScore Minimum score required to unlock
     * @param requiredLevel Minimum level required to unlock
     */
    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 rarity;
        uint256 requiredScore;
        uint256 requiredLevel;
    }

    /**
     * @dev PlayerStats structure tracking player progress
     * @param totalScore Cumulative score across all games
     * @param highestLevel Highest level reached
     * @param achievementsUnlocked Number of achievements unlocked
     * @param consecutiveDays Number of consecutive days played
     */
    struct PlayerStats {
        uint256 totalScore;
        uint256 highestLevel;
        uint256 achievementsUnlocked;
        uint256 consecutiveDays;
    }
} 