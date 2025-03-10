"use client"

import { useEffect, useState } from "react"
import { GameContracts } from "@/lib/contracts"
import { useWallet } from "./use-wallet"
import { ethers } from "ethers"

export function useContracts() {
  const { provider } = useWallet()
  const [contracts, setContracts] = useState<GameContracts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (provider && (provider instanceof ethers.BrowserProvider)) {
      const initContracts = async () => {
        try {
          setIsLoading(true)
          const gameContracts = new GameContracts(provider)
          setContracts(gameContracts)
          setError(null)
        } catch (err) {
          console.error("Failed to initialize contracts:", err)
          setError("Failed to initialize contracts. Please try again.")
          setContracts(null)
        } finally {
          setIsLoading(false)
        }
      }

      initContracts()
    }
  }, [provider])

  return { contracts, isLoading, error }
}

