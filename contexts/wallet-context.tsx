"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import { DatabaseService } from "@/lib/database-service"
import { TransactionSyncService } from "@/lib/transaction-sync"
import { getTestTokensForNetwork, getTokenBalance } from "@/lib/test-tokens"
import type { Transaction, Contact } from "@/lib/mongodb"

interface WalletContextType {
  wallet: ethers.Wallet | null
  address: string
  balance: string
  isUnlocked: boolean
  networks: Network[]
  currentNetwork: Network
  tokens: Token[]
  nfts: NFT[]
  transactions: Transaction[]
  contacts: Contact[]
  dbService: DatabaseService | null
  syncService: TransactionSyncService | null
  createWallet: (mnemonic?: string) => Promise<string>
  unlockWallet: (password: string) => Promise<boolean>
  lockWallet: () => void
  switchNetwork: (networkId: string) => void
  addCustomToken: (token: Token) => void
  sendTransaction: (to: string, amount: string, tokenAddress?: string, memo?: string) => Promise<string>
  refreshBalances: () => Promise<void>
  refreshTransactions: () => Promise<void>
  addContact: (contact: Omit<Contact, "_id" | "walletAddress" | "createdAt" | "updatedAt">) => Promise<void>
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  getContactByAddress: (address: string) => Contact | undefined
  simulateReceiveTransaction: (from: string, amount: string, tokenAddress?: string, memo?: string) => Promise<void>
}

interface Network {
  id: string
  name: string
  rpcUrl: string
  chainId: number
  symbol: string
  explorer: string
  icon: string
}

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  price?: number
  icon?: string
}

