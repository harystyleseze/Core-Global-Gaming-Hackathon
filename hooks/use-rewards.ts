import { useState, useEffect } from 'react'
import { useContracts } from './use-contracts'
import { useWallet } from './use-wallet'
import { useToast } from '@/components/ui/use-toast'
import { ethers } from 'ethers'

export function useRewards() {
  const { toast } = useToast()
  const { contracts } = useContracts()
  const { address } = useWallet()
  const [isClaiming, setIsClaiming] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [consecutiveDays, setConsecutiveDays] = useState(0)
  const [nextReward, setNextReward] = useState<string>("0")
  const [poolBalance, setPoolBalance] = useState<string>("0")
  const [isFunding, setIsFunding] = useState(false)

  const updateRewardInfo = async () => {
    if (!contracts || !address) return

    try {
      const [canClaimReward, days, reward, balance] = await Promise.all([
        contracts.canClaimReward(address),
        contracts.getConsecutiveDays(address),
        contracts.getNextRewardAmount(address),
        contracts.getRewardPoolBalance()
      ])

      setCanClaim(canClaimReward)
      setConsecutiveDays(days)
      setNextReward(ethers.formatEther(reward))
      setPoolBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error updating reward info:', error)
    }
  }

  useEffect(() => {
    updateRewardInfo()
    // Poll every minute for updates
    const interval = setInterval(updateRewardInfo, 60000)
    return () => clearInterval(interval)
  }, [contracts, address])

  const claimReward = async () => {
    if (!contracts) return

    try {
      setIsClaiming(true)
      
      // Check if pool has enough balance
      const reward = await contracts.getNextRewardAmount(address!)
      const balance = await contracts.getRewardPoolBalance()
      
      if (balance < reward) {
        toast({
          title: "Error",
          description: "Reward pool has insufficient balance. Please try again later.",
          duration: 5000,
          className: "destructive border-red-400",
        })
        return
      }

      const tx = await contracts.claimDailyReward()
      
      toast({
        title: "Transaction Submitted",
        description: "Processing...",
        duration: undefined,
        className: "border-blue-400",
      })

      await tx.wait()
      await updateRewardInfo()

      toast({
        title: "Success",
        description: "Successfully claimed daily reward!",
        duration: 5000,
        className: "border-green-400",
      })
    } catch (error) {
      console.error('Error claiming reward:', error)
      let errorMessage = "Failed to claim reward"
      
      if (error instanceof Error) {
        if (error.message.includes("transfer amount exceeds balance")) {
          errorMessage = "Reward pool has insufficient balance. Please try again later."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        duration: 5000,
        className: "destructive border-red-400",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const fundPool = async (amount: string) => {
    if (!contracts || !amount) return

    try {
      setIsFunding(true)
      const tx = await contracts.fundRewardPool(amount)
      
      toast({
        title: "Transaction Submitted",
        description: "Processing...",
        duration: undefined,
        className: "border-blue-400",
      })

      await tx.wait()
      await updateRewardInfo()

      toast({
        title: "Success",
        description: `Successfully funded reward pool with ${amount} KEY`,
        duration: 5000,
        className: "border-green-400",
      })
    } catch (error) {
      console.error('Error funding reward pool:', error)
      toast({
        title: "Error",
        description: "Failed to fund reward pool",
        duration: 5000,
        className: "destructive border-red-400",
      })
    } finally {
      setIsFunding(false)
    }
  }

  return {
    claimReward,
    isClaiming,
    canClaim,
    consecutiveDays,
    nextReward,
    poolBalance,
    fundPool,
    isFunding
  }
}
