"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/contexts/wallet-context"
import {
  Globe,
  Star,
  History,
  Search,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  Coins,
} from "lucide-react"

const FEATURED_DAPPS = [
  {
    name: "Uniswap",
    description: "Decentralized exchange protocol",
    url: "https://app.uniswap.org",
    icon: "🦄",
    category: "DeFi",
    verified: true,
  },
  {
    name: "Aave",
    description: "Decentralized lending protocol",
    url: "https://app.aave.com",
    icon: "👻",
    category: "DeFi",
    verified: true,
  },
  {
    name: "OpenSea",
    description: "NFT marketplace",
    url: "https://opensea.io",
    icon: "🌊",
    category: "NFT",
    verified: true,
  },
  {
    name: "Compound",
    description: "Algorithmic money markets",
    url: "https://app.compound.finance",
    icon: "🏛️",
    category: "DeFi",
    verified: true,
  },
  {
    name: "1inch",
    description: "DEX aggregator",
    url: "https://app.1inch.io",
    icon: "🔄",
    category: "DeFi",
    verified: true,
  },
  {
    name: "Lido",
    description: "Liquid staking solution",
    url: "https://lido.fi",
    icon: "🌊",
    category: "Staking",
    verified: true,
  },
]

const CATEGORIES = [
  { id: "all", name: "All", icon: Globe },
  { id: "defi", name: "DeFi", icon: Coins },
  { id: "nft", name: "NFT", icon: Star },
  { id: "staking", name: "Staking", icon: Zap },
]

export default function DAppBrowser() {
  const [url, setUrl] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])

  const { currentNetwork } = useWallet()

  const filteredDApps = FEATURED_DAPPS.filter(
    (dapp) => activeCategory === "all" || dapp.category.toLowerCase() === activeCategory,
  )

  const handleNavigate = (targetUrl: string) => {
    setIsLoading(true)
    setCurrentUrl(targetUrl)
    setUrl(targetUrl)

    // Add to history
    if (!history.includes(targetUrl)) {
      setHistory((prev) => [targetUrl, ...prev.slice(0, 9)]) // Keep last 10
    }

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }

  const toggleFavorite = (dappUrl: string) => {
    setFavorites((prev) => (prev.includes(dappUrl) ? prev.filter((url) => url !== dappUrl) : [...prev, dappUrl]))
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find((c) => c.id === categoryId)
    return category?.icon || Globe
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">DApp Browser</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Secure Connection
        </Badge>
      </div>

      {/* Browser Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter DApp URL or search..."
                className="pr-10"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && url) {
                    handleNavigate(url)
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => url && handleNavigate(url)}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browser Content */}
      {currentUrl ? (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-4xl">🌐</div>
                <div>
                  <div className="font-semibold">Connected to DApp</div>
                  <div className="text-sm text-muted-foreground">{currentUrl}</div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Connected to {currentNetwork.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-4">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDApps.map((dapp) => (
                <Card key={dapp.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{dapp.icon}</div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {dapp.name}
                            {dapp.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{dapp.description}</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(dapp.url)
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${favorites.includes(dapp.url) ? "fill-current text-yellow-500" : ""}`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{dapp.category}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(dapp.url, "_blank")}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleNavigate(dapp.url)}>
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* History & Favorites */}
      {(history.length > 0 || favorites.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.slice(0, 5).map((historyUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleNavigate(historyUrl)}
                  >
                    <div className="text-sm truncate">{historyUrl}</div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {favorites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Favorites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {favorites.slice(0, 5).map((favoriteUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleNavigate(favoriteUrl)}
                  >
                    <div className="text-sm truncate">{favoriteUrl}</div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
