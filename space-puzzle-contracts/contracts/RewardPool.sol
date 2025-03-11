// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IRewardPool.sol";
import "./libraries/GameTypes.sol";

contract RewardPool is IRewardPool, Ownable {
    IERC20 public immutable rewardToken;
    
    uint256 public constant DAILY_RESET_TIME = 24 hours;
    uint256 public baseReward = 5 * 10**18; // 5 tokens base reward
    
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public consecutiveDays;

    constructor(address _rewardToken) Ownable() {
        rewardToken = IERC20(_rewardToken);
    }

    function claimDailyReward() external {
        require(canClaimReward(msg.sender), "Cannot claim reward yet");
        
        uint256 reward = calculateReward(msg.sender);
        updatePlayerStats(msg.sender);
        
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, reward, consecutiveDays[msg.sender]);
    }

    function canClaimReward(address player) public view returns (bool) {
        if (lastClaimTime[player] == 0) return true;
        return block.timestamp >= lastClaimTime[player] + DAILY_RESET_TIME;
    }

    function calculateReward(address player) public view returns (uint256) {
        uint256 multiplier = getConsecutiveDays(player) + 1;
        return baseReward * multiplier;
    }

    function updatePlayerStats(address player) private {
        uint256 timeSinceLastClaim = block.timestamp - lastClaimTime[player];
        
        if (timeSinceLastClaim <= 48 hours) {
            consecutiveDays[player]++;
        } else {
            consecutiveDays[player] = 1;
        }
        
        lastClaimTime[player] = block.timestamp;
    }

    function getNextRewardAmount(address player) external view returns (uint256) {
        return calculateReward(player);
    }

    function getLastClaimTime(address player) external view returns (uint256) {
        return lastClaimTime[player];
    }

    function getConsecutiveDays(address player) public view returns (uint256) {
        return consecutiveDays[player];
    }

    function fundRewardPool(uint256 amount) external {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Funding failed");
        emit RewardPoolFunded(msg.sender, amount);
    }
}