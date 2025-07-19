"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/contexts/wallet-context"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { Shield, Key, Download, Trash2, Moon, Sun, Globe, AlertTriangle, Eye, EyeOff } from "lucide-react"

export default function Settings() {
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false)
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)

  const { lockWallet, wallet } = useWallet()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const handleExportRecoveryPhrase = () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      })
      return
    }

    // In a real app, verify password first
    setShowRecoveryDialog(true)
    setPassword("")
  }

  const handleChangePassword = () => {
    if (!password || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    // In a real app, would re-encrypt wallet with new password
    toast({
      title: "Success",
      description: "Password changed successfully",
    })
    setShowPasswordDialog(false)
    setPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleDeleteWallet = () => {
    localStorage.removeItem("oc-wallet-encrypted")
    toast({
      title: "Wallet Deleted",
      description: "Your wallet has been permanently deleted",
    })
    window.location.reload()
  }

  const mockRecoveryPhrase =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">Manage your wallet settings and security</p>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your wallet security and backup options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Biometric Authentication</Label>
              <p className="text-sm text-muted-foreground">Use Face ID or Fingerprint to unlock wallet</p>
            </div>
            <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
          </div>

          <Separator />

          <div className="space-y-3">
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full">
                    Change Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export Recovery Phrase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recovery Phrase</DialogTitle>
                  <DialogDescription>Write down these words in order and store them safely</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Never share your recovery phrase. Anyone with these words can access your wallet.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Recovery Phrase</Label>
                      <Button variant="ghost" size="sm" onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}>
                        {showRecoveryPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div
                      className={`grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg ${!showRecoveryPhrase ? "blur-sm" : ""}`}
                    >
                      {mockRecoveryPhrase.split(" ").map((word, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-background rounded text-sm">
                          <span className="text-muted-foreground w-4">{index + 1}.</span>
                          <span className="font-mono">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {showRecoveryPhrase && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(mockRecoveryPhrase)
                        toast({
                          title: "Copied",
                          description: "Recovery phrase copied to clipboard",
                        })
                      }}
                      className="w-full"
                    >
                      Copy to Clipboard
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            App Settings
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for transactions</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that will affect your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Wallet</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Make sure you have backed up your recovery phrase.
                </DialogDescription>
              </DialogHeader>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your wallet and all associated data will be permanently deleted from this device.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteWallet} className="flex-1">
                  Delete Wallet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="font-semibold">OC Wallet</div>
            <div className="text-sm text-muted-foreground">Version 1.0.0</div>
            <div className="text-xs text-muted-foreground">Built with security and privacy in mind</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
