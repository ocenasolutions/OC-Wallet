"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet-context"
import { ExternalLink } from "lucide-react"

export default function NFTGallery() {
  const { nfts, currentNetwork } = useWallet()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">NFT Collection</h2>
        <Badge variant="secondary">{nfts.length} NFTs</Badge>
      </div>

      {nfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <Card key={`${nft.contractAddress}-${nft.tokenId}`} className="overflow-hidden">
              <div className="aspect-square relative">
                <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="font-semibold truncate">{nft.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{nft.collection}</div>
                  {nft.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">{nft.description}</div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="text-xs">
                      #{nft.tokenId}
                    </Badge>
                    <button
                      onClick={() => {
                        const url = `${currentNetwork.explorer}/token/${nft.contractAddress}?a=${nft.tokenId}`
                        window.open(url, "_blank")
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">No NFTs found in your wallet.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
