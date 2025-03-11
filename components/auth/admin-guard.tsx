"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { useWallet } from "@/hooks/use-wallet"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isChecking } = useAdmin()
  const router = useRouter()
  const { isConnected } = useWallet()

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, isChecking, router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  return <>{children}</>
} 