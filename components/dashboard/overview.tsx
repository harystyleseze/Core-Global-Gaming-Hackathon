"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActivity } from "@/hooks/use-activity"
import { Loader2 } from "lucide-react"
import { formatEther } from "ethers"

export function Overview() {
  const { balanceHistory, timeRange, setTimeRange, isLoading } = useActivity()

  const formatYAxisTick = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`
    }
    return value.toFixed(1)
  }

  const formatData = (data: any[]) => {
    return data.map(point => ({
      name: new Date(point.timestamp * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      total: Number(formatEther(point.balance)) // Keep as number for the chart
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-sm font-medium">Balance History</h3>
        <Select 
          value={timeRange} 
          onValueChange={(value: 'day' | 'week' | 'month') => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[350px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatData(balanceHistory)}>
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={formatYAxisTick}
              width={60}
            />
            <Bar 
              dataKey="total" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
              className="fill-primary" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

