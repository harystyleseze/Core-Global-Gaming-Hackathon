import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import GameTokenABI from '@/lib/abi/GameToken.json'
import { toast } from '@/components/ui/toast'
import { useContracts } from './use-contracts'
import { useWallet } from './use-wallet'

export const MAX_TOKENIZE_AMOUNT = 100
export const TOKENIZE_COOLDOWN = 3600 // 1 hour in seconds

export function useTokenManagement() {
  const { contracts } = useContracts()
  const { provider, address } = useWallet()
  const [isMinting, setIsMinting] = useState(false)
  const [isBurning, setBurning] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [balance, setBalance] = useState<string>("")
  const [isPausing, setIsPausing] = useState(false)
  const [isUnpausing, setIsUnpausing] = useState(false)
  const [isTransferringAdmin, setIsTransferringAdmin] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isTokenizing, setIsTokenizing] = useState(false)
  const [isDetokenizing, setIsDetokenizing] = useState(false)
  const [keyBalance, setKeyBalance] = useState<string>("0")
  const [keyBalanceChange, setKeyBalanceChange] = useState(0)

  const checkBalance = async (address: string) => {
    try {
      setIsChecking(true)
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        provider
      )

      const balanceWei = await contract.keyBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(balanceEth)
      
      toast({
        title: "Balance Retrieved",
        description: `Address has ${balanceEth} tokens`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error checking balance:', error)
      setBalance("")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check balance",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsChecking(false)
    }
  }

  const mintTokens = async (address: string, amount: string) => {
    try {
      setIsMinting(true)
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address')
      }

      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Invalid amount')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        signer
      )

      const tx = await contract.mintKeys(address, ethers.parseEther(amount))
      toast({
        title: "Transaction Submitted",
        description: "Minting tokens...",
        duration: 5000,
      })

      await tx.wait()
      toast({
        title: "Success",
        description: `Successfully minted ${amount} tokens to ${address}`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error minting tokens:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint tokens",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsMinting(false)
    }
  }

  const burnTokens = async (address: string, amount: string) => {
    try {
      setBurning(true)
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address')
      }

      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Invalid amount')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        signer
      )

      const tx = await contract.burnKeys(address, ethers.parseEther(amount))
      toast({
        title: "Transaction Submitted",
        description: "Burning tokens...",
        duration: 5000,
      })

      await tx.wait()
      toast({
        title: "Success",
        description: `Successfully burned ${amount} tokens from ${address}`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error burning tokens:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to burn tokens",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setBurning(false)
    }
  }

  const checkPauseState = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        provider
      )

      const paused = await contract.paused()
      setIsPaused(paused)
    } catch (error) {
      console.error('Error checking pause state:', error)
    }
  }

  useEffect(() => {
    checkPauseState()
  }, [])

  useEffect(() => {
    // Mock balance change for now
    // In a real app, you would calculate this from historical data
    setKeyBalanceChange(Math.floor(Math.random() * 100))
  }, [])

  const pauseContract = async () => {
    try {
      setIsPausing(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        signer
      )

      const tx = await contract.pause()
      toast({
        title: "Transaction Submitted",
        description: "Pausing contract...",
        duration: 5000,
      })

      await tx.wait()
      await checkPauseState()
      toast({
        title: "Success",
        description: "Contract successfully paused",
        duration: 5000,
      })
    } catch (error) {
      console.error('Error pausing contract:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pause contract",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsPausing(false)
    }
  }

  const unpauseContract = async () => {
    try {
      setIsUnpausing(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        signer
      )

      const tx = await contract.unpause()
      toast({
        title: "Transaction Submitted",
        description: "Unpausing contract...",
        duration: 5000,
      })

      await tx.wait()
      await checkPauseState()
      toast({
        title: "Success",
        description: "Contract successfully unpaused",
        duration: 5000,
      })
    } catch (error) {
      console.error('Error unpausing contract:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unpause contract",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsUnpausing(false)
    }
  }

  const transferAdmin = async (newAdmin: string) => {
    try {
      setIsTransferringAdmin(true)
      if (!ethers.isAddress(newAdmin)) {
        throw new Error('Invalid address')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.gameToken,
        GameTokenABI.abi,
        signer
      )

      const tx = await contract.transferAdminRole(newAdmin)
      toast({
        title: "Transaction Submitted",
        description: "Transferring admin role...",
        duration: 5000,
      })

      await tx.wait()
      toast({
        title: "Success",
        description: `Admin role successfully transferred to ${newAdmin}`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error transferring admin:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transfer admin role",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsTransferringAdmin(false)
    }
  }

  const tokenizeKeys = async (amount: string) => {
    if (!contracts) return

    try {
      setIsTokenizing(true)
      const numAmount = parseInt(amount)
      
      if (numAmount <= 0 || numAmount > MAX_TOKENIZE_AMOUNT) {
        throw new Error(`Amount must be between 1 and ${MAX_TOKENIZE_AMOUNT}`)
      }

      const tx = await contracts.tokenizeKeys(numAmount)
      toast({
        title: "Transaction Submitted",
        description: "Tokenizing keys..."
      })
      const receipt = await tx.wait(1)

      await updateKeyBalance()

      toast({
        title: "Success",
        description: `Successfully tokenized ${amount} keys`,
      })
    } catch (error) {
      console.error('Error tokenizing keys:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to tokenize keys",
      })
    } finally {
      setIsTokenizing(false)
    }
  }

  const detokenizeKeys = async (amount: string) => {
    if (!contracts) return

    try {
      setIsDetokenizing(true)
      const numAmount = parseInt(amount)
      
      if (numAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      const tx = await contracts.detokenizeKeys(numAmount)
      toast({
        title: "Transaction Submitted",
        description: "Detokenizing keys..."
      })
      const receipt = await tx.wait()

      await updateKeyBalance()

      toast({
        title: "Success",
        description: `Successfully detokenized ${amount} keys`,
      })
    } catch (error) {
      console.error('Error detokenizing keys:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to detokenize keys",
      })
    } finally {
      setIsDetokenizing(false)
    }
  }

  const updateKeyBalance = async () => {
    if (!contracts || !address) return

    try {
      const balance = await contracts.getKeyBalance(address)
      setKeyBalance(balance.toString())
    } catch (error) {
      console.error('Error updating key balance:', error)
    }
  }

  return {
    mintTokens,
    burnTokens,
    checkBalance,
    isMinting,
    isBurning,
    isChecking,
    balance,
    pauseContract,
    unpauseContract,
    transferAdmin,
    isPausing,
    isUnpausing,
    isTransferringAdmin,
    isPaused,
    checkPauseState,
    tokenizeKeys,
    detokenizeKeys,
    updateKeyBalance,
    keyBalance,
    isTokenizing,
    isDetokenizing,
    MAX_TOKENIZE_AMOUNT,
    TOKENIZE_COOLDOWN,
    keyBalanceChange,
  }
} 