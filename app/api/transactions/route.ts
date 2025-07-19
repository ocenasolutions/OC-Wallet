import { type NextRequest, NextResponse } from "next/server"
import { getCollection, type Transaction } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const transaction: Transaction = await request.json()
    const collection = await getCollection<Transaction>("transactions")

    const result = await collection.insertOne(transaction)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      ...transaction,
    })
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const collection = await getCollection<Transaction>("transactions")

    const transactions = await collection
      .find({ walletAddress })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { hash, status, confirmations, walletAddress } = await request.json()
    const collection = await getCollection<Transaction>("transactions")

    const updateData: any = { status }
    if (confirmations !== undefined) {
      updateData.confirmations = confirmations
    }

    await collection.updateOne({ hash, walletAddress }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}
