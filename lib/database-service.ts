"use client"

import type { Transaction, Contact, Purchase } from "./mongodb"

// Client-side database service that calls API routes
export class DatabaseService {
  private walletAddress: string

  constructor(walletAddress: string) {
    this.walletAddress = walletAddress
  }

  // Transaction methods
  async addTransaction(transaction: Omit<Transaction, "_id" | "walletAddress">): Promise<Transaction> {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...transaction, walletAddress: this.walletAddress }),
    })
    return response.json()
  }

  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    const response = await fetch(
      `/api/transactions?walletAddress=${this.walletAddress}&limit=${limit}&offset=${offset}`,
    )
    return response.json()
  }

  async updateTransactionStatus(hash: string, status: Transaction["status"], confirmations?: number): Promise<void> {
    await fetch("/api/transactions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, status, confirmations, walletAddress: this.walletAddress }),
    })
  }

  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    const response = await fetch(`/api/transactions/by-address?walletAddress=${this.walletAddress}&address=${address}`)
    return response.json()
  }

  // Contact methods
  async addContact(contact: Omit<Contact, "_id" | "walletAddress" | "createdAt" | "updatedAt">): Promise<Contact> {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...contact,
        walletAddress: this.walletAddress,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    })
    return response.json()
  }

  async getContacts(): Promise<Contact[]> {
    const response = await fetch(`/api/contacts?walletAddress=${this.walletAddress}`)
    return response.json()
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    await fetch("/api/contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        updates: { ...updates, updatedAt: Date.now() },
        walletAddress: this.walletAddress,
      }),
    })
  }

  async deleteContact(id: string): Promise<void> {
    await fetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, walletAddress: this.walletAddress }),
    })
  }

  async getFrequentContacts(limit = 10): Promise<Contact[]> {
    const response = await fetch(`/api/contacts/frequent?walletAddress=${this.walletAddress}&limit=${limit}`)
    return response.json()
  }

  // Purchase methods
  async addPurchase(purchase: Omit<Purchase, "_id" | "walletAddress">): Promise<Purchase> {
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...purchase, walletAddress: this.walletAddress }),
    })
    return response.json()
  }

  async getPurchases(): Promise<Purchase[]> {
    const response = await fetch(`/api/purchases?walletAddress=${this.walletAddress}`)
    return response.json()
  }

  async updatePurchaseStatus(id: string, status: Purchase["status"], transactionHash?: string): Promise<void> {
    await fetch("/api/purchases", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, transactionHash, walletAddress: this.walletAddress }),
    })
  }

  // Analytics methods
  async getTransactionStats(): Promise<{
    totalSent: string
    totalReceived: string
    totalTransactions: number
    recentActivity: Array<{ date: string; count: number }>
    topContacts: Array<{ address: string; name?: string; count: number }>
  }> {
    const response = await fetch(`/api/analytics/transactions?walletAddress=${this.walletAddress}`)
    return response.json()
  }
}
