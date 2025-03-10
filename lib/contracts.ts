import { ethers, Log } from "ethers"
import { CONTRACT_ADDRESSES } from "@/config/contracts"
import GameTokenABI from "./abi/GameToken.json"
import RewardPoolABI from "./abi/RewardPool.json"
import SpacePuzzleNFTABI from "./abi/SpacePuzzleNFT.json"

interface ActivityEvent {
  type: 'reward' | 'achievement' | 'tokenize' | 'detokenize' | 'burn' | 'transfer'
  timestamp: number
  data: {
    amount?: string
    achievementId?: number
    name?: string
    player?: string
    from?: string
    to?: string
  }
}

interface TransferEvent {
  timestamp: number
  from: string
  to: string
  amount: bigint
}

export class GameContracts {
  private initialized: Promise<void>
  protected gameToken: ethers.Contract | null = null
  protected rewardPool: ethers.Contract | null = null
  protected spacePuzzleNFT: ethers.Contract | null = null

  constructor(provider: ethers.BrowserProvider) {
    this.initialized = this.init(provider)
  }

  private async ensureInitialized() {
    await this.initialized
    if (!this.gameToken || !this.rewardPool || !this.spacePuzzleNFT) {
      throw new Error('Contracts not initialized')
    }
  }

  private async init(provider: ethers.BrowserProvider) {
    try {
      const signer = await provider.getSigner()
      
      this.gameToken = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        signer
      )
      this.rewardPool = new ethers.Contract(
        CONTRACT_ADDRESSES.rewardPool,
        RewardPoolABI.abi,
        signer
      )
      this.spacePuzzleNFT = new ethers.Contract(
        CONTRACT_ADDRESSES.spacePuzzleNFT,
        SpacePuzzleNFTABI.abi,
        signer
      )

      // Add token management methods
      this.tokenizeKeys = this.gameToken.tokenizeKeys.bind(this.gameToken)
      this.detokenizeKeys = this.gameToken.detokenizeKeys.bind(this.gameToken)
      this.getKeyBalance = this.gameToken.keyBalance.bind(this.gameToken)
      this.hasEnoughKeys = this.gameToken.hasEnoughKeys.bind(this.gameToken)

      // Add achievement methods binding
      this.getPlayerAchievements = this.spacePuzzleNFT.getPlayerAchievements.bind(this.spacePuzzleNFT)
      this.getAchievement = this.spacePuzzleNFT.achievements.bind(this.spacePuzzleNFT)
    } catch (error) {
      console.error('Failed to initialize contracts:', error)
      throw error
    }
  }

  // Add type-safe methods
  async tokenizeKeys(amount: number): Promise<ethers.ContractTransactionResponse> {
    await this.ensureInitialized()
    return this.gameToken!.tokenizeKeys(amount)
  }

  async detokenizeKeys(amount: number): Promise<ethers.ContractTransactionResponse> {
    await this.ensureInitialized()
    return this.gameToken!.detokenizeKeys(amount)
  }

  async getKeyBalance(address: string): Promise<bigint> {
    await this.ensureInitialized()
    return this.gameToken!.keyBalance(address)
  }

  async hasEnoughKeys(address: string, amount: number): Promise<boolean> {
    await this.ensureInitialized()
    return this.gameToken!.hasEnoughKeys(address, amount)
  }

  async claimDailyReward(): Promise<ethers.ContractTransactionResponse> {
    await this.ensureInitialized()
    return this.rewardPool!.claimDailyReward()
  }

  async canClaimReward(address: string): Promise<boolean> {
    await this.ensureInitialized()
    return this.rewardPool!.canClaimReward(address)
  }

  async getConsecutiveDays(address: string): Promise<number> {
    await this.ensureInitialized()
    const days = await this.rewardPool!.getConsecutiveDays(address)
    return Number(days)
  }

  async getNextRewardAmount(address: string): Promise<bigint> {
    await this.ensureInitialized()
    return this.rewardPool!.getNextRewardAmount(address)
  }

  async getLastClaimTime(address: string): Promise<number> {
    await this.ensureInitialized()
    const time = await this.rewardPool!.getLastClaimTime(address)
    return Number(time)
  }

  async getRewardPoolBalance(): Promise<bigint> {
    await this.ensureInitialized()
    const tokenAddress = await this.rewardPool!.rewardToken()
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function balanceOf(address) view returns (uint256)"],
      this.rewardPool!.runner
    )
    return tokenContract.balanceOf(this.rewardPool!.target)
  }

  async fundRewardPool(amount: string): Promise<ethers.ContractTransactionResponse> {
    await this.ensureInitialized()
    const tokenAddress = await this.rewardPool!.rewardToken()
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      this.rewardPool!.runner
    )
    
    // First approve the reward pool to spend tokens
    await tokenContract.approve(this.rewardPool!.target, ethers.parseEther(amount))
    
    // Then fund the pool
    return this.rewardPool!.fundRewardPool(ethers.parseEther(amount))
  }

  async getPlayerAchievements(address: string): Promise<bigint[]> {
    await this.ensureInitialized()
    const achievements = await this.spacePuzzleNFT!.getPlayerAchievements(address)
    console.log('Raw achievements from contract:', achievements)
    return achievements
  }

  async getAchievement(id: bigint): Promise<any> {
    await this.ensureInitialized()
    return this.spacePuzzleNFT!.achievements(id)
  }

  private getEventType(event: Log): ActivityEvent['type'] {
    if (!event.topics || !event.topics[0]) {
      throw new Error('Invalid event: missing topics')
    }

    const topics = {
      rewardClaimed: ethers.id("RewardClaimed(address,uint256)"),
      achievementUnlocked: ethers.id("AchievementUnlocked(address,uint256,uint256)"),
      keysTokenized: ethers.id("KeysTokenized(address,uint256)"),
      keysDetokenized: ethers.id("KeysDetokenized(address,uint256)"),
      keysBurned: ethers.id("KeysBurned(address,uint256)"),
      transfer: ethers.id("Transfer(address,address,uint256)")
    }

    const topic = event.topics[0]
    
    // Debug log the topic and all known topics
    console.log('Event Topics:', {
      received: topic,
      known: topics,
      matches: Object.entries(topics).map(([name, hash]) => ({
        name,
        matches: hash === topic
      }))
    })

    if (topic === topics.rewardClaimed) return 'reward'
    if (topic === topics.achievementUnlocked) return 'achievement'
    if (topic === topics.keysTokenized) return 'tokenize'
    if (topic === topics.keysDetokenized) return 'detokenize'
    if (topic === topics.keysBurned) return 'burn'
    if (topic === topics.transfer) return 'transfer'
    
    return 'tokenize' // Default fallback
  }

  private parseEventData(event: Log): ActivityEvent['data'] {
    const type = this.getEventType(event)
    const eventLog = event as ethers.EventLog
    const args = eventLog.args
    if (!args) throw new Error('No args in event')
    
    switch (type) {
      case 'reward':
        return {
          amount: ethers.formatEther(args[1] || 0),
          player: args[0]
        }
      case 'achievement':
        return {
          achievementId: Number(args[1]),
          player: args[0]
        }
      case 'tokenize':
        return {
          amount: ethers.formatEther(args[1] || 0),
          player: args[0]
        }
      case 'detokenize':
        return {
          amount: ethers.formatEther(args[1] || 0),
          player: args[0]
        }
      case 'burn':
        return {
          amount: ethers.formatEther(args[1] || 0),
          player: args[0]
        }
      case 'transfer':
        return {
          amount: ethers.formatEther(args[2] || 0),
          from: args[0],
          to: args[1]
        }
      default:
        return {}
    }
  }

  async getActivityEvents(address: string): Promise<ActivityEvent[]> {
    await this.ensureInitialized()
    if (!this.gameToken?.runner?.provider) {
      throw new Error('Provider not available')
    }

    const currentBlock = await this.gameToken.runner.provider.getBlockNumber()
    const weekBlocks = 45500 // approximate blocks in 7 days
    
    const filter = {
      fromBlock: currentBlock - weekBlocks,
      toBlock: 'latest'
    }

    try {
      // Get all relevant events from the past week
      const [rewardEvents, achievementEvents, tokenEvents] = await Promise.all([
        this.rewardPool!.queryFilter(
          this.rewardPool!.filters.RewardClaimed(null, null),
          filter.fromBlock
        ),
        this.spacePuzzleNFT!.queryFilter(
          this.spacePuzzleNFT!.filters.AchievementUnlocked(null, null),
          filter.fromBlock
        ),
        Promise.all([
          this.gameToken!.queryFilter(
            this.gameToken!.filters.KeysTokenized(null, null),
            filter.fromBlock
          ),
          this.gameToken!.queryFilter(
            this.gameToken!.filters.KeysDetokenized(null, null),
            filter.fromBlock
          ),
          this.gameToken!.queryFilter(
            this.gameToken!.filters.Transfer(null, null),
            filter.fromBlock
          )
        ]).then(results => results.flat())
      ])

      // Filter events for the specific address
      const events = [...rewardEvents, ...achievementEvents, ...tokenEvents]
        .filter(event => {
          const eventLog = event as ethers.EventLog
          const args = eventLog.args
          if (!args) return false
          
          // Check if the event involves the address
          const isFromAddress = typeof args[0] === 'string' && 
            args[0].toLowerCase() === address.toLowerCase()
          const isToAddress = typeof args[1] === 'string' && 
            args[1].toLowerCase() === address.toLowerCase()
          
          return isFromAddress || isToAddress
        })

      // Get timestamps and enrich event data
      const eventsWithTimestamps = await Promise.all(
        events.map(async (event) => {
          const block = await event.getBlock()
          if (!block || block.timestamp === undefined) {
            throw new Error('Invalid block data')
          }

          // For achievements, fetch the achievement name
          const type = this.getEventType(event)
          let data = this.parseEventData(event)
          
          if (type === 'achievement' && data.achievementId) {
            const achievement = await this.getAchievement(BigInt(data.achievementId))
            data = { ...data, name: achievement.name }
          }

          return {
            type,
            timestamp: block.timestamp,
            data
          }
        })
      )

      // Sort by timestamp (most recent first) and limit to last week
      const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60)
      return eventsWithTimestamps
        .filter(event => event.timestamp >= oneWeekAgo)
        .sort((a, b) => b.timestamp - a.timestamp)

    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  }

  async getHistoricalBalances(address: string, timeframe: 'day' | 'week' | 'month'): Promise<{
    timestamp: number
    balance: bigint
  }[]> {
    await this.ensureInitialized()
    if (!this.gameToken?.runner?.provider) {
      throw new Error('Provider not available')
    }

    const currentBlock = await this.gameToken.runner.provider.getBlockNumber()
    const blocksToFetch = {
      day: 6500,    // ~1 day of blocks
      week: 45500,  // ~7 days of blocks
      month: 195000 // ~30 days of blocks
    }[timeframe]

    const filter = {
      fromBlock: currentBlock - blocksToFetch,
      toBlock: 'latest'
    }

    try {
      // Get all transfer events involving the address
      const transferEvents = await Promise.all([
        // Get transfers to address
        this.gameToken!.queryFilter(
          this.gameToken!.filters.Transfer(undefined, address),
          filter.fromBlock
        ),
        // Get transfers from address
        this.gameToken!.queryFilter(
          this.gameToken!.filters.Transfer(address, undefined),
          filter.fromBlock
        )
      ])

      const allTransfers = await Promise.all(
        transferEvents.flat().map(async (event) => {
          const eventLog = event as ethers.EventLog
          const block = await event.getBlock()
          if (!block || block.timestamp === undefined) {
            throw new Error('Invalid block data')
          }
          const args = eventLog.args
          if (!args) throw new Error('No args in transfer event')
          
          return {
            timestamp: block.timestamp,
            from: args[0],
            to: args[1],
            amount: args[2]
          } as TransferEvent
        })
      )

      // Sort by timestamp
      allTransfers.sort((a, b) => a.timestamp - b.timestamp)

      // Calculate running balance at each transfer
      const currentBalance = await this.getKeyBalance(address)
      let runningBalance = currentBalance
      
      const balancePoints = allTransfers.map(transfer => {
        if (transfer.to === address) {
          runningBalance -= transfer.amount
        } else if (transfer.from === address) {
          runningBalance += transfer.amount
        }
        
        return {
          timestamp: transfer.timestamp,
          balance: runningBalance
        }
      })

      // Add current balance as last point
      balancePoints.push({
        timestamp: Math.floor(Date.now() / 1000),
        balance: currentBalance
      })

      return balancePoints
    } catch (error) {
      console.error('Error calculating historical balances:', error)
      return []
    }
  }

  // Add public getter
  public getSpacePuzzleNFT() {
    return this.spacePuzzleNFT
  }
}