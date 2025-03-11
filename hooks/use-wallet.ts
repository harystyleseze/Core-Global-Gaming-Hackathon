"use client"

import { useContext, useEffect } from "react"
import { WalletContext } from "@/providers/wallet-provider"

export function useWallet() {
  const context = useContext(WalletContext)

  useEffect(() => {
    // Check if wallet was previously connected
    const wasConnected = localStorage.getItem("walletConnected") === "true"
    const savedAddress = localStorage.getItem("walletAddress")

    // Auto reconnect if previously connected
    if (wasConnected && savedAddress && !context.isConnected) {
      context.connect().catch(console.error)
    }
  }, [context])

  // Store connection state and address when they change
  useEffect(() => {
    if (context.isConnected && context.address) {
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", context.address)
    } else {
      localStorage.removeItem("walletConnected")
      localStorage.removeItem("walletAddress")
    }
  }, [context.isConnected, context.address])

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }

  return context
}

