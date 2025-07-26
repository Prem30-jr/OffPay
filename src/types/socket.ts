export interface SocketTransaction {
  id: string
  amount: number
  sender: string
  recipient: string
  timestamp: number
  status: "sent" | "received" | "completed" | "verified"
  type: "send" | "receive"
}

export interface UserData {
  userId: string
  username: string
  email?: string
  socketId?: string
}

export interface PaymentData {
  transactionId: string
  amount: number
  sender: string
  recipient: string
  qrCodeData?: string
}

export interface SocketEvents {
  // Client to Server
  register_user: (userData: UserData) => void
  send_transaction: (transaction: Omit<SocketTransaction, "id" | "timestamp" | "status" | "type">) => void
  complete_qr_payment: (paymentData: PaymentData) => void
  ping: () => void

  // Server to Client
  registration_confirmed: (data: { message: string; connectedUsers: number }) => void
  receive_transaction: (transaction: SocketTransaction) => void
  transaction_sent: (transaction: SocketTransaction) => void
  payment_completed: (paymentData: PaymentData & { timestamp: number; status: string }) => void
  pong: () => void
}
