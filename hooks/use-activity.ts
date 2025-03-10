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
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when component mounts or when dependencies change
  useEffect(() => {
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