"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { Eye, EyeOff, Copy, Check, Shield, Wallet, Download } from "lucide-react"

interface WalletSetupProps {
  onWalletCreated: () => void
}

export default function WalletSetup({ onWalletCreated }: WalletSetupProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [importMnemonic, setImportMnemonic] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [mnemonicCopied, setMnemonicCopied] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const { createWallet } = useWallet()
  const { toast } = useToast()

  const handleCreateWallet = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const generatedMnemonic = await createWallet()
      setMnemonic(generatedMnemonic)
      setStep(2)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      toast({
        title: "Error",
        description: "Please enter your recovery phrase",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createWallet(importMnemonic.trim())
      await saveWalletToStorage()
      onWalletCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid recovery phrase",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveWalletToStorage = async () => {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic || importMnemonic)
      const encryptedWallet = await wallet.encrypt(password)
      localStorage.setItem("oc-wallet-encrypted", encryptedWallet)
    } catch (error) {
      console.error("Error saving wallet:", error)
      throw error
    }
  }

  const copyMnemonic = async () => {
    await navigator.clipboard.writeText(mnemonic)
    setMnemonicCopied(true)
    setTimeout(() => setMnemonicCopied(false), 2000)
    toast({
      title: "Copied",
      description: "Recovery phrase copied to clipboard",
    })
  }

  const finishSetup = async () => {
    setIsLoading(true)
    try {
      await saveWalletToStorage()
      toast({
        title: "Success",
        description: "Wallet created successfully!",
      })
      onWalletCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">OC Wallet</h1>
          <p className="text-muted-foreground mt-2">Secure Multi-Chain Cryptocurrency Wallet</p>
        </div>

        {activeTab === "create" && step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Wallet</CardTitle>
              <CardDescription>Create a new wallet with a secure recovery phrase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your password encrypts your wallet on this device. OC Wallet cannot recover it if lost.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>

              <Button onClick={handleCreateWallet} disabled={isLoading} className="w-full">
                {isLoading ? "Creating Wallet..." : "Create Wallet"}
              </Button>

              <Button variant="outline" onClick={() => setActiveTab("import")} className="w-full">
                Import Existing Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "create" && step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Backup Your Wallet</CardTitle>
              <CardDescription>Write down your 12-word recovery phrase and store it safely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This phrase is the only way to recover your wallet. Never share it with anyone.
                </AlertDescription>
              </Alert>

              <div className="relative">
                <div className={`grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg ${!showMnemonic ? "blur-sm" : ""}`}>
                  {mnemonic.split(" ").map((word, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-background rounded text-sm">
                      <span className="text-muted-foreground w-4">{index + 1}.</span>
                      <span className="font-mono">{word}</span>
                    </div>
                  ))}
                </div>
                {!showMnemonic && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="outline" onClick={() => setShowMnemonic(true)} className="bg-background">
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal Recovery Phrase
                    </Button>
                  </div>
                )}
              </div>

              {showMnemonic && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={copyMnemonic} className="flex-1 bg-transparent">
                    {mnemonicCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {mnemonicCopied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const element = document.createElement("a")
                      const file = new Blob([mnemonic], { type: "text/plain" })
                      element.href = URL.createObjectURL(file)
                      element.download = "oc-wallet-recovery.txt"
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                    }}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}

              <Button onClick={finishSetup} disabled={!showMnemonic || isLoading} className="w-full">
                {isLoading ? "Setting up..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "import" && (
          <Card>
            <CardHeader>
              <CardTitle>Import Wallet</CardTitle>
              <CardDescription>Import your existing wallet using your recovery phrase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importMnemonic">Recovery Phrase</Label>
                <Textarea
                  id="importMnemonic"
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                  placeholder="Enter your 12-word recovery phrase"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="importPassword">New Password</Label>
                <Input
                  id="importPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="importConfirmPassword">Confirm Password</Label>
                <Input
                  id="importConfirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <Button onClick={handleImportWallet} disabled={isLoading} className="w-full">
                {isLoading ? "Importing..." : "Import Wallet"}
              </Button>

              <Button variant="outline" onClick={() => setActiveTab("create")} className="w-full">
                Create New Wallet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
