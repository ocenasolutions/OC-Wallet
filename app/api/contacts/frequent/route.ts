import { type NextRequest, NextResponse } from "next/server"
import { getCollection, type Contact } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const collection = await getCollection<Contact>("contacts")

    const contacts = await collection
      .find({ walletAddress })
      .sort({ totalTransactions: -1, lastTransactionDate: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching frequent contacts:", error)
    return NextResponse.json({ error: "Failed to fetch frequent contacts" }, { status: 500 })
  }
}
