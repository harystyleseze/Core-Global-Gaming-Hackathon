import { useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, ROLES, RoleType } from '@/config/contracts'
import GameTokenABI from '@/lib/abi/GameToken.json'
import { toast } from '@/components/ui/toast'
import { useAdmin } from './use-admin'

export function useRoles() {
  const { isAdmin } = useAdmin()
  const [isGranting, setIsGranting] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  const getRoleBytes = (role: RoleType) => {
    const roleBytes = ROLES[role.toUpperCase() as keyof typeof ROLES]
    console.log('Getting role bytes for:', role, 'Result:', roleBytes)
    return roleBytes
  }

  const checkAdminAccess = async (contract: ethers.Contract, address: string) => {
    const hasAdminRole = await contract.hasAdminRole(address)
    
    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "Your wallet does not have admin privileges",
        variant: "destructive",
        duration: 5000,
      })
      throw new Error('Missing admin role - Your wallet does not have admin privileges')
    }
    return true
  }

  const hasRole = async (contract: ethers.Contract, address: string, role: RoleType) => {
    console.log('Checking if address has role:', { address, role })
    const roleBytes = getRoleBytes(role)
    const result = await contract.hasRole(roleBytes, address)
    console.log('Role check result:', result)
    return result
  }

  const grantRole = async (address: string, role: RoleType) => {
    console.log('Attempting to grant role:', { address, role })
    try {
      setIsGranting(true)
      if (!ethers.isAddress(address)) {
        console.error('Invalid address provided:', address)
        throw new Error('Invalid address')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()
      console.log('Signer address:', signerAddress)

      const contract = new ethers.Contract(CONTRACT_ADDRESSES.gameToken, GameTokenABI.abi, signer)
      console.log('Contract instance created')

      await checkAdminAccess(contract, signerAddress)
      console.log('Admin access verified')

      const alreadyHasRole = await hasRole(contract, address, role)
      if (alreadyHasRole) {
        console.log('Address already has role:', role)
        toast({
          title: "Role Already Granted",
          description: `Address ${address} already has the ${role} role`,
          duration: 5000,
          variant: "default",
        })
        return
      }

      console.log('Executing grantRole transaction')
      const tx = await contract.grantRole(getRoleBytes(role), address)
      console.log('Transaction submitted:', tx.hash)
      await tx.wait()
      console.log('Transaction confirmed')

      toast({ 
        title: 'Success', 
        description: `Successfully granted ${role} role to ${address}` 
      })
    } catch (error) {
      console.error('Error in grantRole:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant role",
        duration: 5000,
        variant: "destructive",
      })
    } finally {
      setIsGranting(false)
    }
  }

  const revokeRole = async (address: string, role: RoleType) => {
    try {
      setIsRevoking(true)
      if (!ethers.isAddress(address)) throw new Error('Invalid address')
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.gameToken, GameTokenABI.abi, signer)
      
      await checkAdminAccess(contract, signerAddress)

      // Check if address has the role to revoke
      const hasRoleToRevoke = await hasRole(contract, address, role)
      if (!hasRoleToRevoke) {
        toast({
          title: "Role Not Found",
          description: `Address ${address} does not have the ${role} role`,
          variant: "default",
        })
        return
      }

      const tx = await contract.revokeRole(getRoleBytes(role), address)
      await tx.wait()
      toast({ title: 'Success', description: `Successfully revoked ${role} role from ${address}` })
    } catch (error) {
      console.error('Error revoking role:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to revoke role',
        variant: 'destructive',
      })
    } finally {
      setIsRevoking(false)
    }
  }

  return { 
    grantRole, 
    revokeRole, 
    isGranting, 
    isRevoking 
  }
}