'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Search,
  Loader2,
  Check,
  CheckCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface Contact {
  id: string
  name: string
  avatar: string | null
  role: string
}

interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  subject: string | null
  isRead: boolean
  senderRole: string
  createdAt: string
}

export function MessagesPage() {
  const [contacts, setContacts] = useState<(Contact & { lastMessage?: string; lastTime?: string; unread?: boolean })[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const [mobileShowChat, setMobileShowChat] = useState(false)

  const { goBack, params } = useAppStore()
  const { user } = useAuthStore()
  const playClick = useSoundEffect('click')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Handle initial params (e.g., navigating from teacher profile with ?with=userId)
  const initialContactId = params?.with as string | undefined

  useEffect(() => {
    fetchContacts()
    if (initialContactId) {
      // We'll set the contact after contacts are loaded
    }
    // Start polling
    pollIntervalRef.current = setInterval(() => {
      fetchContacts(true)
      if (selectedContact) {
        fetchMessages(selectedContact.id, true)
      }
    }, 5000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (contacts.length > 0 && initialContactId && !selectedContact) {
      const contact = contacts.find(c => c.id === initialContactId)
      if (contact) {
        selectContact(contact)
      }
    }
  }, [contacts, initialContactId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchContacts = async (silent = false) => {
    if (!silent) setLoadingContacts(true)
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      if (!silent) setLoadingContacts(false)
    }
  }

  const fetchMessages = async (contactId: string, silent = false) => {
    if (!silent) setLoadingMessages(true)
    try {
      const res = await fetch(`/api/messages?with=${contactId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      if (!silent) setLoadingMessages(false)
    }
  }

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setMobileShowChat(true)
    playClick()
    fetchMessages(contact.id)
    // Clear unread count display for this contact
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread: false } : c))
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedContact || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedContact.id,
          content: messageInput.trim(),
          subject: null,
        }),
      })
      if (res.ok) {
        setMessageInput('')
        fetchMessages(selectedContact.id)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const goBackToList = () => {
    setMobileShowChat(false)
    setSelectedContact(null)
    fetchContacts()
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return `${Math.max(1, Math.floor(diff / 60000))}m`
    if (hours < 24) return `${hours}h`
    if (hours < 168) return `${Math.floor(hours / 24)}d`
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 md:px-6 pb-0"
      >
        <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden p-4 md:px-6 gap-0 md:gap-4">
        {/* Contact List - Desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`w-full md:w-80 shrink-0 border rounded-2xl overflow-hidden flex flex-col ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl pl-9 h-9"
              />
            </div>
          </div>

          {/* Contact Items */}
          <ScrollArea className="flex-1">
            {loadingContacts ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No contacts found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Visit a teacher&apos;s profile to start a conversation
                </p>
              </div>
            ) : (
              <div className="p-1.5">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => selectContact(contact)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      selectedContact?.id === contact.id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.unread && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{contact.name}</span>
                        <Badge className="text-[9px] rounded-full border-0 bg-muted text-muted-foreground shrink-0">
                          {contact.role}
                        </Badge>
                      </div>
                      {contact.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {contact.lastMessage}
                        </p>
                      )}
                    </div>
                    {contact.lastTime && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {contact.lastTime}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>

        {/* Chat Panel - Desktop */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className={`flex-1 border rounded-2xl overflow-hidden flex flex-col ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-3 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 rounded-full"
                  onClick={goBackToList}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedContact.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedContact.role}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                {loadingMessages ? (
                  <div className="space-y-3 py-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className="h-10 w-48 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Say hello to {selectedContact.name}!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] md:max-w-[70%] px-3.5 py-2.5 rounded-2xl ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}>
                            {msg.subject && (
                              <p className={`text-xs font-medium mb-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {msg.subject}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                              <span className={`text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('en-NG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && (
                                msg.isRead
                                  ? <CheckCheck className="w-3 h-3 text-primary-foreground/60" />
                                  : <Check className="w-3 h-3 text-primary-foreground/60" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Message ${selectedContact.name}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="rounded-xl flex-1"
                    autoFocus
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sending}
                    size="icon"
                    className="rounded-full h-10 w-10 shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">Select a Conversation</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Choose a contact from the list to start chatting, or visit a teacher&apos;s profile to send a message.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
