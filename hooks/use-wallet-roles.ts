import { useEffect, useState } from "react"
import { useWallet } from "./use-wallet"
import { useContracts } from "./use-contracts"

interface WalletRoles {
  admin: boolean
  minter: boolean
  game: boolean
}

export function useWalletRoles() {
  const { address, isConnected } = useWallet()
  const { contracts } = useContracts()
  const [roles, setRoles] = useState<WalletRoles>({
    admin: false,
    minter: false,
    game: false
  })

  useEffect(() => {
    const checkRoles = async () => {
      if (!isConnected || !address || !contracts) return

      try {
        const gameToken = contracts.getGameToken()
        if (!gameToken) return

        const [isAdmin, isMinter, isGame] = await Promise.all([
          gameToken.hasAdminRole(address),
          gameToken.hasMinterRole(address),
          gameToken.hasGameRole(address)
        ])

        const newRoles = {
          admin: isAdmin,
          minter: isMinter,
          game: isGame
        }

        setRoles(newRoles)
        console.log('Contract Role Check:', {
          address,
          contractAddress: gameToken.target,
          roles: newRoles
        })
      } catch (error) {
        console.error('Error checking contract roles:', error)
        setRoles({ admin: false, minter: false, game: false })
      }
    }

    checkRoles()
  }, [address, isConnected, contracts])

  return roles
} 