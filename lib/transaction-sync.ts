"use client"

import { DatabaseService } from "./database-service"
import type { Transaction } from "./mongodb"

// Transaction synchronization service for bidirectional visibility
export class TransactionSyncService {
  private dbService: DatabaseService

  constructor(walletAddress: string) {
    this.dbService = new DatabaseService(walletAddress)
  }

  // Sync transaction to both sender and receiver wallets
  async syncBidirectionalTransaction(transaction: Omit<Transaction, "_id" | "walletAddress">) {
    try {
      // Add transaction to sender's wallet
      await this.dbService.addTransaction(transaction)

      // Also add the transaction to receiver's perspective if it's a send transaction
      if (transaction.type === "send") {
        const receiverTransaction: Omit<Transaction, "_id" | "walletAddress"> = {
          ...transaction,
          type: "receive",
        }

        // Create a new database service for the receiver
        const receiverDbService = new DatabaseService(transaction.to)
        await receiverDbService.addTransaction(receiverTransaction)
      }

      // If it's a receive transaction, add to sender's perspective
      if (transaction.type === "receive") {
        const senderTransaction: Omit<Transaction, "_id" | "walletAddress"> = {
          ...transaction,
          type: "send",
        }

        const senderDbService = new DatabaseService(transaction.from)
        await senderDbService.addTransaction(senderTransaction)
      }
    } catch (error) {
      console.error("Error syncing bidirectional transaction:", error)
      throw error
    }
  }

  // Get all transactions involving a specific address (both sent and received)
  async getTransactionsWithAddress(address: string): Promise<Transaction[]> {
    try {
      return await this.dbService.getTransactionsByAddress(address)
    } catch (error) {
      console.error("Error fetching transactions with address:", error)
      return []
    }
  }

  // Update transaction status across all related wallets
  async updateTransactionStatusGlobally(hash: string, status: Transaction["status"], confirmations?: number) {
    try {
      // This would update the transaction status in all wallets that have this transaction
      // For now, we'll update it in the current wallet
      await this.dbService.updateTransactionStatus(hash, status, confirmations)

      // In a real implementation, you'd query all wallets that have this transaction hash
      // and update the status in each one
    } catch (error) {
      console.error("Error updating transaction status globally:", error)
    }
  }
}
