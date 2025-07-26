"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/hooks/useSocket"
import { useCredits } from "@/hooks/useCredits"
import { useUser } from "@clerk/clerk-react"
import { Send, Wallet, Users } from "lucide-react"
import { toast } from "sonner"

export const Sender: React.FC = () => {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { sendTransaction, isConnected, transactions, connectedUsers } = useSocket()
  const { credits, deductCredits } = useCredits()
  const { user } = useUser()

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !recipient) {
      toast.error("Please fill in all fields")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (amountNum > credits) {
      toast.error("Insufficient credits")
      return
    }

    if (!isConnected) {
      toast.error("Not connected to payment network")
      return
    }

    setIsLoading(true)

    try {
      // Deduct credits locally
      deductCredits(amountNum)

      // Send transaction via Socket.IO
      sendTransaction({
        amount: amountNum,
        sender: user?.username || user?.firstName || "Anonymous",
        recipient: recipient.trim(),
      })

      // Reset form
      setAmount("")
      setRecipient("")
    } catch (error) {
      console.error("Error sending transaction:", error)
      toast.error("Failed to send transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const sentTransactions = transactions.filter((t) => t.type === "send")

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{connectedUsers} users online</span>
        </div>
      </div>

      {/* Send Money Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Money Instantly
          </CardTitle>
          <CardDescription>Send money to anyone in real-time using Socket.IO</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMoney} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="Enter username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm text-gray-600">
                  Available: <span className="font-semibold">${credits.toFixed(2)}</span>
                </span>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isConnected || !amount || !recipient}
                className="min-w-[120px]"
              >
                {isLoading ? "Sending..." : "Send Money"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Sent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sent Transactions</CardTitle>
          <CardDescription>Your recent outgoing payments</CardDescription>
        </CardHeader>
        <CardContent>
          {sentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions sent yet</p>
              <p className="text-sm">Send your first payment above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">To: {transaction.recipient}</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-${transaction.amount.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs">
                      Sent ✅
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
