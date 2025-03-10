import { useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import SpacePuzzleNFTABI from '@/lib/abi/SpacePuzzleNFT.json'
import { toast } from '@/components/ui/toast'

interface Achievement {
  name: string
  description: string
  rarity: number
  requiredScore: number
  requiredLevel: number
}

export function useAchievements() {
  const [isCreating, setIsCreating] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [playerAchievements, setPlayerAchievements] = useState<number[]>([])

  const createAchievement = async (achievement: Achievement) => {
    try {
      setIsCreating(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spacePuzzleNFT,
        SpacePuzzleNFTABI.abi,
        signer
      )

      const tx = await contract.createAchievement(
        achievement.name,
        achievement.description,
        achievement.rarity,
        achievement.requiredScore,
        achievement.requiredLevel
      )

      toast({
        title: "Transaction Submitted",
        description: "Creating achievement...",
        duration: 5000,
      })

      const receipt = await tx.wait()
      const event = receipt.logs.find(
        (log: any) => log.eventName === 'NewAchievementAdded'
      )

      if (event) {
        const [id, name, rarity] = event.args
        toast({
          title: "Success",
          description: `Achievement "${name}" created with ID ${id}`,
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error creating achievement:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create achievement",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const mintAchievement = async (player: string, achievementId: number) => {
    try {
      setIsMinting(true)
      if (!ethers.isAddress(player)) {
        throw new Error('Invalid player address')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spacePuzzleNFT,
        SpacePuzzleNFTABI.abi,
        signer
      )

      // Check if already unlocked
      const isUnlocked = await contract.isAchievementUnlocked(player, achievementId)
      if (isUnlocked) {
        throw new Error('Achievement already unlocked for this player')
      }

      const tx = await contract.mintAchievement(player, achievementId)
      toast({
        title: "Transaction Submitted",
        description: "Minting achievement...",
        duration: 5000,
      })

      await tx.wait()
      toast({
        title: "Success",
        description: `Achievement #${achievementId} minted to ${player}`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error minting achievement:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint achievement",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsMinting(false)
    }
  }

  const checkPlayerAchievements = async (player: string) => {
    try {
      setIsChecking(true)
      if (!ethers.isAddress(player)) {
        throw new Error('Invalid player address')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spacePuzzleNFT,
        SpacePuzzleNFTABI.abi,
        provider
      )

      const achievements = await contract.getPlayerAchievements(player)
      setPlayerAchievements(achievements.map((id: bigint) => Number(id)))
      
      toast({
        title: "Success",
        description: `Found ${achievements.length} achievements for ${player}`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error checking achievements:', error)
      setPlayerAchievements([])
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check achievements",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsChecking(false)
    }
  }

  return {
    createAchievement,
    mintAchievement,
    checkPlayerAchievements,
    isCreating,
    isMinting,
    isChecking,
    playerAchievements
  }
} 