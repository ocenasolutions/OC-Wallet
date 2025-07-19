"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Search, CreditCard, Building2 } from "lucide-react"

interface Purchase {
  id: string
  provider: string
  providerIcon: string
  fiatAmount: string
  fiatCurrency: string
  cryptoAmount: string
  cryptoCurrency: string
  status: "pending" | "completed" | "failed" | "processing"
  paymentMethod: string
  timestamp: number
  transactionHash?: string
  fees: string
}

const MOCK_PURCHASES: Purchase[] = [
  {
    id: "1",
    provider: "Banxa",
    providerIcon: "🏦",
    fiatAmount: "500.00",
    fiatCurrency: "USD",
    cryptoAmount: "0.2",
    cryptoCurrency: "ETH",
    status: "completed",
    paymentMethod: "Credit Card",
    timestamp: Date.now() - 3600000,
    transactionHash: "0x1234...5678",
    fees: "7.50",
  },
  {
    id: "2",
    provider: "Mercuryo",
    providerIcon: "☿️",
    fiatAmount: "100.00",
    fiatCurrency: "EUR",
    cryptoAmount: "100.0",
    cryptoCurrency: "USDC",
    status: "processing",
    paymentMethod: "Apple Pay",
    timestamp: Date.now() - 1800000,
    fees: "3.95",
  },
  {
    id: "3",
    provider: "Coinify",
    providerIcon: "🪙",
    fiatAmount: "250.00",
    fiatCurrency: "EUR",
    cryptoAmount: "0.1",
    cryptoCurrency: "ETH",
    status: "completed",
    paymentMethod: "SEPA Transfer",
    timestamp: Date.now() - 7200000,
    fees: "6.25",
  },
  {
    id: "4",
    provider: "MoonPay",
    providerIcon: "🌙",
    fiatAmount: "75.00",
    fiatCurrency: "USD",
    cryptoAmount: "75.0",
    cryptoCurrency: "USDT",
    status: "failed",
    paymentMethod: "Credit Card",
    timestamp: Date.now() - 10800000,
    fees: "1.13",
  },
]

export default function PurchaseHistory() {
  const [purchases] = useState<Purchase[]>(MOCK_PURCHASES)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [providerFilter, setProviderFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
      case "debit card":
        return <CreditCard className="w-4 h-4" />
      case "bank transfer":
        return <Building2 className="w-4 h-4" />
      case "sepa transfer":
        return <Building2 className="w-4 h-4" />
      case "apple pay":
        return <CreditCard className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.cryptoCurrency.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter
    const matchesProvider = providerFilter === "all" || purchase.provider === providerFilter

    return matchesSearch && matchesStatus && matchesProvider
  })

  const uniqueProviders = Array.from(new Set(purchases.map((p) => p.provider)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Purchase History</h2>
          <p className="text-muted-foreground">Track your fiat-to-crypto purchases</p>
        </div>
        <Badge variant="secondary">{purchases.length} purchases</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {uniqueProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase List */}
      {filteredPurchases.length > 0 ? (
        <div className="space-y-3">
          {filteredPurchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{purchase.providerIcon}</div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {purchase.provider}
                        <Badge className={getStatusColor(purchase.status)}>
                          {getStatusIcon(purchase.status)}
                          <span className="ml-1 capitalize">{purchase.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {getPaymentMethodIcon(purchase.paymentMethod)}
                        {purchase.paymentMethod}
                        <span>•</span>
                        {formatDate(purchase.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      +{purchase.cryptoAmount} {purchase.cryptoCurrency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {purchase.fiatCurrency} {purchase.fiatAmount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fee: {purchase.fiatCurrency} {purchase.fees}
                    </div>
                  </div>
                </div>

                {purchase.transactionHash && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Transaction: {purchase.transactionHash}</div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || providerFilter !== "all"
                ? "No purchases match your filters."
                : "No purchases found. Your purchase history will appear here."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
