"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSocket } from "@/hooks/useSocket"
import { useUser } from "@clerk/clerk-react"
import { useCredits } from "@/hooks/useCredits"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Download, Wallet, Bell, Users } from "lucide-react"

interface ReceivedTransaction {
  id: string
  amount: number
  sender: string
  recipient: string
  timestamp: number
  description: string
  status: string
}

const Receiver: React.FC = () => {
  const { user } = useUser()
  const { credits, addCredits } = useCredits()
  const { transactions, isConnected, connectedUsers } = useSocket()
  const [newTransactionId, setNewTransactionId] = useState<string | null>(null)

  const receivedTransactions = transactions.filter((t) => t.type === "receive")

  // Handle new transaction animation
  useEffect(() => {
    if (receivedTransactions.length > 0) {
      const latestTransaction = receivedTransactions[0]
      setNewTransactionId(latestTransaction.id)

      // Add credits for received transaction
      addCredits(latestTransaction.amount)

      // Clear animation after 3 seconds
      const timer = setTimeout(() => {
        setNewTransactionId(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [transactions]) // Updated dependency to transactions

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-gray-600">{isConnected ? "Listening for payments" : "Disconnected"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{connectedUsers} users online</span>
        </div>
      </div>

      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Current Balance
          </CardTitle>
          <CardDescription>Your available credits update in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <motion.div
              key={credits}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold text-green-600"
            >
              ${credits.toFixed(2)}
            </motion.div>
            <p className="text-sm text-gray-600 mt-2">Available Credits</p>
          </div>
        </CardContent>
      </Card>

      {/* Live Transaction Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Live Payment Feed
          </CardTitle>
          <CardDescription>Incoming payments appear here instantly</CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <p>Not connected to payment network</p>
              <p className="text-sm">Please check your connection</p>
            </div>
          ) : receivedTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <p>Waiting for incoming payments...</p>
              <p className="text-sm">You'll be notified instantly when money arrives</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {receivedTransactions.slice(0, 10).map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      backgroundColor: newTransactionId === transaction.id ? "#f0fdf4" : "#f9fafb",
                    }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      newTransactionId === transaction.id
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          newTransactionId === transaction.id ? "bg-green-100" : "bg-blue-100"
                        }`}
                        animate={
                          newTransactionId === transaction.id
                            ? {
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 0.5 }}
                      >
                        <Download
                          className={`w-6 h-6 ${
                            newTransactionId === transaction.id ? "text-green-600" : "text-blue-600"
                          }`}
                        />
                      </motion.div>
                      <div>
                        <p className="font-medium">From: {transaction.sender}</p>
                        <p className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.p
                        className="font-semibold text-green-600 text-lg"
                        animate={
                          newTransactionId === transaction.id
                            ? {
                                scale: [1, 1.1, 1],
                              }
                            : {}
                        }
                        transition={{ duration: 0.3 }}
                      >
                        +${transaction.amount.toFixed(2)}
                      </motion.p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          newTransactionId === transaction.id
                            ? "border-green-500 text-green-700"
                            : "border-blue-500 text-blue-700"
                        }`}
                      >
                        {newTransactionId === transaction.id ? "New! 💰" : "Received 💰"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Receiver
