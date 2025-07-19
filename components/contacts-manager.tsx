"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Star, Send, History, User, Tag } from "lucide-react"
import type { Contact } from "@/lib/mongodb"

export default function ContactsManager() {
  const { contacts, addContact, updateContact, deleteContact, getContactByAddress } = useWallet()
  const { toast } = useToast()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newContact, setNewContact] = useState({
    name: "",
    address: "",
    notes: "",
    tags: [] as string[],
    isFavorite: false,
  })

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.address) {
      toast({
        title: "Error",
        description: "Name and address are required",
        variant: "destructive",
      })
      return
    }

    // Validate address format
    if (!newContact.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Error",
        description: "Invalid Ethereum address format",
        variant: "destructive",
      })
      return
    }

    try {
      await addContact({
        ...newContact,
        totalTransactions: 0,
        totalSent: "0",
        totalReceived: "0",
      })

      setNewContact({
        name: "",
        address: "",
        notes: "",
        tags: [],
        isFavorite: false,
      })
      setShowAddDialog(false)

      toast({
        title: "Success",
        description: "Contact added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      })
    }
  }

  const handleUpdateContact = async () => {
    if (!editingContact) return

    try {
      await updateContact(editingContact._id!, {
        name: editingContact.name,
        notes: editingContact.notes,
        tags: editingContact.tags,
        isFavorite: editingContact.isFavorite,
      })

      setEditingContact(null)

      toast({
        title: "Success",
        description: "Contact updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContact = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      await deleteContact(id)
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  const toggleFavorite = async (contact: Contact) => {
    try {
      await updateContact(contact._id!, { isFavorite: !contact.isFavorite })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contacts</h2>
          <p className="text-muted-foreground">Manage your frequently used addresses</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Add a new contact to your address book</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Enter contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Optional notes about this contact"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddContact} className="w-full">
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      </div>

      {/* Favorites */}
      {contacts.some((c) => c.isFavorite) && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Favorites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contacts
              .filter((c) => c.isFavorite)
              .map((contact) => (
                <Card key={contact._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{formatAddress(contact.address)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Contacts */}
      <div>
        <h3 className="text-lg font-medium mb-3">All Contacts ({filteredContacts.length})</h3>
        {filteredContacts.length > 0 ? (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <Card key={contact._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{contact.name}</span>
                          {contact.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{formatAddress(contact.address)}</div>
                        {contact.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contact.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {contact.totalTransactions > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {contact.totalTransactions} transactions • Sent: {contact.totalSent} • Received:{" "}
                            {contact.totalReceived}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleFavorite(contact)}>
                        <Star className={`w-4 h-4 ${contact.isFavorite ? "text-yellow-500 fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <History className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingContact(contact)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact._id!, contact.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                {searchTerm
                  ? "No contacts match your search."
                  : "No contacts yet. Add your first contact to get started."}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact information</DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAddress">Address</Label>
                <Input id="editAddress" value={editingContact.address} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editingContact.notes || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editFavorite"
                  checked={editingContact.isFavorite}
                  onChange={(e) => setEditingContact({ ...editingContact, isFavorite: e.target.checked })}
                />
                <Label htmlFor="editFavorite">Add to favorites</Label>
              </div>
              <Button onClick={handleUpdateContact} className="w-full">
                Update Contact
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
