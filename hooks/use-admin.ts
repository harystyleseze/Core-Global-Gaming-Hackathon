import { useWallet } from './use-wallet'

const ADMIN_ADDRESSES = [
  "0xbbf05c9Bb56beb3575977178290a4A3B619e71cf".toLowerCase()
  // Add more admin addresses if needed
]

export function useAdmin() {
  const { address } = useWallet()
  
  const isAdmin = address ? ADMIN_ADDRESSES.includes(address.toLowerCase()) : false

  return { isAdmin }
} 