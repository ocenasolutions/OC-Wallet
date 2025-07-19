"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import WalletHeader from "@/components/wallet-header"
import AssetList from "@/components/asset-list"
import NFTGallery from "@/components/nft-gallery"
import TransactionHistory from "@/components/transaction-history"
import SendReceive from "@/components/send-receive"
import DAppBrowser from "@/components/dapp-browser"
import Settings from "@/components/settings"
import UnlockWallet from "@/components/unlock-wallet"
import ContactsManager from "@/components/contacts-manager"
import TestTokenFaucet from "@/components/test-token-faucet"
import TransactionExplorer from "@/components/transaction-explorer"
import WalletAnalytics from "@/components/wallet-analytics"
import {
  Wallet,
  Send,
  QrCode,
  History,
  ImageIcon,
  Globe,
  SettingsIcon,
  RefreshCw,
  CreditCard,
  Users,
  TestTube,
  Search,
  BarChart3,
} from "lucide-react"
import FiatOnramp from "@/components/fiat-onramp"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("assets")
  const [showSendReceive, setShowSendReceive] = useState(false)
  const [sendReceiveMode, setSendReceiveMode] = useState<"send" | "receive">("send")
  const { isUnlocked, balance, currentNetwork, refreshBalances, simulateReceiveTransaction } = useWallet()
  const { toast } = useToast()
  const [showFiatOnramp, setShowFiatOnramp] = useState(false)

  const handleRefresh = async () => {
    try {
      await refreshBalances()
      toast({
        title: "Refreshed",
        description: "Balances updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh balances",
        variant: "destructive",
      })
    }
  }

  // Demo function to simulate receiving a transaction
  const handleSimulateReceive = async () => {
    try {
      const mockSender = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
      const amount = (Math.random() * 0.1 + 0.01).toFixed(6)

      await simulateReceiveTransaction(mockSender, amount, undefined, "Test transaction from demo")

      toast({
        title: "Transaction Received!",
        description: `Received ${amount} ${currentNetwork.symbol} from ${mockSender.slice(0, 8)}...`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to simulate transaction",
        variant: "destructive",
      })
    }
  }

  if (!isUnlocked) {
    return <UnlockWallet />
  }

  if (showSendReceive) {
    return <SendReceive mode={sendReceiveMode} onClose={() => setShowSendReceive(false)} />
  }

  if (showFiatOnramp) {
    return <FiatOnramp onClose={() => setShowFiatOnramp(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <WalletHeader />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Balance Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {Number.parseFloat(balance).toFixed(4)} {currentNetwork.symbol}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="text-2xl">{currentNetwork.icon}</span>
                  {currentNetwork.name}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleSimulateReceive}>
                  Demo Receive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSendReceiveMode("send")
                  setShowSendReceive(true)
                }}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSendReceiveMode("receive")
                  setShowSendReceive(true)
                }}
                className="flex-1"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Receive
              </Button>
              <Button variant="outline" onClick={() => setShowFiatOnramp(true)} className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Buy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="nfts" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">NFTs</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Explorer</span>
            </TabsTrigger>
            <TabsTrigger value="faucet" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Faucet</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="dapps" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">DApps</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-6">
            <AssetList />
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            <NFTGallery />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <ContactsManager />
          </TabsContent>

          <TabsContent value="explorer" className="mt-6">
            <TransactionExplorer />
          </TabsContent>

          <TabsContent value="faucet" className="mt-6">
            <TestTokenFaucet />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <WalletAnalytics />
          </TabsContent>

          <TabsContent value="dapps" className="mt-6">
            <DAppBrowser />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
