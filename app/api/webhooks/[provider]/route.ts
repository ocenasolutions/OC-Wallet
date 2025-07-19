import { type NextRequest, NextResponse } from "next/server"
import { handlePaymentWebhook } from "@/lib/payment-providers"

export async function POST(request: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const provider = params.provider
    const payload = await request.json()
    const signature = request.headers.get("x-signature") || request.headers.get("signature") || ""

    // Get webhook secret for the provider
    const secret = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || ""

    if (!secret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Process the webhook
    const result = await handlePaymentWebhook(provider, payload, signature, secret)

    if (result) {
      // Here you would typically:
      // 1. Update the transaction status in your database
      // 2. Send notifications to the user
      // 3. Update wallet balances if needed

      console.log(`Webhook processed for ${provider}:`, result)

      // For now, just log the result
      // In a real app, you'd update your database here
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Webhook error for ${params.provider}:`, error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
