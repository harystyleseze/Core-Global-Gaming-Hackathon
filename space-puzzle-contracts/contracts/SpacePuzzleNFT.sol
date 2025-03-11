// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/ISpacePuzzleNFT.sol";
import "./libraries/GameTypes.sol";

contract SpacePuzzleNFT is ERC721, Ownable, ISpacePuzzleNFT {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _achievementIds;

    mapping(uint256 => GameTypes.Achievement) public achievements;
    mapping(address => mapping(uint256 => bool)) public unlockedAchievements;
    mapping(address => uint256[]) public playerAchievements;

    constructor() ERC721("Space Puzzle Achievement", "SPACE") {}

    function createAchievement(
        string memory name,
        string memory description,
        uint256 rarity,
        uint256 requiredScore,
        uint256 requiredLevel
    ) external onlyOwner returns (uint256) {
        _achievementIds.increment();
        uint256 newAchievementId = _achievementIds.current();

        achievements[newAchievementId] = GameTypes.Achievement({
            id: newAchievementId,
            name: name,
            description: description,
            rarity: rarity,
            requiredScore: requiredScore,
            requiredLevel: requiredLevel
        });

        emit NewAchievementAdded(newAchievementId, name, rarity);
        return newAchievementId;
    }

    function mintAchievement(address player, uint256 achievementId) external {
        require(!unlockedAchievements[player][achievementId], "Achievement already unlocked");
        require(achievementId <= _achievementIds.current(), "Invalid achievement");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(player, newTokenId);
        unlockedAchievements[player][achievementId] = true;
        playerAchievements[player].push(achievementId);

        emit AchievementUnlocked(player, achievementId, newTokenId);
    }

    function getPlayerAchievements(address player) external view returns (uint256[] memory) {
        return playerAchievements[player];
    }

    function isAchievementUnlocked(address player, uint256 achievementId) external view returns (bool) {
        return unlockedAchievements[player][achievementId];
    }
}