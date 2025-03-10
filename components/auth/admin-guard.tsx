"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { useWallet } from "@/hooks/use-wallet"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const { isConnected } = useWallet()

  useEffect(() => {
    if (isConnected && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, isConnected, router])

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Please connect your wallet to access admin features.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
} 