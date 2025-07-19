import { type NextRequest, NextResponse } from "next/server"
import { getCollection, type Transaction } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const address = searchParams.get("address")

    if (!walletAddress || !address) {
      return NextResponse.json({ error: "Wallet address and target address required" }, { status: 400 })
    }

    const collection = await getCollection<Transaction>("transactions")

    const transactions = await collection
      .find({
        walletAddress,
        $or: [{ from: address }, { to: address }],
      })
      .sort({ timestamp: -1 })
      .toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions by address:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
