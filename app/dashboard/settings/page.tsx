"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useWallet } from "@/hooks/use-wallet"
import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { address } = useWallet()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    username: "",
    email: "",
    notifications: {
      achievements: true,
      rewards: true,
      gameUpdates: false
    }
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input 
                  id="wallet" 
                  value={address || 'Not connected'} 
                  disabled 
                  className="max-w-xl font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  placeholder="Enter your username"
                  className="max-w-xl"
                  value={settings.username}
                  onChange={(e) => setSettings({
                    ...settings,
                    username: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-xl"
                  value={settings.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: e.target.value
                  })}
                />
              </div>
            </div>

            <Separator />

            {/* Notifications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Unlocks</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you unlock new achievements
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.achievements}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        achievements: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Rewards</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your daily reward is available
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.rewards}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        rewards: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Game Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Stay informed about new features and updates
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications.gameUpdates}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        gameUpdates: checked
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 