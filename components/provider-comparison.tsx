"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Star, Clock, CreditCard, Shield, TrendingUp, Info } from "lucide-react"

interface ProviderRate {
  provider: string
  icon: string
  cryptoAmount: string
  fees: string
  totalCost: string
  processingTime: string
  rating: number
  savings?: string
  isRecommended?: boolean
  features: string[]
  paymentMethods: string[]
}

interface ProviderComparisonProps {
  fiatAmount: number
  fiatCurrency: string
  cryptoCurrency: string
  onProviderSelect: (provider: string) => void
}

export default function ProviderComparison({
  fiatAmount,
  fiatCurrency,
  cryptoCurrency,
  onProviderSelect,
}: ProviderComparisonProps) {
  const [rates, setRates] = useState<ProviderRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProviderRates()
  }, [fiatAmount, fiatCurrency, cryptoCurrency])

  const fetchProviderRates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call to get real-time rates
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock data - in real implementation, this would call actual provider APIs
      const mockRates: ProviderRate[] = [
        {
          provider: "Banxa",
          icon: "🏦",
          cryptoAmount: (fiatAmount * 0.000041).toFixed(6),
          fees: "$" + (fiatAmount * 0.015).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.015).toFixed(2),
          processingTime: "2-10 min",
          rating: 4.9,
          isRecommended: true,
          features: ["Premium service", "Multiple regions", "Enterprise grade"],
          paymentMethods: ["Credit Card", "Bank Transfer", "PayID"],
        },
        {
          provider: "Transak",
          icon: "⚡",
          cryptoAmount: (fiatAmount * 0.00004).toFixed(6),
          fees: "$" + (fiatAmount * 0.0099).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.0099).toFixed(2),
          processingTime: "10-30 min",
          rating: 4.6,
          savings: "Save $" + (fiatAmount * 0.005).toFixed(2),
          features: ["Low fees", "Global coverage", "Multiple payment methods"],
          paymentMethods: ["Credit Card", "Bank Transfer", "Apple Pay"],
        },
        {
          provider: "MoonPay",
          icon: "🌙",
          cryptoAmount: (fiatAmount * 0.000039).toFixed(6),
          fees: "$" + (fiatAmount * 0.015).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.015).toFixed(2),
          processingTime: "5-10 min",
          rating: 4.8,
          features: ["Instant processing", "24/7 support", "Mobile app"],
          paymentMethods: ["Credit Card", "Debit Card", "Bank Transfer"],
        },
        {
          provider: "Mercuryo",
          icon: "☿️",
          cryptoAmount: (fiatAmount * 0.000038).toFixed(6),
          fees: "$" + (fiatAmount * 0.0395).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.0395).toFixed(2),
          processingTime: "5-15 min",
          rating: 4.4,
          features: ["European focus", "Fast processing", "Mobile wallets"],
          paymentMethods: ["Credit Card", "Apple Pay", "Google Pay"],
        },
        {
          provider: "Coinify",
          icon: "🪙",
          cryptoAmount: (fiatAmount * 0.000037).toFixed(6),
          fees: "$" + (fiatAmount * 0.025).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.025).toFixed(2),
          processingTime: "10-60 min",
          rating: 4.3,
          features: ["Nordic focus", "SEPA support", "Regulatory compliant"],
          paymentMethods: ["Credit Card", "Bank Transfer", "SEPA"],
        },
        {
          provider: "Ramp Network",
          icon: "🚀",
          cryptoAmount: (fiatAmount * 0.000036).toFixed(6),
          fees: "$" + (fiatAmount * 0.029).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.029).toFixed(2),
          processingTime: "1-5 min",
          rating: 4.7,
          features: ["Instant delivery", "Open banking", "No registration"],
          paymentMethods: ["Credit Card", "Open Banking", "Apple Pay"],
        },
        {
          provider: "Simplex",
          icon: "💎",
          cryptoAmount: (fiatAmount * 0.000035).toFixed(6),
          fees: "$" + (fiatAmount * 0.035 + 10).toFixed(2),
          totalCost: "$" + (fiatAmount + fiatAmount * 0.035 + 10).toFixed(2),
          processingTime: "10-30 min",
          rating: 4.5,
          features: ["Fraud protection", "Trusted by exchanges", "Global reach"],
          paymentMethods: ["Credit Card", "Debit Card"],
        },
      ]

      // Sort by best value (most crypto for the money)
      const sortedRates = mockRates.sort(
        (a, b) => Number.parseFloat(b.cryptoAmount) - Number.parseFloat(a.cryptoAmount),
      )
      setRates(sortedRates)
    } catch (err) {
      setError("Failed to fetch provider rates. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load provider rates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Comparing Providers...</h3>
          <p className="text-muted-foreground">Finding the best rates for your purchase</p>
        </div>
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          {error}
          <Button variant="outline" size="sm" onClick={fetchProviderRates}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Provider</h3>
        <p className="text-muted-foreground">
          Comparing rates for {fiatCurrency} {fiatAmount} → {cryptoCurrency}
        </p>
      </div>

      <div className="space-y-3">
        {rates.map((rate, index) => (
          <Card
            key={rate.provider}
            className={`cursor-pointer transition-all hover:shadow-md ${
              rate.isRecommended ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onProviderSelect(rate.provider)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{rate.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{rate.provider}</span>
                      {rate.isRecommended && (
                        <Badge variant="default" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Best Value
                        </Badge>
                      )}
                      {rate.savings && (
                        <Badge variant="secondary" className="text-xs text-green-600">
                          {rate.savings}
                        </Badge>
                      )}
                      {index === 0 && !rate.isRecommended && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Fastest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {renderStars(rate.rating)}
                        <span className="ml-1">{rate.rating}</span>
                      </div>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{rate.processingTime}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {rate.cryptoAmount} {cryptoCurrency}
                  </div>
                  <div className="text-sm text-muted-foreground">Fee: {rate.fees}</div>
                  <div className="text-xs text-muted-foreground">Total: {rate.totalCost}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span>{rate.paymentMethods.slice(0, 2).join(", ")}</span>
                      {rate.paymentMethods.length > 2 && <span>+{rate.paymentMethods.length - 2}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Secure</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Rates are updated in real-time and may change during checkout. Final amounts will be confirmed before payment.
        </AlertDescription>
      </Alert>
    </div>
  )
}
