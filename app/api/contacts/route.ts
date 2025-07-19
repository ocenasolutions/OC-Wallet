import { type NextRequest, NextResponse } from "next/server"
import { getCollection, type Contact } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const contact: Contact = await request.json()
    const collection = await getCollection<Contact>("contacts")

    // Check if contact already exists
    const existing = await collection.findOne({
      walletAddress: contact.walletAddress,
      address: contact.address,
    })

    if (existing) {
      return NextResponse.json({ error: "Contact already exists" }, { status: 400 })
    }

    const result = await collection.insertOne(contact)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      ...contact,
    })
  } catch (error) {
    console.error("Error adding contact:", error)
    return NextResponse.json({ error: "Failed to add contact" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const collection = await getCollection<Contact>("contacts")

    const contacts = await collection.find({ walletAddress }).sort({ lastTransactionDate: -1, name: 1 }).toArray()

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, updates, walletAddress } = await request.json()
    const collection = await getCollection<Contact>("contacts")

    await collection.updateOne({ _id: new ObjectId(id), walletAddress }, { $set: updates })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, walletAddress } = await request.json()
    const collection = await getCollection<Contact>("contacts")

    await collection.deleteOne({ _id: new ObjectId(id), walletAddress })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