interface NFT {
  tokenId: string
  contractAddress: string
  name: string
  description: string
  image: string
  collection: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const NETWORKS: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum Testnet",
    rpcUrl: "https://goerli.infura.io/v3/demo",
    chainId: 5,
    symbol: "ETH",
    explorer: "https://goerli.etherscan.io",
    icon: "⟠",
  },
  {
    id: "bsc",
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    symbol: "BNB",
    explorer: "https://testnet.bscscan.com",
    icon: "🟡",
  },
  {
    id: "polygon",
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    symbol: "MATIC",
    explorer: "https://mumbai.polygonscan.com",
    icon: "🟣",
  },
  {
    id: "arbitrum",
    name: "Arbitrum Testnet",
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    chainId: 421613,
    symbol: "ETH",
    explorer: "https://goerli.arbiscan.io",
    icon: "🔵",
  },
]

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<Network>(NETWORKS[0])
  const [tokens, setTokens] = useState<Token[]>([])
  const [nfts, setNfts] = useState<NFT[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [dbService, setDbService] = useState<DatabaseService | null>(null)
  const [syncService, setSyncService] = useState<TransactionSyncService | null>(null)

  // Initialize services when wallet is unlocked
  useEffect(() => {
    if (address && isUnlocked) {
      const db = new DatabaseService(address)
      const sync = new TransactionSyncService(address)
      setDbService(db)
      setSyncService(sync)
      refreshTransactions()
      refreshContacts()
    } else {
      setDbService(null)
      setSyncService(null)
    }
  }, [address, isUnlocked])

  const createWallet = async (mnemonic?: string): Promise<string> => {
    try {
      let newWallet: ethers.Wallet

      if (mnemonic) {
        newWallet = ethers.Wallet.fromPhrase(mnemonic)
      } else {
        newWallet = ethers.Wallet.createRandom()
      }

      setWallet(newWallet)
      setAddress(newWallet.address)
      setIsUnlocked(true)

      return newWallet.mnemonic?.phrase || ""
    } catch (error) {
      console.error("Error creating wallet:", error)
      throw error
    }
  }

  const unlockWallet = async (password: string): Promise<boolean> => {
    try {
      const encryptedWallet = localStorage.getItem("oc-wallet-encrypted")
      if (!encryptedWallet) return false

      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password)
      setWallet(decryptedWallet)
      setAddress(decryptedWallet.address)
      setIsUnlocked(true)

      await refreshBalances()
      return true
    } catch (error) {
      console.error("Error unlocking wallet:", error)
      return false
    }
  }

  const lockWallet = () => {
    setWallet(null)
    setAddress("")
    setBalance("0")
    setIsUnlocked(false)
    setTokens([])
    setNfts([])
    setTransactions([])
    setContacts([])
    setDbService(null)
    setSyncService(null)
  }

  const switchNetwork = (networkId: string) => {
    const network = NETWORKS.find((n) => n.id === networkId)
    if (network) {
      setCurrentNetwork(network)
      refreshBalances()
      refreshTransactions()
    }
  }

  const addCustomToken = (token: Token) => {
    setTokens((prev) => [...prev.filter((t) => t.address !== token.address), token])
  }

  const sendTransaction = async (to: string, amount: string, tokenAddress?: string, memo?: string): Promise<string> => {
    if (!wallet || !syncService) throw new Error("Wallet not connected")

    // Generate a mock transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Create transaction object
    const newTransaction: Omit<Transaction, "_id" | "walletAddress"> = {
      hash: txHash,
      from: address,
      to,
      value: amount,
      timestamp: Date.now(),
      status: "pending",
      type: "send",
      token: tokenAddress,
      tokenSymbol: tokenAddress ? tokens.find((t) => t.address === tokenAddress)?.symbol : currentNetwork.symbol,
      network: currentNetwork.id,
      memo,
      gasUsed: "21000",
      gasPrice: "20",
      fees: "0.00042",
    }

    // Use sync service for bidirectional transaction
    await syncService.syncBidirectionalTransaction(newTransaction)
    await refreshTransactions()

    // Update or create contact
    await updateContactFromTransaction(to, amount, "send")

    // Simulate transaction confirmation after 3 seconds
    setTimeout(async () => {
      if (syncService) {
        await syncService.updateTransactionStatusGlobally(txHash, "confirmed", 12)
        await refreshTransactions()
      }
    }, 3000)

    return txHash
  }

  // Simulate receiving a transaction (for testing bidirectional visibility)
  const simulateReceiveTransaction = async (from: string, amount: string, tokenAddress?: string, memo?: string) => {
    if (!syncService) return

    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    const receiveTransaction: Omit<Transaction, "_id" | "walletAddress"> = {
      hash: txHash,
      from,
      to: address,
      value: amount,
      timestamp: Date.now(),
      status: "confirmed",
      type: "receive",
      token: tokenAddress,
      tokenSymbol: tokenAddress ? tokens.find((t) => t.address === tokenAddress)?.symbol : currentNetwork.symbol,
      network: currentNetwork.id,
      memo,
      gasUsed: "21000",
      gasPrice: "20",
      fees: "0.00042",
      confirmations: 12,
    }

    await syncService.syncBidirectionalTransaction(receiveTransaction)
    await refreshTransactions()
    await updateContactFromTransaction(from, amount, "receive")
  }

  const refreshBalances = async () => {
    if (!wallet || !address) return

    try {
      // Mock native balance
      setBalance((Math.random() * 5 + 0.1).toFixed(6))

      // Get test tokens for current network and add mock balances
      const testTokens = getTestTokensForNetwork(currentNetwork.id)
      const tokensWithBalances: Token[] = testTokens.map((token) => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        balance: getTokenBalance(token.address),
        icon: token.icon,
        price: token.symbol === "USDC" || token.symbol === "USDT" ? 1.0 : Math.random() * 100,
      }))

      setTokens(tokensWithBalances)

      // Mock NFTs
      const mockNFTs: NFT[] = [
        {
          tokenId: "1",
          contractAddress: "0x...",
          name: "Cool Cat #1234",
          description: "A cool cat NFT",
          image: "/placeholder.svg?height=200&width=200",
          collection: "Cool Cats",
        },
        {
          tokenId: "2",
          contractAddress: "0x...",
          name: "Bored Ape #5678",
          description: "A bored ape NFT",
          image: "/placeholder.svg?height=200&width=200",
          collection: "Bored Ape Yacht Club",
        },
      ]
      setNfts(mockNFTs)
    } catch (error) {
      console.error("Error refreshing balances:", error)
    }
  }

  const refreshTransactions = async () => {
    if (!dbService) return

    try {
      const txs = await dbService.getTransactions()
      setTransactions(txs)
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    }
  }

  const refreshContacts = async () => {
    if (!dbService) return

    try {
      const contactList = await dbService.getContacts()
      setContacts(contactList)
    } catch (error) {
      console.error("Error refreshing contacts:", error)
    }
  }

  const addContact = async (contact: Omit<Contact, "_id" | "walletAddress" | "createdAt" | "updatedAt">) => {
    if (!dbService) return

    try {
      await dbService.addContact(contact)
      await refreshContacts()
    } catch (error) {
      console.error("Error adding contact:", error)
      throw error
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!dbService) return

    try {
      await dbService.updateContact(id, updates)
      await refreshContacts()
    } catch (error) {
      console.error("Error updating contact:", error)
      throw error
    }
  }

  const deleteContact = async (id: string) => {
    if (!dbService) return

    try {
      await dbService.deleteContact(id)
      await refreshContacts()
    } catch (error) {
      console.error("Error deleting contact:", error)
    }
  }

  const getContactByAddress = (address: string): Contact | undefined => {
    return contacts.find((contact) => contact.address.toLowerCase() === address.toLowerCase())
  }

  const updateContactFromTransaction = async (address: string, amount: string, type: "send" | "receive") => {
    if (!dbService) return

    const existingContact = getContactByAddress(address)

    if (existingContact) {
      const updates: Partial<Contact> = {
        lastTransactionDate: Date.now(),
        totalTransactions: existingContact.totalTransactions + 1,
      }

      if (type === "send") {
        updates.totalSent = (Number.parseFloat(existingContact.totalSent) + Number.parseFloat(amount)).toString()
      } else {
        updates.totalReceived = (
          Number.parseFloat(existingContact.totalReceived) + Number.parseFloat(amount)
        ).toString()
      }

      await updateContact(existingContact._id!, updates)
    }
  }

  useEffect(() => {
    if (isUnlocked && address) {
      refreshBalances()
    }
  }, [isUnlocked, address, currentNetwork])

  const value: WalletContextType = {
    wallet,
    address,
    balance,
    isUnlocked,
    networks: NETWORKS,
    currentNetwork,
    tokens,
    nfts,
    transactions,
    contacts,
    dbService,
    syncService,
    createWallet,
    unlockWallet,
    lockWallet,
    switchNetwork,
    addCustomToken,
    sendTransaction,
    refreshBalances,
    refreshTransactions,
    addContact,
    updateContact,
    deleteContact,
    getContactByAddress,
    simulateReceiveTransaction,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
