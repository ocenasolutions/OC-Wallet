"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, QrCode, Scan, Copy, Check, AlertCircle } from "lucide-react"
import QRCode from "qrcode"

interface SendReceiveProps {
  mode: "send" | "receive"
  onClose: () => void
}

export default function SendReceive({ mode, onClose }: SendReceiveProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [memo, setMemo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [addressCopied, setAddressCopied] = useState(false)

  const { address, balance, currentNetwork, tokens, sendTransaction } = useWallet()
  const { toast } = useToast()

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(address)
      setQrCodeUrl(url)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setAddressCopied(true)
    setTimeout(() => setAddressCopied(false), 2000)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Error",
        description: "Invalid recipient address",
        variant: "destructive",
      })
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Invalid amount",
        variant: "destructive",
      })
      return
    }

    // Check balance
    const availableBalance = selectedToken
      ? Number.parseFloat(tokens.find((t) => t.address === selectedToken)?.balance || "0")
      : Number.parseFloat(balance)

    if (amountNum > availableBalance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const txHash = await sendTransaction(recipient, amount, selectedToken || undefined)
      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send transaction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  if (mode === "receive") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Receive {currentNetwork.symbol}</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Your Wallet Address</CardTitle>
              <CardDescription>Share this address to receive {currentNetwork.symbol} and tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <Button onClick={generateQRCode} variant="outline">
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="flex gap-2">
                  <Input value={address} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={copyAddress}>
                    {addressCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Only send {currentNetwork.name} compatible assets to this address. Sending other assets may result in
                  permanent loss.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Send {currentNetwork.symbol}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Transaction</CardTitle>
            <CardDescription>Send {currentNetwork.symbol} or tokens to another address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <div className="flex gap-2">
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
                <Button variant="outline" size="sm">
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder={`${currentNetwork.symbol} (Native)`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">
                    <div className="flex items-center gap-2">
                      <span>{currentNetwork.icon}</span>
                      <span>{currentNetwork.symbol} (Native)</span>
                    </div>
                  </SelectItem>
                  {tokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon || token.symbol.charAt(0)}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="space-y-1">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="any"
                />
                <div className="text-sm text-muted-foreground">
                  Available:{" "}
                  {selectedToken
                    ? `${tokens.find((t) => t.address === selectedToken)?.balance || "0"} ${tokens.find((t) => t.address === selectedToken)?.symbol}`
                    : `${balance} ${currentNetwork.symbol}`}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note..."
                rows={2}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Double-check the recipient address. Transactions cannot be reversed.</AlertDescription>
            </Alert>

            <Button onClick={handleSend} disabled={isLoading || !recipient || !amount} className="w-full">
              {isLoading ? "Sending..." : "Send Transaction"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
