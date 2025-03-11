// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title IGameToken Interface
 * @dev Interface for the Space Puzzle game token system
 */
interface IGameToken is IAccessControl {
    /**
     * @dev Emitted when keys are tokenized
     * @param player Address of the player who tokenized keys
     * @param amount Number of keys tokenized
     */
    event KeysTokenized(address player, uint256 amount);

    /**
     * @dev Emitted when tokens are detokenized back to keys
     * @param player Address of the player who detokenized tokens
     * @param amount Number of tokens detokenized
     */
    event KeysDetokenized(address player, uint256 amount);

    /**
     * @dev Emitted when new keys are minted
     * @param player Address of the player receiving keys
     * @param amount Number of keys minted
     */
    event KeysMinted(address player, uint256 amount);

    /**
     * @dev Emitted when keys are burned
     * @param player Address of the player whose keys were burned
     * @param amount Number of keys burned
     */
    event KeysBurned(address player, uint256 amount);

    /**
     * @dev Grants the Game Role to an address
     * @param account Address to receive the role
     */
    function grantGameRole(address account) external;

    /**
     * @dev Revokes the Game Role from an address
     * @param account Address to lose the role
     */
    function revokeGameRole(address account) external;

    /**
     * @dev Grants the Minter Role to an address
     * @param account Address to receive the role
     */
    function grantMinterRole(address account) external;

    /**
     * @dev Revokes the Minter Role from an address
     * @param account Address to lose the role
     */
    function revokeMinterRole(address account) external;

    /**
     * @dev Transfers admin role to a new address
     * @param newAdmin Address to receive admin role
     */
    function transferAdminRole(address newAdmin) external;

    /**
     * @dev Checks if an address has the Game Role
     * @param account Address to check
     * @return bool True if address has role
     */
    function hasGameRole(address account) external view returns (bool);

    /**
     * @dev Checks if an address has the Minter Role
     * @param account Address to check
     * @return bool True if address has role
     */
    function hasMinterRole(address account) external view returns (bool);

    /**
     * @dev Checks if an address has the Admin Role
     * @param account Address to check
     * @return bool True if address has role
     */
    function hasAdminRole(address account) external view returns (bool);

    /**
     * @dev Converts in-game keys to tokens
     * @param amount Number of keys to tokenize
     */
    function tokenizeKeys(uint256 amount) external;

    /**
     * @dev Converts tokens back to in-game keys
     * @param amount Number of tokens to convert
     */
    function detokenizeKeys(uint256 amount) external;

    /**
     * @dev Mints new key tokens to a player
     * @param player Address to receive tokens
     * @param amount Number of tokens to mint
     */
    function mintKeys(address player, uint256 amount) external;

    /**
     * @dev Burns key tokens from a player
     * @param player Address to burn tokens from
     * @param amount Number of tokens to burn
     */
    function burnKeys(address player, uint256 amount) external;

    /**
     * @dev Gets the key balance of a player
     * @param player Address to check
     * @return uint256 Balance of keys
     */
    function keyBalance(address player) external view returns (uint256);

    /**
     * @dev Checks if a player has enough keys
     * @param player Address to check
     * @param amount Amount to check for
     * @return bool True if player has enough keys
     */
    function hasEnoughKeys(address player, uint256 amount) external view returns (bool);

    /**
     * @dev Pauses all token operations
     */
    function pause() external;

    /**
     * @dev Unpauses all token operations
     */
    function unpause() external;
} 