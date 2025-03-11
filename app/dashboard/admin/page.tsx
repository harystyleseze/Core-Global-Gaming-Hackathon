"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useContracts } from "@/hooks/use-contracts"
import { useRoles } from "@/hooks/use-roles"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useTokenManagement } from "@/hooks/use-token-management"
import { useAchievements } from "@/hooks/use-achievements"
import { AdminGuard } from "@/components/auth/admin-guard"
import { useAdmin } from "@/hooks/use-admin"
import { useWalletRoles } from "@/hooks/use-wallet-roles"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { address } = useWallet()
  const { isAdmin, isChecking } = useAdmin()
  const { grantRole, revokeRole, isGranting, isRevoking } = useRoles()
  const { contracts } = useContracts()
  const { 
    mintTokens, 
    burnTokens, 
    checkBalance, 
    isMinting: isTokenMinting,
    isBurning, 
    isChecking: isTokenChecking,
    balance,
    pauseContract,
    unpauseContract,
    transferAdmin,
    isPausing,
    isUnpausing,
    isTransferringAdmin,
    isPaused,
    checkPauseState
  } = useTokenManagement()
  const { 
    createAchievement, 
    mintAchievement, 
    checkPlayerAchievements, 
    playerAchievements,
    isCreating,
    isMinting: isAchievementMinting,
    isChecking: isAchievementChecking
  } = useAchievements()
  const [mintAddress, setMintAddress] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [baseReward, setBaseReward] = useState("")
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState("")
  const [grantAddress, setGrantAddress] = useState("")
  const [revokeAddress, setRevokeAddress] = useState("")
  const [selectedGrantRole, setSelectedGrantRole] = useState<"admin" | "game" | "minter">("admin")
  const [selectedRevokeRole, setSelectedRevokeRole] = useState<"admin" | "game" | "minter">("admin")
  const [burnAddress, setBurnAddress] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  const [checkAddress, setCheckAddress] = useState("")
  const [newAdminAddress, setNewAdminAddress] = useState("")
  const [mintPlayerAddress, setMintPlayerAddress] = useState("")
  const [mintAchievementId, setMintAchievementId] = useState("")
  const [checkPlayerAddress, setCheckPlayerAddress] = useState("")
  const { admin: isAdminRole } = useWalletRoles()
  const router = useRouter()

  useEffect(() => {
    if (!isAdminRole) {
      router.push('/dashboard')
    }
  }, [isAdminRole, router])

  if (!isAdminRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleGrantRole = async () => {
    console.log('Grant role button clicked:', { grantAddress, selectedGrantRole })
    try {
      await grantRole(grantAddress, selectedGrantRole)
      setGrantAddress("")
      console.log('Role granted successfully')
    } catch (error) {
      console.error('Error in handleGrantRole:', error)
    }
  }

  const handleRevokeRole = async () => {
    console.log('Revoke role button clicked:', { revokeAddress, selectedRevokeRole })
    try {
      await revokeRole(revokeAddress, selectedRevokeRole)
      setRevokeAddress("")
      console.log('Role revoked successfully')
    } catch (error) {
      console.error('Error in handleRevokeRole:', error)
    }
  }

  const handleMintTokens = async () => {
    try {
      await mintTokens(mintAddress, mintAmount)
      setMintAddress("")
      setMintAmount("")
    } catch (error) {
      console.error('Error in handleMintTokens:', error)
    }
  }

  const handleBurnTokens = async () => {
    try {
      await burnTokens(burnAddress, burnAmount)
      setBurnAddress("")
      setBurnAmount("")
    } catch (error) {
      console.error('Error in handleBurnTokens:', error)
    }
  }

  const handleCheckBalance = async () => {
    try {
      await checkBalance(checkAddress)
    } catch (error) {
      console.error('Error in handleCheckBalance:', error)
    }
  }

  const handleTransferAdmin = async () => {
    try {
      await transferAdmin(newAdminAddress)
      setNewAdminAddress("")
    } catch (error) {
      console.error('Error in handleTransferAdmin:', error)
    }
  }

  return (
    <AdminGuard>
      <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage game tokens, rewards, and achievements.</p>
        </div>

        <Tabs defaultValue="tokens" className="space-y-4 md:space-y-6">
          <TabsList className="w-full flex-wrap justify-start gap-2">
            <TabsTrigger value="tokens" className="flex-1 min-w-[120px]">Token Management</TabsTrigger>
            <TabsTrigger value="rewards" className="flex-1 min-w-[120px]">Reward Config</TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1 min-w-[120px]">Achievements</TabsTrigger>
            <TabsTrigger value="users" className="flex-1 min-w-[120px]">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">Token Management</CardTitle>
                <CardDescription className="text-sm">Mint, burn, and check token balances.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Mint Tokens</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mint-address">Recipient Address</Label>
                          <Input
                            id="mint-address"
                            placeholder="0x..."
                            value={mintAddress}
                            onChange={(e) => setMintAddress(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mint-amount">Amount</Label>
                          <Input
                            id="mint-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          disabled={!contracts || !mintAddress || !mintAmount || isTokenMinting}
                          onClick={handleMintTokens}
                        >
                          {isTokenMinting ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Minting...</span>
                            </div>
                          ) : (
                            "Mint Tokens"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Check Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="check-address">Address</Label>
                          <Input
                            id="check-address"
                            placeholder="0x..."
                            value={checkAddress}
                            onChange={(e) => setCheckAddress(e.target.value)}
                          />
                        </div>
                        {balance && (
                          <div className="rounded-lg bg-muted p-2 text-center">
                            <p className="text-sm font-medium">Balance</p>
                            <p className="text-lg font-bold">{balance} tokens</p>
                          </div>
                        )}
                        <Button
                          className="w-full"
                          disabled={!contracts || !checkAddress || isTokenChecking}
                          onClick={handleCheckBalance}
                        >
                          {isTokenChecking ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Checking...</span>
                            </div>
                          ) : (
                            "Check Balance"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Burn Tokens</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="burn-address">From Address</Label>
                          <Input
                            id="burn-address"
                            placeholder="0x..."
                            value={burnAddress}
                            onChange={(e) => setBurnAddress(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="burn-amount">Amount</Label>
                          <Input
                            id="burn-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={burnAmount}
                            onChange={(e) => setBurnAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          disabled={!contracts || !burnAddress || !burnAmount || isBurning}
                          onClick={handleBurnTokens}
                        >
                          {isBurning ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Burning...</span>
                            </div>
                          ) : (
                            "Burn Tokens"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reward Configuration</CardTitle>
                <CardDescription>Configure daily rewards and consecutive day multipliers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Base Reward</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="base-reward">Base Reward Amount</Label>
                          <Input
                            id="base-reward"
                            type="number"
                            placeholder="Enter amount"
                            value={baseReward}
                            onChange={(e) => setBaseReward(e.target.value)}
                            min="1"
                          />
                        </div>
                        <Button className="w-full" disabled={!contracts || !baseReward}>
                          Set Base Reward
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Max Consecutive Days</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="max-days">Maximum Days</Label>
                          <Input
                            id="max-days"
                            type="number"
                            placeholder="Enter number of days"
                            value={maxConsecutiveDays}
                            onChange={(e) => setMaxConsecutiveDays(e.target.value)}
                            min="1"
                          />
                        </div>
                        <Button className="w-full" disabled={!contracts || !maxConsecutiveDays}>
                          Set Max Days
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">Achievement Management</CardTitle>
                <CardDescription className="text-sm">Create and manage game achievements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Create Achievement</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <form 
                        className="space-y-4"
                        onSubmit={async (e) => {
                          e.preventDefault()
                          const form = e.target as HTMLFormElement
                          const formData = new FormData(form)
                          
                          await createAchievement({
                            name: formData.get('name') as string,
                            description: formData.get('description') as string,
                            rarity: Number(formData.get('rarity')),
                            requiredScore: Number(formData.get('requiredScore')),
                            requiredLevel: Number(formData.get('requiredLevel')),
                          })
                          
                          form.reset()
                        }}
                      >
                        <div className="space-y-4 md:space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" required />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="rarity">Rarity</Label>
                              <select
                                id="rarity"
                                name="rarity"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                              >
                                <option value="0">Common</option>
                                <option value="1">Uncommon</option>
                                <option value="2">Rare</option>
                                <option value="3">Epic</option>
                                <option value="4">Legendary</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="requiredScore">Required Score</Label>
                              <Input 
                                id="requiredScore" 
                                name="requiredScore" 
                                type="number" 
                                min="0" 
                                required 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="requiredLevel">Required Level</Label>
                              <Input 
                                id="requiredLevel" 
                                name="requiredLevel" 
                                type="number" 
                                min="1" 
                                required 
                              />
                            </div>
                          </div>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={!contracts || isCreating}
                          >
                            {isCreating ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="whitespace-nowrap">Creating...</span>
                              </div>
                            ) : (
                              "Create Achievement"
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Mint Achievement</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="player-address">Player Address</Label>
                          <Input
                            id="player-address"
                            placeholder="0x..."
                            value={mintPlayerAddress}
                            onChange={(e) => setMintPlayerAddress(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="achievement-id">Achievement ID</Label>
                          <Input
                            id="achievement-id"
                            type="number"
                            min="1"
                            value={mintAchievementId}
                            onChange={(e) => setMintAchievementId(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          disabled={!contracts || !mintPlayerAddress || !mintAchievementId || isAchievementMinting}
                          onClick={() => mintAchievement(mintPlayerAddress, Number(mintAchievementId))}
                        >
                          {isAchievementMinting ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Minting...</span>
                            </div>
                          ) : (
                            "Mint Achievement"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Check Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="check-player">Player Address</Label>
                          <Input
                            id="check-player"
                            placeholder="0x..."
                            value={checkPlayerAddress}
                            onChange={(e) => setCheckPlayerAddress(e.target.value)}
                          />
                        </div>
                        {playerAchievements.length > 0 && (
                          <div className="rounded-lg bg-muted p-2">
                            <p className="text-sm font-medium">Unlocked Achievements</p>
                            <div className="mt-2 space-y-1">
                              {playerAchievements.map((id) => (
                                <p key={id} className="text-sm">Achievement #{id}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button
                          className="w-full"
                          disabled={!contracts || !checkPlayerAddress || isAchievementChecking}
                          onClick={() => checkPlayerAchievements(checkPlayerAddress)}
                        >
                          {isAchievementChecking ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Checking...</span>
                            </div>
                          ) : (
                            "Check Achievements"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">User Management</CardTitle>
                <CardDescription className="text-sm">Manage user roles and contract administration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Grant Role</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="grant-address">User Address</Label>
                          <Input 
                            id="grant-address" 
                            placeholder="0x..." 
                            value={grantAddress}
                            onChange={(e) => setGrantAddress(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-type">Role</Label>
                          <select
                            id="role-type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedGrantRole}
                            onChange={(e) => setSelectedGrantRole(e.target.value as "admin" | "game" | "minter")}
                          >
                            <option value="admin">Admin</option>
                            <option value="game">Game</option>
                            <option value="minter">Minter</option>
                          </select>
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={!contracts || !grantAddress || isGranting}
                          onClick={handleGrantRole}
                        >
                          {isGranting ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Granting Role...</span>
                            </div>
                          ) : (
                            "Grant Role"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Revoke Role</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="revoke-address">User Address</Label>
                          <Input 
                            id="revoke-address" 
                            placeholder="0x..." 
                            value={revokeAddress}
                            onChange={(e) => setRevokeAddress(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="revoke-role">Role</Label>
                          <select
                            id="revoke-role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedRevokeRole}
                            onChange={(e) => setSelectedRevokeRole(e.target.value as "admin" | "game" | "minter")}
                          >
                            <option value="admin">Admin</option>
                            <option value="game">Game</option>
                            <option value="minter">Minter</option>
                          </select>
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={!contracts || !revokeAddress || isRevoking}
                          onClick={handleRevokeRole}
                        >
                          {isRevoking ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="whitespace-nowrap">Revoking Role...</span>
                            </div>
                          ) : (
                            "Revoke Role"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="space-y-1 p-4 md:p-6">
                      <CardTitle className="text-sm font-medium">Contract Controls</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Current State: {isPaused ? (
                          <span className="text-destructive font-medium">Paused</span>
                        ) : (
                          <span className="text-green-600 font-medium">Active</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button
                            className="w-full"
                            disabled={!contracts || isPausing || isPaused}
                            onClick={pauseContract}
                            variant="destructive"
                          >
                            {isPausing ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="whitespace-nowrap">Pausing...</span>
                              </div>
                            ) : (
                              "Pause Contract"
                            )}
                          </Button>
                          <Button
                            className="w-full"
                            disabled={!contracts || isUnpausing || !isPaused}
                            onClick={unpauseContract}
                          >
                            {isUnpausing ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="whitespace-nowrap">Unpausing...</span>
                              </div>
                            ) : (
                              "Unpause Contract"
                            )}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-admin">Transfer Admin Role</Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              id="new-admin"
                              placeholder="New admin address..."
                              value={newAdminAddress}
                              onChange={(e) => setNewAdminAddress(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              disabled={!contracts || !newAdminAddress || isTransferringAdmin}
                              onClick={handleTransferAdmin}
                              className="w-full sm:w-auto"
                            >
                              {isTransferringAdmin ? (
                                <div className="flex items-center justify-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span className="whitespace-nowrap">Transferring...</span>
                                </div>
                              ) : (
                                "Transfer"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}

