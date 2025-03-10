import { useState, useEffect } from 'react'
import { useContracts } from './use-contracts'
import { useWallet } from './use-wallet'
import { formatEther } from 'ethers'
import { usePlayerAchievements } from './use-player-achievements'

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toFixed(1)
}

interface Achievement {
  id: number
  name: string
  isUnlocked: boolean
  unlockedAt?: Date
}

export function useDashboardStats() {
  const { address } = useWallet()
  const { contracts } = useContracts()
  const { achievements } = usePlayerAchievements()
  const [stats, setStats] = useState({
    keyBalance: '0',
    keyBalanceChange: 0,
    unlockedCount: 0,
    thisMonthUnlocked: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!contracts || !address) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Get current balance and timestamp
        const currentBalance = await contracts.getKeyBalance(address)
        const currentBalanceNum = Number(formatEther(currentBalance))
        const now = Math.floor(Date.now() / 1000)
        
        // Get historical balances for exactly 30 days ago
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60)
        const historicalBalances = await contracts.getHistoricalBalances(address, 'month')
        
        // Sort balances by timestamp and find the closest to 30 days ago
        const sortedBalances = historicalBalances
          .sort((a, b) => Math.abs(a.timestamp - thirtyDaysAgo) - Math.abs(b.timestamp - thirtyDaysAgo))

        // Get last month's balance (Original Value)
        const lastMonthBalance = sortedBalances[0] ? 
          Number(formatEther(sortedBalances[0].balance)) : 
          0 // Use 0 as Original Value if no historical data

        // Calculate percentage increase: ((New - Original) / New) * 100
        // Only return 0 if current balance (New) is 0
        const percentChange = currentBalanceNum === 0 ? 
          0 : // If current value is 0, return 0% change
          ((currentBalanceNum - lastMonthBalance) / currentBalanceNum) * 100

        // Add debug logging
        console.log('Balance Change:', {
          newValue: currentBalanceNum,
          originalValue: lastMonthBalance,
          calculation: `((${currentBalanceNum} - ${lastMonthBalance}) / ${currentBalanceNum}) * 100`,
          result: Math.round(percentChange * 100) / 100
        })

        // Get achievement events from the last 30 days
        const events = await contracts.getActivityEvents(address)
        
        // Count achievements unlocked in last 30 days
        const recentAchievements = events.filter(event => 
          event.type === 'achievement' && 
          event.timestamp >= thirtyDaysAgo
        )

        // Debug logging
        console.log('Achievement Stats:', {
          totalUnlocked: achievements.filter(a => a.isUnlocked).length,
          last30Days: {
            count: recentAchievements.length,
            achievements: recentAchievements.map(event => ({
              id: event.data.achievementId,
              name: event.data.name,
              timestamp: new Date(event.timestamp * 1000).toLocaleString()
            }))
          },
          timeframe: {
            from: new Date(thirtyDaysAgo * 1000).toLocaleString(),
            to: new Date(now * 1000).toLocaleString()
          }
        })

        console.log('Dashboard Stats:', {
          currentBalance: formatNumber(currentBalanceNum),
          lastMonthBalance: formatNumber(lastMonthBalance),
          percentChange: Math.round(percentChange * 100) / 100,
          achievements: achievements.filter(a => a.isUnlocked).length,
          thisMonthUnlocked: recentAchievements.length,
          timeframe: {
            now: new Date(now * 1000).toLocaleDateString(),
            thirtyDaysAgo: new Date(thirtyDaysAgo * 1000).toLocaleDateString()
          }
        })

        console.log('Historical Balances:', historicalBalances.map(b => ({
          timestamp: new Date(b.timestamp * 1000).toLocaleString(),
          balance: formatNumber(Number(formatEther(b.balance)))
        })))

        setStats({
          keyBalance: formatNumber(currentBalanceNum),
          keyBalanceChange: Math.round(percentChange * 100) / 100,
          unlockedCount: achievements.filter(a => a.isUnlocked).length,
          thisMonthUnlocked: recentAchievements.length,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [contracts, address, achievements])

  return { ...stats, isLoading }
} 