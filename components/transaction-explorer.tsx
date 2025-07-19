"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/contexts/wallet-context"
import { TransactionSyncService } from "@/lib/transaction-sync"
import { Search, ArrowUpRight, ArrowDownLeft, ExternalLink, Users, TrendingUp } from "lucide-react"
import type { Transaction } from "@/lib/mongodb"

export default function TransactionExplorer() {
  const { address, currentNetwork, getContactByAddress } = useWallet()
  const [searchAddress, setSearchAddress] = useState("")
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [transactionStats, setTransactionStats] = useState<{
    totalSent: string
    totalReceived: string
    uniqueAddresses: number
    mostActiveAddress: string
  } | null>(null)

  const syncService = new TransactionSyncService(address)

  const handleSearch = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    try {
      const transactions = await syncService.getTransactionsWithAddress(searchAddress)
      setSearchResults(transactions)

      // Calculate stats
      const sent = transactions
        .filter((tx) => tx.type === "send" && tx.from.toLowerCase() === address.toLowerCase())
        .reduce((sum, tx) => sum + Number.parseFloat(tx.value), 0)

      const received = transactions
        .filter((tx) => tx.type === "receive" && tx.to.toLowerCase() === address.toLowerCase())
        .reduce((sum, tx) => sum + Number.parseFloat(tx.value), 0)

      const uniqueAddresses = new Set([...transactions.map((tx) => tx.from), ...transactions.map((tx) => tx.to)]).size

      setTransactionStats({
        totalSent: sent.toFixed(6),
        totalReceived: received.toFixed(6),
        uniqueAddresses,
        mostActiveAddress: searchAddress,
      })
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getContactInfo = (address: string) => {
    const contact = getContactByAddress(address)
    return contact
      ? {
          name: contact.name,
          initials: contact.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        }
      : null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" />
          Transaction Explorer
        </h2>
        <p className="text-muted-foreground">Explore transaction history with any address</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter wallet address to explore transactions..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="font-mono"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchAddress.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {transactionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                  <div className="font-semibold">
                    {transactionStats.totalSent} {currentNetwork.symbol}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Received</div>
                  <div className="font-semibold">
                    {transactionStats.totalReceived} {currentNetwork.symbol}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Unique Addresses</div>
                  <div className="font-semibold">{transactionStats.uniqueAddresses}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="font-semibold">{searchResults.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({searchResults.length})</TabsTrigger>
            <TabsTrigger value="sent">
              Sent (
              {
                searchResults.filter((tx) => tx.type === "send" && tx.from.toLowerCase() === address.toLowerCase())
                  .length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="received">
              Received (
              {
                searchResults.filter((tx) => tx.type === "receive" && tx.to.toLowerCase() === address.toLowerCase())
                  .length
              }
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {searchResults.map((tx) => {
              const isOutgoing = tx.from.toLowerCase() === address.toLowerCase()
              const otherAddress = isOutgoing ? tx.to : tx.from
              const contactInfo = getContactInfo(otherAddress)

              return (
                <Card key={tx.hash}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isOutgoing ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
                          }`}
                        >
                          {isOutgoing ? (
                            <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{isOutgoing ? "Sent" : "Received"}</span>
                            <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>{tx.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {contactInfo ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-xs">{contactInfo.initials}</AvatarFallback>
                                </Avatar>
                                <span>{contactInfo.name}</span>
                                <span>({formatAddress(otherAddress)})</span>
                              </div>
                            ) : (
                              <span>
                                {isOutgoing ? `To ${formatAddress(tx.to)}` : `From ${formatAddress(tx.from)}`}
                              </span>
                            )}
                          </div>
                          {tx.memo && <div className="text-xs text-muted-foreground italic">"{tx.memo}"</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {isOutgoing ? "-" : "+"}
                          {tx.value} {tx.tokenSymbol || currentNetwork.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`${currentNetwork.explorer}/tx/${tx.hash}`, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3">
            {searchResults
              .filter((tx) => tx.type === "send" && tx.from.toLowerCase() === address.toLowerCase())
              .map((tx) => (
                <Card key={tx.hash}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900">
                          <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="font-semibold">Sent to {formatAddress(tx.to)}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          -{tx.value} {tx.tokenSymbol || currentNetwork.symbol}
                        </div>
                        <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>{tx.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="received" className="space-y-3">
            {searchResults
              .filter((tx) => tx.type === "receive" && tx.to.toLowerCase() === address.toLowerCase())
              .map((tx) => (
                <Card key={tx.hash}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                          <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-semibold">Received from {formatAddress(tx.from)}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          +{tx.value} {tx.tokenSymbol || currentNetwork.symbol}
                        </div>
                        <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>{tx.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}

      {searchResults.length === 0 && searchAddress && !isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">No transactions found with this address.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
