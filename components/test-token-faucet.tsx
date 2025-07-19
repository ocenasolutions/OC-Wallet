"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { getTestTokensForNetwork, getTokenBalance } from "@/lib/test-tokens"
import { Droplets, ExternalLink, Plus, Coins, TestTube } from "lucide-react"

export default function TestTokenFaucet() {
  const { currentNetwork, address, addCustomToken, refreshBalances } = useWallet()
  const { toast } = useToast()
  const [claimingTokens, setClaimingTokens] = useState<{ [address: string]: boolean }>({})

  const testTokens = getTestTokensForNetwork(currentNetwork.id)

  const handleClaimTokens = async (tokenAddress: string, symbol: string) => {
    setClaimingTokens((prev) => ({ ...prev, [tokenAddress]: true }))

    try {
      // Simulate claiming tokens (in real app, would call faucet API)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Add some mock tokens to the balance
      const mockAmount = (Math.random() * 1000 + 100).toFixed(2)

      toast({
        title: "Tokens Claimed!",
        description: `Successfully claimed ${mockAmount} ${symbol} test tokens`,
      })

      // Refresh balances to show new tokens
      await refreshBalances()
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim test tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setClaimingTokens((prev) => ({ ...prev, [tokenAddress]: false }))
    }
  }

  const handleAddToken = async (token: any) => {
    try {
      await addCustomToken({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        balance: getTokenBalance(token.address),
        icon: token.icon,
      })

      toast({
        title: "Token Added",
        description: `${token.symbol} has been added to your wallet`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add token to wallet",
        variant: "destructive",
      })
    }
  }

  if (testTokens.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <div className="text-muted-foreground">No test tokens available for {currentNetwork.name}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Test Token Faucet
        </h2>
        <p className="text-muted-foreground">
          Get free test tokens for development and testing on {currentNetwork.name}
        </p>
      </div>

      <Alert>
        <Coins className="h-4 w-4" />
        <AlertDescription>
          These are test tokens with no real value. Use them for testing transactions and DApp interactions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testTokens.map((token) => {
          const balance = getTokenBalance(token.address)
          const isClaiming = claimingTokens[token.address]

          return (
            <Card key={token.address}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{token.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{token.symbol}</CardTitle>
                      <CardDescription>{token.name}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{currentNetwork.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">{token.description}</div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Current Balance</div>
                    <div className="text-lg font-semibold">
                      {balance} {token.symbol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Decimals</div>
                    <div className="font-medium">{token.decimals}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleClaimTokens(token.address, token.symbol)}
                    disabled={isClaiming}
                    className="flex-1"
                  >
                    <Droplets className="w-4 h-4 mr-2" />
                    {isClaiming ? "Claiming..." : "Claim Tokens"}
                  </Button>
                  <Button variant="outline" onClick={() => handleAddToken(token)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {token.faucetUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(token.faucetUrl, "_blank")}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Official Faucet
                  </Button>
                )}

                <div className="text-xs text-muted-foreground">
                  Contract: {token.address.slice(0, 10)}...{token.address.slice(-8)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
