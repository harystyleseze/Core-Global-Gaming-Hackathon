"use client"

import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Bell, Menu } from "lucide-react"
import { useState } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function Header() {
  const { address } = useWallet()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation menu for Space Puzzle
            </SheetDescription>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {address ? (
            <div className="text-sm font-medium truncate max-w-[120px]">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>
    </header>
  )
}

