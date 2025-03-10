"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Award, Coins, Loader2, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Flame } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useActivity } from "@/hooks/use-activity"

// Add event type definitions
type ActivityType = 'reward' | 'achievement' | 'tokenize' | 'detokenize' | 'transfer' | 'burn'

interface ActivityDetails {
  title: string
  description: string
  icon: React.ReactElement
  color: string
}

export function RecentActivity() {
  const { activities, isLoading } = useActivity()

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getActivityDetails = (activity: any): ActivityDetails => {
    switch (activity.type) {
      case 'reward':
        return {
          title: "Daily Reward Claimed",
          description: `You claimed ${activity.data.amount} KEY tokens`,
          icon: <Coins className="h-4 w-4" />,
          color: "text-yellow-500"
        }
      case 'achievement':
        return {
          title: "Achievement Unlocked",
          description: `You unlocked "${activity.data.name}"`,
          icon: <Award className="h-4 w-4" />,
          color: "text-purple-500"
        }
      case 'tokenize':
        return {
          title: "Keys Tokenized",
          description: `You tokenized ${activity.data.amount} keys`,
          icon: <ArrowRightLeft className="h-4 w-4" />,
          color: "text-green-500"
        }
      case 'detokenize':
        return {
          title: "Keys Detokenized",
          description: `You converted ${activity.data.amount} tokens to keys`,
          icon: <ArrowRightLeft className="h-4 w-4" />,
          color: "text-blue-500"
        }
      case 'transfer':
        return {
          title: activity.data.from === activity.data.player ? "Tokens Sent" : "Tokens Received",
          description: `${activity.data.amount} KEY ${activity.data.from === activity.data.player ? 'to' : 'from'} ${
            activity.data.from === activity.data.player ? activity.data.to : activity.data.from
          }`,
          icon: activity.data.from === activity.data.player ? 
            <ArrowUpRight className="h-4 w-4" /> : 
            <ArrowDownLeft className="h-4 w-4" />,
          color: activity.data.from === activity.data.player ? "text-red-500" : "text-green-500"
        }
      case 'burn':
        return {
          title: "Tokens Burned",
          description: `${activity.data.amount} KEY tokens burned`,
          icon: <Flame className="h-4 w-4" />,
          color: "text-red-500"
        }
      default:
        return {
          title: "Activity",
          description: "Unknown activity",
          icon: <Coins className="h-4 w-4" />,
          color: "text-gray-500"
        }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <Coins className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">No Recent Activity</p>
        <p className="text-xs text-center mt-1">
          Your activity from the past week will appear here.<br />
          Try claiming daily rewards or unlocking achievements!
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-4">
        {activities.map((activity, i) => {
          const details = getActivityDetails(activity)
          const date = new Date(activity.timestamp * 1000)
          return (
            <div key={i} className="flex items-start space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className={`bg-primary/10 ${details.color}`}>
                  {details.icon}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm font-medium leading-none">{details.title}</p>
                <p className="text-sm text-muted-foreground break-words">{details.description}</p>
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                </p>
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {getTimeAgo(activity.timestamp)}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

