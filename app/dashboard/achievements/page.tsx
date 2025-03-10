"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { usePlayerAchievements } from "@/hooks/use-player-achievements"
import { Loader2, Trophy, Lock, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AchievementsPage() {
  const { isConnected } = useWallet()
  const { achievements, isLoading, getRarityLabel } = usePlayerAchievements()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Please connect your wallet to view achievements.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getRarityColor = (rarity: number) => {
    const colors = {
      0: "bg-gray-100 text-gray-800",     // Common
      1: "bg-green-100 text-green-800",   // Uncommon
      2: "bg-blue-100 text-blue-800",     // Rare
      3: "bg-purple-100 text-purple-800", // Epic
      4: "bg-orange-100 text-orange-800"  // Legendary
    }
    return colors[rarity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Game Achievements</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Track your progress and unlock special achievements in Space Puzzle.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={achievement.isUnlocked ? "" : "opacity-75"}>
            <CardContent className="p-6">
              <div className="flex justify-end mb-4">
                <Badge 
                  variant="secondary" 
                  className={achievement.isUnlocked ? "bg-green-100 text-green-800" : ""}
                >
                  {getRarityLabel(achievement.rarity)}
                </Badge>
              </div>

              <div className="flex justify-center mb-4">
                {achievement.isUnlocked ? (
                  <Trophy className="h-12 w-12 text-yellow-500" />
                ) : (
                  <Lock className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>

              <div className="mt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <p>Level {achievement.requiredLevel}</p>
                  <p>{achievement.requiredScore.toLocaleString()} points</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className={`text-sm font-medium ${
                  achievement.isUnlocked ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {achievement.isUnlocked ? 'Achievement Unlocked!' : 'Locked'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {achievements.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Achievements Found</CardTitle>
            <CardDescription>
              Start playing Space Puzzle to unlock achievements!
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

