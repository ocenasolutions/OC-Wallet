import { type NextRequest, NextResponse } from "next/server"
import { getCollection, type Transaction } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const collection = await getCollection<Transaction>("transactions")

    // Get all transactions for this wallet
    const transactions = await collection.find({ walletAddress }).toArray()

    // Calculate stats
    let totalSent = 0
    let totalReceived = 0
    const addressCounts: { [key: string]: number } = {}
    const dailyActivity: { [key: string]: number } = {}

    transactions.forEach((tx) => {
      const value = Number.parseFloat(tx.value)
      const date = new Date(tx.timestamp).toISOString().split("T")[0]

      // Track daily activity
      dailyActivity[date] = (dailyActivity[date] || 0) + 1

      if (tx.type === "send") {
        totalSent += value
        addressCounts[tx.to] = (addressCounts[tx.to] || 0) + 1
      } else {
        totalReceived += value
        addressCounts[tx.from] = (addressCounts[tx.from] || 0) + 1
      }
    })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = Object.entries(dailyActivity)
      .filter(([date]) => new Date(date) >= thirtyDaysAgo)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Get top contacts
    const topContacts = Object.entries(addressCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([address, count]) => ({ address, count }))

    return NextResponse.json({
      totalSent: totalSent.toString(),
      totalReceived: totalReceived.toString(),
      totalTransactions: transactions.length,
      recentActivity,
      topContacts,
    })
  } catch (error) {
    console.error("Error fetching transaction analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
