import { useState, useEffect } from 'react'
import { useContracts } from './use-contracts'
import { useWallet } from './use-wallet'
import { toast } from '@/components/ui/use-toast'

const ALL_ACHIEVEMENTS = [
  {
    id: 1,
    name: "First Light",
    description: "You've entered the world of Space Puzzle. The journey begins!",
    rarity: 0,
    requiredScore: 100,
    requiredLevel: 1,
    isUnlocked: false
  },
  {
    id: 2,
    name: "Space Explorer",
    description: "Explored new frontiers of the galaxy. You've just scratched the surface.",
    rarity: 0,
    requiredScore: 250,
    requiredLevel: 2,
    isUnlocked: false
  },
  {
    id: 3,
    name: "Starship Pilot",
    description: "Mastered the art of piloting your starship through asteroid fields.",
    rarity: 1,
    requiredScore: 400,
    requiredLevel: 3,
    isUnlocked: false
  },
  {
    id: 4,
    name: "Nebula Navigator",
    description: "Successfully navigated through the most dangerous nebula in the galaxy.",
    rarity: 1,
    requiredScore: 600,
    requiredLevel: 4,
    isUnlocked: false
  },
  {
    id: 5,
    name: "Cosmic Champion",
    description: "Defeated the rogue AI in deep space. The galaxy is safe for now.",
    rarity: 2,
    requiredScore: 800,
    requiredLevel: 5,
    isUnlocked: false
  },
  {
    id: 6,
    name: "Asteroid Slayer",
    description: "Destroyed 100+ asteroids to clear the way for the fleet.",
    rarity: 2,
    requiredScore: 1000,
    requiredLevel: 6,
    isUnlocked: false
  },
  {
    id: 7,
    name: "Gravity Bender",
    description: "Survived the gravity field of a black hole and emerged victorious.",
    rarity: 3,
    requiredScore: 1200,
    requiredLevel: 7,
    isUnlocked: false
  },
  {
    id: 8,
    name: "Quantum Leap",
    description: "Unlocked the secrets of quantum travel and reached the unknown dimensions.",
    rarity: 3,
    requiredScore: 1500,
    requiredLevel: 8,
    isUnlocked: false
  },
  {
    id: 9,
    name: "Galactic Hero",
    description: "Heroically defeated the space invaders threatening the galaxy's core.",
    rarity: 4,
    requiredScore: 2000,
    requiredLevel: 9,
    isUnlocked: false
  },
  {
    id: 10,
    name: "Starlord",
    description: "Achieved the highest honor in the galaxy by mastering all challenges of space.",
    rarity: 4,
    requiredScore: 3000,
    requiredLevel: 10,
    isUnlocked: false
  }
];

export interface Achievement {
  id: number
  name: string
  description: string
  rarity: number
  requiredScore: number
  requiredLevel: number
  isUnlocked: boolean
  unlockedAt?: Date
}

export function usePlayerAchievements() {
  const { address } = useWallet()
  const { contracts, isLoading: isContractsLoading } = useContracts()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  const getRarityLabel = (rarity: number) => {
    const labels = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
    return labels[rarity] || 'Unknown'
  }

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!contracts) return
      
      const nftContract = contracts.getSpacePuzzleNFT()
      if (!nftContract || !address) {
        if (retryCount < 3) {
          console.log('Retrying in 1 second...', { contracts, address, retryCount })
          setTimeout(() => setRetryCount(prev => prev + 1), 1000)
        } else {
          setAchievements([])
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        console.log('Fetching achievements for address:', address)
        
        const unlockedIds = await contracts.getPlayerAchievements(address)
        console.log('Unlocked achievement IDs:', unlockedIds)

        const unlockedSet = new Set(unlockedIds.map(id => id.toString()))

        const processedAchievements = ALL_ACHIEVEMENTS.map(achievement => ({
          ...achievement,
          isUnlocked: unlockedSet.has(achievement.id.toString())
        }))

        console.log('Final processed achievements:', processedAchievements)
        setAchievements(processedAchievements)
      } catch (error) {
        console.error('Error fetching achievements:', error)
        toast({
          title: "Error",
          description: "Failed to load achievements",
          className: "destructive border-red-400",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [address, contracts, retryCount])

  useEffect(() => {
    setRetryCount(0)
  }, [address, contracts])

  return { 
    achievements, 
    isLoading: isLoading || isContractsLoading, 
    getRarityLabel 
  }
} 