import { useState, useEffect } from 'react'
import { useContracts } from './use-contracts'
import { useWallet } from './use-wallet'

export function useActivity() {
  const { address } = useWallet()
  const { contracts } = useContracts()
  const [balanceHistory, setBalanceHistory] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])

  // Function to fetch all data
  const fetchData = async () => {
    // Don't try to fetch if wallet isn't connected yet
    if (!contracts || !address) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [history, events] = await Promise.all([
        contracts.getHistoricalBalances(address, timeRange),
        contracts.getActivityEvents(address)
      ])

      setBalanceHistory(history)
      setActivities(events)
    } catch (error) {
      console.error('Error fetching activity data:', error)
      setBalanceHistory([])
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add delay for reconnection like in use-admin
  useEffect(() => {
    if (!address && localStorage.getItem("walletConnected") === "true") {
      console.log('Activity: Waiting for wallet reconnection...')
      const timer = setTimeout(() => fetchData(), 1000)
      return () => clearTimeout(timer)
    }
    
    fetchData()
  }, [address, contracts, timeRange])

  // Expose refetch function to manually trigger updates
  const refetch = () => {
    fetchData()
  }

  return {
    balanceHistory,
    activities,
    timeRange,
    setTimeRange,
    isLoading,
    refetch
  }
} 