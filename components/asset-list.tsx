"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export default function AssetList() {
  const { balance, currentNetwork, tokens, addCustomToken } = useWallet()
  const { toast } = useToast()
  const [showAddToken, setShowAddToken] = useState(false)
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenDecimals, setTokenDecimals] = useState("18")

  const handleAddToken = () => {
    if (!tokenAddress || !tokenSymbol || !tokenName) {
      toast({
        title: "Error",
        description: "Please fill in all token details",
        variant: "destructive",
      })
      return
    }

    const newToken = {
      address: tokenAddress,
      symbol: tokenSymbol,
      name: tokenName,
      decimals: Number.parseInt(tokenDecimals),
      balance: "0",
    }

    addCustomToken(newToken)
    setShowAddToken(false)
    setTokenAddress("")
    setTokenSymbol("")
    setTokenName("")
    setTokenDecimals("18")

    toast({
      title: "Success",
      description: `${tokenSymbol} token added successfully`,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatBalance = (balance: string, decimals = 18) => {
    const num = Number.parseFloat(balance)
    if (num === 0) return "0"
    if (num < 0.01) return "< 0.01"
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assets</h2>
        <Dialog open={showAddToken} onOpenChange={setShowAddToken}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Token</DialogTitle>
              <DialogDescription>Add a custom ERC-20 token to your wallet</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenAddress">Token Contract Address</Label>
                <Input
                  id="tokenAddress"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input
                  id="tokenSymbol"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  placeholder="e.g., USDC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g., USD Coin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenDecimals">Decimals</Label>
                <Input
                  id="tokenDecimals"
                  type="number"
                  value={tokenDecimals}
                  onChange={(e) => setTokenDecimals(e.target.value)}
                  placeholder="18"
                />
              </div>
              <Button onClick={handleAddToken} className="w-full">
                Add Token
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Native Token */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-lg">
                {currentNetwork.icon}
              </div>
              <div>
                <div className="font-semibold">{currentNetwork.symbol}</div>
                <div className="text-sm text-muted-foreground">{currentNetwork.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {formatBalance(balance)} {currentNetwork.symbol}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPrice(Number.parseFloat(balance) * 2500)} {/* Mock price */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ERC-20 Tokens */}
      {tokens.map((token) => (
        <Card key={token.address}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-lg">
                  {token.icon || token.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatBalance(token.balance, token.decimals)} {token.symbol}
                </div>
                {token.price && (
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(Number.parseFloat(token.balance) * token.price)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {tokens.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">No tokens found. Add custom tokens to see them here.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
