"use client"

// Payment provider integration utilities
export interface PaymentProviderConfig {
  apiKey: string
  environment: "sandbox" | "production"
  webhookSecret?: string
}

export class MoonPayIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  async createTransaction(params: {
    walletAddress: string
    currencyCode: string
    baseCurrencyAmount: number
    baseCurrencyCode: string
  }) {
    const response = await fetch("https://api.moonpay.com/v3/transactions", {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    return response.json()
  }

  generateWidgetUrl(params: {
    walletAddress: string
    currencyCode: string
    baseCurrencyAmount?: number
    baseCurrencyCode?: string
  }) {
    const baseUrl =
      this.config.environment === "production" ? "https://buy.moonpay.com" : "https://buy-sandbox.moonpay.com"

    const queryParams = new URLSearchParams({
      apiKey: this.config.apiKey,
      walletAddress: params.walletAddress,
      currencyCode: params.currencyCode,
      ...(params.baseCurrencyAmount && { baseCurrencyAmount: params.baseCurrencyAmount.toString() }),
      ...(params.baseCurrencyCode && { baseCurrencyCode: params.baseCurrencyCode }),
    })

    return `${baseUrl}?${queryParams.toString()}`
  }
}

export class TransakIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  generateWidgetUrl(params: {
    walletAddress: string
    cryptocurrency: string
    fiatAmount?: number
    fiatCurrency?: string
    network?: string
  }) {
    const baseUrl =
      this.config.environment === "production" ? "https://global.transak.com" : "https://staging-global.transak.com"

    const queryParams = new URLSearchParams({
      apiKey: this.config.apiKey,
      walletAddress: params.walletAddress,
      cryptocurrency: params.cryptocurrency,
      ...(params.fiatAmount && { fiatAmount: params.fiatAmount.toString() }),
      ...(params.fiatCurrency && { fiatCurrency: params.fiatCurrency }),
      ...(params.network && { network: params.network }),
      hideMenu: "true",
      themeColor: "000000",
    })

    return `${baseUrl}?${queryParams.toString()}`
  }
}

export class RampIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  generateWidgetUrl(params: {
    userAddress: string
    swapAsset: string
    fiatValue?: number
    fiatCurrency?: string
  }) {
    const baseUrl =
      this.config.environment === "production"
        ? "https://buy.ramp.network"
        : "https://ri-widget-staging.firebaseapp.com"

    const queryParams = new URLSearchParams({
      hostApiKey: this.config.apiKey,
      userAddress: params.userAddress,
      swapAsset: params.swapAsset,
      ...(params.fiatValue && { fiatValue: params.fiatValue.toString() }),
      ...(params.fiatCurrency && { fiatCurrency: params.fiatCurrency }),
    })

    return `${baseUrl}?${queryParams.toString()}`
  }
}

export class SimplexIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  generateWidgetUrl(params: {
    wallet_address: string
    crypto: string
    fiat_amount?: number
    fiat_currency?: string
  }) {
    const baseUrl =
      this.config.environment === "production" ? "https://checkout.simplex.com" : "https://sandbox.test-simplexcc.com"

    const queryParams = new URLSearchParams({
      partner: this.config.apiKey,
      wallet_address: params.wallet_address,
      crypto: params.crypto,
      ...(params.fiat_amount && { fiat_amount: params.fiat_amount.toString() }),
      ...(params.fiat_currency && { fiat_currency: params.fiat_currency }),
    })

    return `${baseUrl}?${queryParams.toString()}`
  }
}

