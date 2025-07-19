import { type NextRequest, NextResponse } from "next/server"
import { getCollection, type Purchase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const purchase: Purchase = await request.json()
    const collection = await getCollection<Purchase>("purchases")

    const result = await collection.insertOne(purchase)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      ...purchase,
    })
  } catch (error) {
    console.error("Error adding purchase:", error)
    return NextResponse.json({ error: "Failed to add purchase" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const collection = await getCollection<Purchase>("purchases")

    const purchases = await collection.find({ walletAddress }).sort({ timestamp: -1 }).toArray()

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, transactionHash, walletAddress } = await request.json()
    const collection = await getCollection<Purchase>("purchases")

    const updateData: any = { status }
    if (transactionHash) {
      updateData.transactionHash = transactionHash
    }

    await collection.updateOne({ _id: new ObjectId(id), walletAddress }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating purchase:", error)
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 })
  }
}
