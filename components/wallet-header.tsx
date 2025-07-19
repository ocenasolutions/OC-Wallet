"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWallet } from "@/contexts/wallet-context"
import { useTheme } from "next-themes"
import { ChevronDown, Copy, Moon, Sun, LogOut, Wallet, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WalletHeader() {
  const { address, currentNetwork, networks, switchNetwork, lockWallet } = useWallet()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [addressCopied, setAddressCopied] = useState(false)

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setAddressCopied(true)
    setTimeout(() => setAddressCopied(false), 2000)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">OC Wallet</span>
            </div>

            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={copyAddress}>
              {addressCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {formatAddress(address)}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="mr-2">{currentNetwork.icon}</span>
                  <span className="hidden sm:inline">{currentNetwork.name}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {networks.map((network) => (
                  <DropdownMenuItem
                    key={network.id}
                    onClick={() => switchNetwork(network.id)}
                    className={currentNetwork.id === network.id ? "bg-accent" : ""}
                  >
                    <span className="mr-2">{network.icon}</span>
                    {network.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Logout */}
            <Button variant="outline" size="sm" onClick={lockWallet}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
