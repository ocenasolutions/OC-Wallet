"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useWallet } from "@/contexts/wallet-context"
import {
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  User,
  Plus,
} from "lucide-react"

export default function TransactionHistory() {
  const { transactions, currentNetwork, address, contacts, getContactByAddress, refreshTransactions } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    refreshTransactions()
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memo && tx.memo.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || tx.status === statusFilter
    const matchesType = typeFilter === "all" || tx.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <Badge variant="secondary">{transactions.length} transactions</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search transactions..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="send">Sent</SelectItem>
                <SelectItem value="receive">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const otherAddress = tx.type === "send" ? tx.to : tx.from
            const contactInfo = getContactInfo(otherAddress)

            return (
              <Card key={tx.hash}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "send" ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
                        }`}
                      >
                        {tx.type === "send" ? (
                          <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize">{tx.type}</span>
                          <Badge className={getStatusColor(tx.status)}>
                            {getStatusIcon(tx.status)}
                            <span className="ml-1 capitalize">{tx.status}</span>
                          </Badge>
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
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>
                                {tx.type === "send" ? `To ${formatAddress(tx.to)}` : `From ${formatAddress(tx.from)}`}
                              </span>
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                                <Plus className="w-3 h-3 mr-1" />
                                Add Contact
                              </Button>
                            </div>
                          )}
                        </div>
                        {tx.memo && <div className="text-xs text-muted-foreground mt-1 italic">"{tx.memo}"</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {tx.type === "send" ? "-" : "+"}
                        {tx.value} {tx.tokenSymbol || currentNetwork.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</div>
                      {tx.fees && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {tx.fees} {currentNetwork.symbol}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Hash: {formatAddress(tx.hash)}
                      {tx.confirmations && <span className="ml-2">• {tx.confirmations} confirmations</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = `${currentNetwork.explorer}/tx/${tx.hash}`
                        window.open(url, "_blank")
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No transactions match your filters."
                : "No transactions found. Your transaction history will appear here."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
