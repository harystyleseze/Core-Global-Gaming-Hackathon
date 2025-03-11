import { useState, useEffect } from 'react'
import { useWalletRoles } from './use-wallet-roles'

export function useAdmin() {
  const { admin: isAdmin } = useWalletRoles()
  const [isChecking, setIsChecking] = useState(false)

  return { isAdmin, isChecking }
} 