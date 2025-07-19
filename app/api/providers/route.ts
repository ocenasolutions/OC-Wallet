import { type NextRequest, NextResponse } from "next/server"
import { PaymentProviderFactory, compareProviderRates } from "@/lib/payment-providers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fiatAmount = Number.parseFloat(searchParams.get("fiatAmount") || "0")
  const fiatCurrency = searchParams.get("fiatCurrency") || "USD"
  const cryptoCurrency = searchParams.get("cryptoCurrency") || "ETH"

  try {
    // Get rates from all providers
    const providers = ["moonpay", "transak", "ramp", "simplex", "banxa", "mercuryo", "coinify"]
    const rates = await compareProviderRates(providers, fiatAmount, fiatCurrency, cryptoCurrency)

    return NextResponse.json({
      success: true,
      rates,
    })
  } catch (error) {
    console.error("Error fetching provider rates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch provider rates",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, walletAddress, fiatAmount, fiatCurrency, cryptoCurrency } = body

    // Create provider instance
    const config = {
      apiKey: process.env[`${provider.toUpperCase()}_API_KEY`] || "",
      environment: (process.env.NODE_ENV === "production" ? "production" : "sandbox") as "production" | "sandbox",
    }

    const providerInstance = PaymentProviderFactory.create(provider, config)

    // Generate widget URL or create transaction based on provider
    let result
    switch (provider.toLowerCase()) {
      case "moonpay":
        result = (providerInstance as any).generateWidgetUrl({
          walletAddress,
          currencyCode: cryptoCurrency.toLowerCase(),
          baseCurrencyAmount: fiatAmount,
          baseCurrencyCode: fiatCurrency,
        })
        break
      case "transak":
        result = (providerInstance as any).generateWidgetUrl({
          walletAddress,
          cryptocurrency: cryptoCurrency,
          fiatAmount,
          fiatCurrency,
        })
        break
      case "banxa":
        result = (providerInstance as any).generateWidgetUrl({
          walletAddress,
          coinCode: cryptoCurrency,
          fiatAmount,
          fiatCode: fiatCurrency,
        })
        break
      case "mercuryo":
        result = (providerInstance as any).generateWidgetUrl({
          address: walletAddress,
          currency: cryptoCurrency,
          amount: fiatAmount,
          fiat_currency: fiatCurrency,
        })
        break
      case "coinify":
        result = (providerInstance as any).generateWidgetUrl({
          targetAddress: walletAddress,
          currency: cryptoCurrency,
          amount: fiatAmount,
          amountCurrency: fiatCurrency,
        })
        break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    return NextResponse.json({
      success: true,
      widgetUrl: result,
      provider,
    })
  } catch (error) {
    console.error("Error creating purchase:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create purchase",
      },
      { status: 500 },
    )
  }
}
