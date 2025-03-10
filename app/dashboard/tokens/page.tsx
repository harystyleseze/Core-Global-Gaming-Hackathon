"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/use-wallet"
import { useTokenManagement } from "@/hooks/use-token-management"
import { Loader2, Coins, Shield } from "lucide-react"
import { useRewards } from "@/hooks/use-rewards"
import { useToast } from "@/components/ui/use-toast"
import { useAdmin } from "@/hooks/use-admin"

export default function TokensPage() {
  const { isConnected } = useWallet()
  const {
    tokenizeKeys,
    detokenizeKeys,
    keyBalance,
    isTokenizing,
    isDetokenizing,
    MAX_TOKENIZE_AMOUNT,
    TOKENIZE_COOLDOWN
  } = useTokenManagement()

  const {
    claimReward,
    isClaiming,
    canClaim,
    consecutiveDays,
    nextReward,
    poolBalance,
    fundPool,
    isFunding
  } = useRewards()

  const { toast } = useToast()

  const [tokenizeAmount, setTokenizeAmount] = useState("")
  const [detokenizeAmount, setDetokenizeAmount] = useState("")
  const [fundAmount, setFundAmount] = useState("")

  const { isAdmin } = useAdmin()

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleClaimReward = async () => {
    try {
      await claimReward()
      toast({
        title: "Success",
        description: "Daily reward claimed successfully!",
        className: "border-green-400",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim reward",
        className: "destructive border-red-400",
      })
    }
  }

  const handleFundPool = async () => {
    try {
      await fundPool(fundAmount)
      setFundAmount("")
      toast({
        title: "Success",
        description: `Successfully funded pool with ${fundAmount} KEY`,
        className: "border-green-400",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fund pool",
        className: "destructive border-red-400",
      })
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Please connect your wallet to manage tokens.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Token Management</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {isAdmin 
            ? "Manage tokens and reward pool as admin."
            : "View your daily rewards and token balance."
          }
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Rewards</CardTitle>
            <CardDescription>Claim your daily KEY token rewards.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current Streak</div>
                  <div className="text-2xl font-bold">{consecutiveDays} days</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Next Reward</div>
                  <div className="text-2xl font-bold">{nextReward} KEY</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <div className="text-2xl font-bold">{canClaim ? "Available" : "Claimed"}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Pool Balance</div>
                  <div className="text-2xl font-bold">{poolBalance} KEY</div>
                </div>
              </div>

              <Button 
                onClick={handleClaimReward} 
                disabled={isClaiming || !canClaim} 
                className="w-full"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  "Claim Daily Reward"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Tokenize Keys</CardTitle>
                <CardDescription>Convert in-game keys to KEY tokens.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenize-amount">Amount</Label>
                    <Input
                      id="tokenize-amount"
                      type="number"
                      placeholder={`Enter amount (1-${MAX_TOKENIZE_AMOUNT})`}
                      value={tokenizeAmount}
                      onChange={(e) => setTokenizeAmount(e.target.value)}
                      min="1"
                      max={MAX_TOKENIZE_AMOUNT}
                    />
                    <p className="text-sm text-muted-foreground">
                      Limits: 1-{MAX_TOKENIZE_AMOUNT} keys per transaction. 
                      Cooldown: {Math.floor(TOKENIZE_COOLDOWN / 3600)} hour
                    </p>
                  </div>
                  <Button 
                    onClick={() => tokenizeKeys(tokenizeAmount)}
                    disabled={isTokenizing || !tokenizeAmount} 
                    className="w-full"
                  >
                    {isTokenizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Tokenizing...
                      </>
                    ) : (
                      <>
                        <Coins className="mr-2 h-4 w-4" />
                        Tokenize Keys
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detokenize Keys</CardTitle>
                <CardDescription>Convert KEY tokens back to in-game keys.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="detokenize-amount">Amount</Label>
                    <Input
                      id="detokenize-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={detokenizeAmount}
                      onChange={(e) => setDetokenizeAmount(e.target.value)}
                      min="1"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current balance: {keyBalance} KEY
                    </p>
                  </div>
                  <Button 
                    onClick={() => detokenizeKeys(detokenizeAmount)}
                    disabled={isDetokenizing || !detokenizeAmount} 
                    className="w-full"
                  >
                    {isDetokenizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Detokenizing...
                      </>
                    ) : (
                      <>
                        <Coins className="mr-2 h-4 w-4" />
                        Detokenize Keys
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Fund Reward Pool</CardTitle>
                <CardDescription>Add tokens to the reward pool for daily rewards.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fund-amount">Amount</Label>
                    <Input
                      id="fund-amount"
                      type="number"
                      placeholder="Enter amount to fund"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current pool balance: {poolBalance} KEY
                    </p>
                  </div>
                  <Button 
                    onClick={handleFundPool}
                    disabled={isFunding || !fundAmount || parseFloat(fundAmount) <= 0} 
                    className="w-full"
                  >
                    {isFunding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Funding...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Fund Pool
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

