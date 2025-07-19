"use client"

import { useState, useEffect } from "react"
import { WalletProvider } from "@/contexts/wallet-context"
import { ThemeProvider } from "@/components/theme-provider"
import WalletSetup from "@/components/wallet-setup"
import Dashboard from "@/components/dashboard"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [hasWallet, setHasWallet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if wallet exists in localStorage
    const walletData = localStorage.getItem("oc-wallet-encrypted")
    setHasWallet(!!walletData)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WalletProvider>
        <main className="min-h-screen bg-background">
          {!hasWallet ? <WalletSetup onWalletCreated={() => setHasWallet(true)} /> : <Dashboard />}
          <Toaster />
        </main>
      </WalletProvider>
    </ThemeProvider>
  )
}
