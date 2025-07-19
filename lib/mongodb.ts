import { MongoClient, type Db, type Collection } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Database helper functions
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("oc-wallet")
}

export async function getCollection<T = any>(name: string): Promise<Collection<T>> {
  const db = await getDatabase()
  return db.collection<T>(name)
}

// Transaction interface
export interface Transaction {
  _id?: string
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: "pending" | "confirmed" | "failed"
  type: "send" | "receive"
  token?: string
  tokenSymbol?: string
  gasUsed?: string
  gasPrice?: string
  fees?: string
  network: string
  blockNumber?: number
  confirmations?: number
  memo?: string
  walletAddress: string // The wallet this transaction belongs to
}

// Contact interface
export interface Contact {
  _id?: string
  name: string
  address: string
  avatar?: string
  tags: string[]
  notes?: string
  lastTransactionDate?: number
  totalTransactions: number
  totalSent: string
  totalReceived: string
  isFavorite: boolean
  walletAddress: string // The wallet this contact belongs to
  createdAt: number
  updatedAt: number
}

// Wallet interface
export interface WalletData {
  _id?: string
  address: string
  encryptedPrivateKey: string
  createdAt: number
  lastAccessedAt: number
  settings: {
    currency: string
    notifications: boolean
    biometric: boolean
    autoLock: number
  }
  networks: string[]
  customTokens: Array<{
    address: string
    symbol: string
    name: string
    decimals: number
    network: string
  }>
}

// Purchase interface
export interface Purchase {
  _id?: string
  provider: string
  fiatAmount: string
  fiatCurrency: string
  cryptoAmount: string
  cryptoCurrency: string
  status: "pending" | "completed" | "failed" | "processing"
  paymentMethod: string
  timestamp: number
  transactionHash?: string
  fees: string
  walletAddress: string
  providerTransactionId?: string
}
