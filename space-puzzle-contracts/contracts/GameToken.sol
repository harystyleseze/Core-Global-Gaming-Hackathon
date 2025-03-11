// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IGameToken.sol";

/**
 * @title GameToken
 * @dev Implementation of the game key token system with role management
 */
contract GameToken is ERC20, ERC20Burnable, Pausable, AccessControl, IGameToken {
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Conversion rate for tokenization (3 key = 1 token)
    uint256 public constant KEY_TO_TOKEN_RATE = 9;
    
    // Maximum keys that can be tokenized per transaction
    uint256 public constant MAX_TOKENIZE_AMOUNT = 100;
    
    // Cooldown period between tokenization operations
    uint256 public constant TOKENIZE_COOLDOWN = 10 minutes;
    
    // Track last tokenization time for each player
    mapping(address => uint256) public lastTokenizeTime;

    constructor() ERC20("Space Puzzle Key", "KEY") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Grant the Game Role to an address
     * @param account Address to grant the role to
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function grantGameRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(GAME_ROLE, account);
    }

    /**
     * @dev Revoke the Game Role from an address
     * @param account Address to revoke the role from
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function revokeGameRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(GAME_ROLE, account);
    }

    /**
     * @dev Grant the Minter Role to an address
     * @param account Address to grant the role to
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Revoke the Minter Role from an address
     * @param account Address to revoke the role from
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function revokeMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }

    /**
     * @dev Transfer admin role to a new address
     * @param newAdmin Address of the new admin
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     * - New admin address cannot be zero address
     */
    function transferAdminRole(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "New admin cannot be zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Check if an address has the Game Role
     * @param account Address to check
     */
    function hasGameRole(address account) external view returns (bool) {
        return hasRole(GAME_ROLE, account);
    }

    /**
     * @dev Check if an address has the Minter Role
     * @param account Address to check
     */
    function hasMinterRole(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    /**
     * @dev Check if an address has the Admin Role
     * @param account Address to check
     */
    function hasAdminRole(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Pause token transfers and operations
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers and operations
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Convert in-game keys to tokens
     * @param amount Number of keys to tokenize
     * Requirements:
     * - Amount must be greater than 0 and less than MAX_TOKENIZE_AMOUNT
     * - Cooldown period must have passed since last tokenization
     */
    function tokenizeKeys(uint256 amount) external whenNotPaused {
        require(amount > 0 && amount <= MAX_TOKENIZE_AMOUNT, "Invalid amount");
        require(
            block.timestamp >= lastTokenizeTime[msg.sender] + TOKENIZE_COOLDOWN,
            "Tokenization on cooldown"
        );

        lastTokenizeTime[msg.sender] = block.timestamp;
        _mint(msg.sender, amount * KEY_TO_TOKEN_RATE);
        
        emit KeysTokenized(msg.sender, amount);
    }

    /**
     * @dev Convert tokens back to in-game keys
     * @param amount Number of tokens to convert to keys
     * Requirements:
     * - Caller must have sufficient token balance
     */
    function detokenizeKeys(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");

        _burn(msg.sender, amount);
        
        emit KeysDetokenized(msg.sender, amount);
    }

    /**
     * @dev Mint new key tokens (only game contract)
     * @param player Address to mint tokens to
     * @param amount Number of tokens to mint
     * Requirements:
     * - Caller must have MINTER_ROLE
     */
    function mintKeys(address player, uint256 amount) 
        external 
        onlyRole(GAME_ROLE) 
        whenNotPaused 
    {
        require(player != address(0), "Invalid player address");
        require(amount > 0, "Amount must be greater than 0");

        _mint(player, amount);
        
        emit KeysMinted(player, amount);
    }

    /**
     * @dev Burn key tokens when used in game
     * @param player Address to burn tokens from
     * @param amount Number of tokens to burn
     * Requirements:
     * - Caller must have GAME_ROLE
     * - Player must have sufficient balance
     */
    function burnKeys(address player, uint256 amount)
        external
        onlyRole(GAME_ROLE)
        whenNotPaused
    {
        require(player != address(0), "Invalid player address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(player) >= amount, "Insufficient key balance");

        _burn(player, amount);
        
        emit KeysBurned(player, amount);
    }

    /**
     * @dev Get the key balance of a player
     * @param player Address to check balance
     */
    function keyBalance(address player) external view returns (uint256) {
        return balanceOf(player);
    }

    /**
     * @dev Check if a player has enough keys
     * @param player Address to check
     * @param amount Amount of keys to check for
     */
    function hasEnoughKeys(address player, uint256 amount) external view returns (bool) {
        return balanceOf(player) >= amount;
    }

    /**
     * @dev Hook that is called before any transfer of tokens.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
} 