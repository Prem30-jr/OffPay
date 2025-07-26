const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

app.use(cors())
app.use(express.json())

// Store connected users and their socket IDs
const connectedUsers = new Map()

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Handle user registration with their wallet ID
  socket.on("register_user", (userData) => {
    console.log(`User registered: ${userData.userId} with socket ${socket.id}`)
    connectedUsers.set(userData.userId, {
      socketId: socket.id,
      ...userData,
    })

    // Send confirmation back to user
    socket.emit("registration_confirmed", {
      message: "Successfully connected to payment network",
      connectedUsers: connectedUsers.size,
    })
  })

  // Handle transaction sending
  socket.on("send_transaction", (transactionData) => {
    console.log("Transaction received:", transactionData)

    // Broadcast to all other clients (excluding sender)
    socket.broadcast.emit("receive_transaction", {
      ...transactionData,
      timestamp: Date.now(),
      status: "completed",
    })

    // Send confirmation back to sender
    socket.emit("transaction_sent", {
      ...transactionData,
      timestamp: Date.now(),
      status: "sent",
    })

    console.log(
      `Transaction broadcasted: ${transactionData.amount} from ${transactionData.sender} to ${transactionData.recipient}`,
    )
  })

  // Handle QR code payment completion
  socket.on("complete_qr_payment", (paymentData) => {
    console.log("QR Payment completed:", paymentData)

    // Broadcast payment completion to all clients
    io.emit("payment_completed", {
      ...paymentData,
      timestamp: Date.now(),
      status: "verified",
    })

    console.log(`QR Payment completed and broadcasted: ${paymentData.transactionId}`)
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)

    // Remove user from connected users
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        connectedUsers.delete(userId)
        break
      }
    }
  })

  // Handle ping for connection health
  socket.on("ping", () => {
    socket.emit("pong")
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`📡 Ready for real-time payment transactions`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Server closed")
  })
})
