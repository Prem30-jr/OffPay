"use client"

import { useEffect, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { useUser } from "@clerk/clerk-react"
import { toast } from "sonner"

interface SocketTransaction {
  id: string
  amount: number
  sender: string
  recipient: string
  timestamp: number
  status: "sent" | "received" | "completed" | "verified"
  type: "send" | "receive"
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  sendTransaction: (transaction: Omit<SocketTransaction, "id" | "timestamp" | "status" | "type">) => void
  transactions: SocketTransaction[]
  connectedUsers: number
}

const SOCKET_URL = "http://localhost:3001"

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [transactions, setTransactions] = useState<SocketTransaction[]>([])
  const [connectedUsers, setConnectedUsers] = useState(0)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    setSocket(socketInstance)

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server")
      setIsConnected(true)

      // Register user with server
      socketInstance.emit("register_user", {
        userId: user.id,
        username: user.username || user.firstName || "Anonymous",
        email: user.primaryEmailAddress?.emailAddress,
      })

      toast.success("Connected to payment network")
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server")
      setIsConnected(false)
      toast.error("Disconnected from payment network")
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
      toast.error("Failed to connect to payment network")
    })

    // Registration confirmation
    socketInstance.on("registration_confirmed", (data) => {
      console.log("Registration confirmed:", data)
      setConnectedUsers(data.connectedUsers)
      toast.success(data.message)
    })

    // Transaction event handlers
    socketInstance.on("receive_transaction", (transactionData) => {
      console.log("Received transaction:", transactionData)

      const newTransaction: SocketTransaction = {
        id: `recv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...transactionData,
        type: "receive",
        status: "received",
      }

      setTransactions((prev) => [newTransaction, ...prev])
      toast.success(`💰 Received $${transactionData.amount} from ${transactionData.sender}`)
    })

    socketInstance.on("transaction_sent", (transactionData) => {
      console.log("Transaction sent confirmation:", transactionData)

      const newTransaction: SocketTransaction = {
        id: `sent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...transactionData,
        type: "send",
        status: "sent",
      }

      setTransactions((prev) => [newTransaction, ...prev])
      toast.success(`✅ Sent $${transactionData.amount} to ${transactionData.recipient}`)
    })

    socketInstance.on("payment_completed", (paymentData) => {
      console.log("Payment completed:", paymentData)
      toast.success(`🎉 Payment verified: $${paymentData.amount}`)
    })

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const sendTransaction = useCallback(
    (transaction: Omit<SocketTransaction, "id" | "timestamp" | "status" | "type">) => {
      if (!socket || !isConnected) {
        toast.error("Not connected to payment network")
        return
      }

      socket.emit("send_transaction", transaction)
    },
    [socket, isConnected],
  )

  return {
    socket,
    isConnected,
    sendTransaction,
    transactions,
    connectedUsers,
  }
}
