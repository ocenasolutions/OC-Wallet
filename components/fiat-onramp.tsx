"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import KYCVerification from "@/components/kyc-verification"
import ProviderComparison from "@/components/provider-comparison"
import { useWallet } from "@/contexts/wallet-context"

interface Provider {
  name: string
  icon: string
  fees: string
  processingTime: string
  rating: number
  minAmount: number
  maxAmount: number
  supportedMethods: string[]
  supportedCurrencies: string[]
  description: string
  features: string[]
}

const PROVIDERS = [
  {
    name: "MoonPay",
    icon: "🌙",
    fees: "1.5%",
    processingTime: "5-10 min",
    rating: 4.8,
    minAmount: 20,
    maxAmount: 50000,
    supportedMethods: ["Credit Card", "Debit Card", "Bank Transfer"],
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
    description: "Fast and reliable crypto purchases",
    features: ["Instant processing", "24/7 support", "Mobile app"],
  },
  {
    name: "Transak",
    icon: "⚡",
    fees: "0.99%",
    processingTime: "10-30 min",
    rating: 4.6,
    minAmount: 30,
    maxAmount: 25000,
    supportedMethods: ["Credit Card", "Bank Transfer", "Apple Pay", "Google Pay"],
    supportedCurrencies: ["USD", "EUR", "GBP", "INR", "BRL"],
    description: "Global gateway for crypto purchases",
    features: ["Low fees", "Global coverage", "Multiple payment methods"],
  },
  {
    name: "Ramp Network",
    icon: "🚀",
    fees: "2.9%",
    processingTime: "1-5 min",
    rating: 4.7,
    minAmount: 50,
    maxAmount: 20000,
    supportedMethods: ["Credit Card", "Open Banking", "Apple Pay"],
    supportedCurrencies: ["USD", "EUR", "GBP", "PLN", "CZK"],
    description: "Instant crypto purchases with open banking",
    features: ["Instant delivery", "Open banking", "No registration"],
  },
  {
    name: "Simplex",
    icon: "💎",
    fees: "3.5% + $10",
    processingTime: "10-30 min",
    rating: 4.5,
    minAmount: 50,
    maxAmount: 20000,
    supportedMethods: ["Credit Card", "Debit Card"],
    supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "KRW"],
    description: "Trusted payment processor since 2014",
    features: ["Fraud protection", "Trusted by exchanges", "Global reach"],
  },
  {
    name: "Banxa",
    icon: "🏦",
    fees: "1.0-3.5%",
    processingTime: "2-10 min",
    rating: 4.9,
    minAmount: 20,
    maxAmount: 50000,
    supportedMethods: ["Credit Card", "Bank Transfer", "PayID", "POLi", "SEPA"],
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "SGD"],
    description: "Premium crypto payment infrastructure",
    features: ["Premium service", "Multiple regions", "Enterprise grade"],
  },
  {
    name: "Mercuryo",
    icon: "☿️",
    fees: "3.95%",
    processingTime: "5-15 min",
    rating: 4.4,
    minAmount: 30,
    maxAmount: 10000,
    supportedMethods: ["Credit Card", "Debit Card", "Apple Pay", "Google Pay"],
    supportedCurrencies: ["USD", "EUR", "GBP", "TRY", "UAH", "KZT"],
    description: "European-focused crypto gateway",
    features: ["European focus", "Fast processing", "Mobile wallets"],
  },
  {
    name: "Coinify",
    icon: "🪙",
    fees: "1.49-3.75%",
    processingTime: "10-60 min",
    rating: 4.3,
    minAmount: 25,
    maxAmount: 25000,
    supportedMethods: ["Credit Card", "Bank Transfer", "SEPA", "SOFORT"],
    supportedCurrencies: ["USD", "EUR", "GBP", "DKK", "SEK", "NOK"],
    description: "Scandinavian crypto payment solution",
    features: ["Nordic focus", "SEPA support", "Regulatory compliant"],
  },
]

export default function FiatOnramp() {
  const { address } = useWallet()
  const [fiatAmount, setFiatAmount] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(PROVIDERS[0])
  const [showKYC, setShowKYC] = useState(false)
  const [kycCompleted, setKycCompleted] = useState(false)
  const [step, setStep] = useState(1)
  const [fiatCurrency, setFiatCurrency] = useState("USD")
  const [cryptoCurrency, setCryptoCurrency] = useState("ETH")

  const handlePurchase = async () => {
    // Check if KYC is required for this amount
    const amount = Number(fiatAmount)
    if (!amount) {
      toast("Please enter a valid amount")
      return
    }

    const requiresKYC = amount >= 1000 || !kycCompleted
    if (requiresKYC) {
      setShowKYC(true)
      return
    }

    if (!selectedProvider) {
      toast("Please select a provider")
      return
    }

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        body: JSON.stringify({
          amount: fiatAmount,
          provider: selectedProvider.name,
          address,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Purchase initiated!")
      } else {
        toast.error("Purchase failed")
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
  }

  if (showKYC) {
    return (
      <KYCVerification
        provider={selectedProvider?.name || ""}
        onComplete={(verified) => {
          setKycCompleted(verified)
          setShowKYC(false)
          if (verified) {
            handlePurchase()
          }
        }}
        onClose={() => setShowKYC(false)}
      />
    )
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Buy Crypto</CardTitle>
        <CardDescription>Purchase crypto with fiat currency.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {step === 1 && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                type="number"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
              />
            </div>
            <Button onClick={() => setStep(2)}>Next</Button>
          </>
        )}
        {step === 2 && (
          <ProviderComparison
            fiatAmount={Number.parseFloat(fiatAmount)}
            fiatCurrency={fiatCurrency}
            cryptoCurrency={cryptoCurrency}
            onProviderSelect={(provider) => {
              setSelectedProvider(PROVIDERS.find((p) => p.name === provider) || null)
              setStep(3)
            }}
          />
        )}
        {step === 3 && (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to the provider's website to complete the purchase.
              </AlertDescription>
            </Alert>
            {Number(fiatAmount) >= 1000 && !kycCompleted && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Purchases over $1,000 require identity verification (KYC) for regulatory compliance.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>{step === 3 && <Button onClick={handlePurchase}>Purchase</Button>}</CardFooter>
    </Card>
  )
}
