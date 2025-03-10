"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Coins, Trophy, Users, Loader2 } from "lucide-react"
import { usePlayerAchievements } from "@/hooks/use-player-achievements"
import { useWallet } from "@/hooks/use-wallet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useRewards } from "@/hooks/use-rewards"
import { Button } from "@/components/ui/button"
import { useTokenManagement } from "@/hooks/use-token-management"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useActivity } from "@/hooks/use-activity"
import { useEffect } from "react"

export default function DashboardPage() {
  const { isConnected } = useWallet()
  const { achievements, isLoading: achievementsLoading, getRarityLabel } = usePlayerAchievements()
  const { 
    activities, 
    isLoading: activitiesLoading,
    refetch 
  } = useActivity()
  const {
    claimReward,
    isClaiming,
    canClaim,
    consecutiveDays,
    nextReward,
    poolBalance
  } = useRewards()
  const { 
    keyBalance,
    keyBalanceChange,
    unlockedCount, 
    thisMonthUnlocked,
    isLoading: statsLoading 
  } = useDashboardStats()

  // Refetch data when tab becomes visible
  useEffect(() => {
    refetch()
  }, [])

  const isLoading = achievementsLoading || activitiesLoading || statsLoading

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Get only unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.isUnlocked)
  
  // Function to render achievement content
  const renderAchievementsContent = () => {
    if (!isConnected) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your achievements.
            </CardDescription>
          </CardHeader>
        </Card>
      )
    }

    if (achievementsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (unlockedAchievements.length === 0) {
      return (
        <Alert className="bg-muted">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <AlertDescription className="ml-2">
            No achievements unlocked yet. Play Space Puzzle to earn your first achievement! 
            Complete puzzles, increase your score, and level up to unlock special achievements.
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unlockedAchievements.map((achievement) => (
          <Card key={achievement.id} className="bg-card transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {getRarityLabel(achievement.rarity)}
                </Badge>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between text-sm text-muted-foreground">
                <span>Level {achievement.requiredLevel}</span>
                <span>{achievement.requiredScore.toLocaleString()} points</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderTokensContent = () => {
    if (!isConnected) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view and manage your tokens.
            </CardDescription>
          </CardHeader>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Rewards</CardTitle>
          <CardDescription>Claim your daily KEY token rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{consecutiveDays} days</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Next Reward</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{nextReward} KEY</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {canClaim ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-muted-foreground">Claimed</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pool Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{poolBalance} KEY</div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={claimReward} 
              disabled={isClaiming || !canClaim}
              className="w-full"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  {canClaim ? "Claim Daily Reward" : "Already Claimed"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-full sm:w-auto min-w-[300px]">
            <TabsTrigger className="flex-1" value="overview">Overview</TabsTrigger>
            <TabsTrigger className="flex-1" value="tokens">Tokens</TabsTrigger>
            <TabsTrigger className="flex-1" value="achievements">Achievements</TabsTrigger>
          </TabsList>
        </div>
        <div className="px-2 sm:px-0">
          <TabsContent value="overview" className="space-y-4">
            <ResponsiveGrid>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KEY Balance</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{keyBalance} KEY</div>
                      <p className="text-xs text-muted-foreground">
                        {keyBalanceChange >= 0 ? "+" : ""}{keyBalanceChange}% from last month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{unlockedCount}/10</div>
                      <p className="text-xs text-muted-foreground">
                        {thisMonthUnlocked} unlocked in last 30 days
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consecutive Days</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{consecutiveDays} days</div>
                  <p className="text-xs text-muted-foreground">
                    Next reward: {nextReward} KEY
                  </p>
                </CardContent>
              </Card>
            </ResponsiveGrid>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="tokens" className="space-y-4">
            {renderTokensContent()}
          </TabsContent>
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Your unlocked achievements in Space Puzzle.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderAchievementsContent()}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

