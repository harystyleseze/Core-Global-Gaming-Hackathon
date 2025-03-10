import { ethers } from 'ethers'

export const CONTRACT_ADDRESSES = {
  gameToken: '0x46B0cFbf0786D48D2A97ae628d3E76cB8e1943B9',
  rewardPool: '0x905e29f9F5c4298339B3A0a6989119340d9059F3',
  spacePuzzleNFT: '0xb19355A7E708883Df704998A3FAd5a506fFE1880'
} as const

console.log('Contract addresses loaded:', CONTRACT_ADDRESSES)

export const ROLES = {
  ADMIN: ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
  GAME: ethers.keccak256(ethers.toUtf8Bytes("GAME_ROLE")),
  MINTER: ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"))
} as const

console.log('Role bytes generated:', ROLES)

export type RoleType = 'admin' | 'game' | 'minter' 