export class BanxaIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  async createOrder(params: {
    wallet_address: string
    coin_code: string
    fiat_amount: number
    fiat_code: string
    payment_method_id?: number
  }) {
    const response = await fetch("https://api.banxa.com/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    return response.json()
  }

  generateWidgetUrl(params: {
    walletAddress: string
    coinCode: string
    fiatAmount?: number
    fiatCode?: string
    orderMode?: string
  }) {
    const baseUrl =
      this.config.environment === "production" ? "https://checkout.banxa.com" : "https://checkout-sandbox.banxa.com"

    const queryParams = new URLSearchParams({
      apiKey: this.config.apiKey,
      walletAddress: params.walletAddress,
      coinCode: params.coinCode,
      ...(params.fiatAmount && { fiatAmount: params.fiatAmount.toString() }),
      ...(params.fiatCode && { fiatCode: params.fiatCode }),
      ...(params.orderMode && { orderMode: params.orderMode }),
    })

    return `${baseUrl}?${queryParams.toString()}`
  }

  async getPaymentMethods(fiatCode: string, coinCode: string) {
    const response = await fetch(
      `https://api.banxa.com/api/payment-methods?fiat_code=${fiatCode}&coin_code=${coinCode}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      },
    )

    return response.json()
  }
}

export class MercuryoIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  generateWidgetUrl(params: {
    address: string
    currency: string
    amount?: number
    fiat_currency?: string
    type?: string
  }) {
    const baseUrl =
      this.config.environment === "production" ? "https://exchange.mercuryo.io" : "https://sandbox-exchange.mrcr.io"

    const queryParams = new URLSearchParams({
      widget_id: this.config.apiKey,
      address: params.address,
      currency: params.currency,
      ...(params.amount && { amount: params.amount.toString() }),
      ...(params.fiat_currency && { fiat_currency: params.fiat_currency }),
      ...(params.type && { type: params.type }),
    })

    return `${baseUrl}?${queryParams.toString()}`
  }

  async getRates(from: string, to: string, amount: number) {
    const response = await fetch(`https://api.mercuryo.io/v1.6/public/convert?from=${from}&to=${to}&amount=${amount}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    return response.json()
  }
}

export class CoinifyIntegration {
  private config: PaymentProviderConfig

  constructor(config: PaymentProviderConfig) {
    this.config = config
  }

  async createTrade(params: {
    target_address: string
    currency: string
    amount: number
    amount_currency: string
    payment_method?: string
  }) {
    const response = await fetch("https://api.coinify.com/v3/trades", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    return response.json()
  }

  generateWidgetUrl(params: {
    targetAddress: string
    currency: string
    amount?: number
    amountCurrency?: string
    partnerId?: string
  }) {
    const baseUrl =
      this.config.environment === "production" ? "https://trade-ui.coinify.com" : "https://trade-ui-sandbox.coinify.com"

    const queryParams = new URLSearchParams({
      partnerId: this.config.apiKey,
      targetAddress: params.targetAddress,
      currency: params.currency,
      ...(params.amount && { amount: params.amount.toString() }),
      ...(params.amountCurrency && { amountCurrency: params.amountCurrency }),
    })

    return `${baseUrl}?${queryParams.toString()}`
  }

  async getQuote(params: {
    baseCurrency: string
    quoteCurrency: string
    baseAmount?: number
    quoteAmount?: number
  }) {
    const queryParams = new URLSearchParams({
      baseCurrency: params.baseCurrency,
      quoteCurrency: params.quoteCurrency,
      ...(params.baseAmount && { baseAmount: params.baseAmount.toString() }),
      ...(params.quoteAmount && { quoteAmount: params.quoteAmount.toString() }),
    })

    const response = await fetch(`https://api.coinify.com/v3/quotes?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    return response.json()
  }
}

// Enhanced webhook handler for all payment providers
export async function handlePaymentWebhook(provider: string, payload: any, signature: string, secret: string) {
  // Verify webhook signature
  const crypto = await import("crypto")
  const expectedSignature = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex")

  if (signature !== expectedSignature) {
    throw new Error("Invalid webhook signature")
  }

  // Process webhook based on provider
  switch (provider) {
    case "moonpay":
      return processMoonPayWebhook(payload)
    case "transak":
      return processTransakWebhook(payload)
    case "ramp":
      return processRampWebhook(payload)
    case "simplex":
      return processSimplexWebhook(payload)
    case "banxa":
      return processBanxaWebhook(payload)
    case "mercuryo":
      return processMercuryoWebhook(payload)
    case "coinify":
      return processCoinifyWebhook(payload)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function processMoonPayWebhook(payload: any) {
  const { type, data } = payload

  switch (type) {
    case "transaction_updated":
      return {
        transactionId: data.id,
        status: data.status,
        cryptoAmount: data.cryptoAmount,
        fiatAmount: data.baseCurrencyAmount,
      }
    default:
      return null
  }
}

function processTransakWebhook(payload: any) {
  const { eventID, status, orderData } = payload

  return {
    transactionId: eventID,
    status: status.toLowerCase(),
    cryptoAmount: orderData.cryptoAmount,
    fiatAmount: orderData.fiatAmount,
  }
}

function processRampWebhook(payload: any) {
  const { type, purchase } = payload

  if (type === "RELEASED") {
    return {
      transactionId: purchase.id,
      status: "completed",
      cryptoAmount: purchase.cryptoAmount,
      fiatAmount: purchase.fiatValue,
    }
  }

  return null
}

function processSimplexWebhook(payload: any) {
  const { event_id, name, payment } = payload

  return {
    transactionId: event_id,
    status: name === "payment_simplexcc_approved" ? "completed" : "processing",
    cryptoAmount: payment.requested_digital_amount,
    fiatAmount: payment.fiat_total_amount,
  }
}

function processBanxaWebhook(payload: any) {
  const { order } = payload

  return {
    transactionId: order.id,
    status: order.status.toLowerCase(),
    cryptoAmount: order.coin_amount,
    fiatAmount: order.fiat_amount,
  }
}

function processMercuryoWebhook(payload: any) {
  const { type, data } = payload

  if (type === "status_update") {
    return {
      transactionId: data.id,
      status: data.status.toLowerCase(),
      cryptoAmount: data.amount,
      fiatAmount: data.fiat_amount,
    }
  }

  return null
}

function processCoinifyWebhook(payload: any) {
  const { event, data } = payload

  if (event === "trade.completed") {
    return {
      transactionId: data.id,
      status: "completed",
      cryptoAmount: data.outAmount,
      fiatAmount: data.inAmount,
    }
  }

  return null
}

// Provider factory for easy integration
export class PaymentProviderFactory {
  static create(provider: string, config: PaymentProviderConfig) {
    switch (provider.toLowerCase()) {
      case "moonpay":
        return new MoonPayIntegration(config)
      case "transak":
        return new TransakIntegration(config)
      case "ramp":
        return new RampIntegration(config)
      case "simplex":
        return new SimplexIntegration(config)
      case "banxa":
        return new BanxaIntegration(config)
      case "mercuryo":
        return new MercuryoIntegration(config)
      case "coinify":
        return new CoinifyIntegration(config)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }
}

// Rate comparison utility
export async function compareProviderRates(
  providers: string[],
  fiatAmount: number,
  fiatCurrency: string,
  cryptoCurrency: string,
) {
  const rates = await Promise.allSettled(
    providers.map(async (provider) => {
      try {
        // This would call each provider's rate API
        // For now, returning mock data
        return {
          provider,
          rate: Math.random() * 0.1 + 0.95, // Mock rate between 0.95-1.05
          fees: Math.random() * 50 + 10, // Mock fees between $10-60
          processingTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
        }
      } catch (error) {
        throw new Error(`Failed to get rate from ${provider}`)
      }
    }),
  )

  return rates
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<any>).value)
    .sort((a, b) => b.rate - a.rate) // Sort by best rate
}
