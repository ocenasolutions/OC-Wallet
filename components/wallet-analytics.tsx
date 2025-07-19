"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/contexts/wallet-context"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react"

interface AnalyticsData {
  totalSent: string
  totalReceived: string
  totalTransactions: number
  recentActivity: Array<{ date: string; count: number }>
  topContacts: Array<{ address: string; name?: string; count: number }>
  monthlyStats: Array<{ month: string; sent: number; received: number }>
  tokenDistribution: Array<{ symbol: string; percentage: number; value: string }>
}

export default function WalletAnalytics() {
  const { address, dbService, currentNetwork } = useWallet()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (dbService) {
      loadAnalytics()
    }
  }, [dbService])

  const loadAnalytics = async () => {
    if (!dbService) return

    setIsLoading(true)
    try {
      const stats = await dbService.getTransactionStats()

      // Generate mock monthly stats
      const monthlyStats = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return {
          month: date.toLocaleDateString("en-US", { month: "short" }),
          sent: Math.random() * 1000,
          received: Math.random() * 800,
        }
      }).reverse()

      // Generate mock token distribution
      const tokenDistribution = [
        { symbol: currentNetwork.symbol, percentage: 60, value: "2.5" },
        { symbol: "USDC", percentage: 25, value: "1250.0" },
        { symbol: "USDT", percentage: 15, value: "890.0" },
      ]

      setAnalytics({
        ...stats,
        monthlyStats,
        tokenDistribution,
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (!analytics) return

    const csvData = [
      ["Metric", "Value"],
      ["Total Sent", analytics.totalSent],
      ["Total Received", analytics.totalReceived],
      ["Total Transactions", analytics.totalTransactions.toString()],
      ["Network", currentNetwork.name],
      ["Wallet Address", address],
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wallet-analytics-${address.slice(0, 8)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Wallet Analytics</h2>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 animate-spin" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">No analytics data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Wallet Analytics
          </h2>
          <p className="text-muted-foreground">Insights into your wallet activity and patterns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-sm text-muted-foreground">Total Sent</div>
                <div className="text-2xl font-bold">{analytics.totalSent}</div>
                <div className="text-xs text-muted-foreground">{currentNetwork.symbol}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Total Received</div>
                <div className="text-2xl font-bold">{analytics.totalReceived}</div>
                <div className="text-xs text-muted-foreground">{currentNetwork.symbol}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Total Transactions</div>
                <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                <div className="text-xs text-muted-foreground">All time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Unique Addresses</div>
                <div className="text-2xl font-bold">{analytics.topContacts.length}</div>
                <div className="text-xs text-muted-foreground">Interacted with</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="contacts">Top Contacts</TabsTrigger>
          <TabsTrigger value="tokens">Token Distribution</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Activity (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm">{day.date}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <Badge variant="secondary">{day.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Most Active Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{contact.name || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.address.slice(0, 10)}...{contact.address.slice(-8)}
                      </div>
                    </div>
                    <Badge variant="outline">{contact.count} transactions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Token Portfolio Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.tokenDistribution.map((token, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.percentage}%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${token.percentage}%` }}></div>
                    </div>
                    <div className="text-sm text-muted-foreground">Balance: {token.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Transaction Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyStats.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="font-medium">{month.month}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Sent</div>
                        <div className="font-semibold text-red-600">
                          {month.sent.toFixed(2)} {currentNetwork.symbol}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Received</div>
                        <div className="font-semibold text-green-600">
                          {month.received.toFixed(2)} {currentNetwork.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
