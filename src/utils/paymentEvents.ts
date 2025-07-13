type PaymentEventType = "paymentSent" | "paymentReceived" | "qrExpired" | "nfcTagWritten" | "nfcTagRead"

interface PaymentEventData {
  transactionId: string
  amount: number
  sender: string
  recipient: string
  timestamp?: number
  method?: "qr" | "nfc"
}

class PaymentEventManager {
  private listeners: Map<PaymentEventType, Set<(data: any) => void>> = new Map()

  constructor() {
    // Initialize listener sets for each event type
    this.listeners.set("paymentSent", new Set())
    this.listeners.set("paymentReceived", new Set())
    this.listeners.set("qrExpired", new Set())
    this.listeners.set("nfcTagWritten", new Set())
    this.listeners.set("nfcTagRead", new Set())
  }

  subscribe(eventType: PaymentEventType, callback: (data: any) => void): () => void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.add(callback)
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  private emit(eventType: PaymentEventType, data: any): void {
    console.log(`🎯 PaymentEventManager: Emitting ${eventType}`, data)

    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error)
        }
      })
    }

    // Also emit as DOM events for broader compatibility
    const domEvent = new CustomEvent(eventType, { detail: data })
    window.dispatchEvent(domEvent)
    document.dispatchEvent(domEvent)
  }

  emitPaymentSent(
    transactionId: string,
    amount: number,
    recipient: string,
    sender: string,
    method: "qr" | "nfc" = "qr",
  ): void {
    const data: PaymentEventData = {
      transactionId,
      amount,
      recipient,
      sender,
      timestamp: Date.now(),
      method,
    }

    this.emit("paymentSent", data)
  }

  emitPaymentReceived(
    transactionId: string,
    amount: number,
    recipient: string,
    sender: string,
    method: "qr" | "nfc" = "qr",
  ): void {
    const data: PaymentEventData = {
      transactionId,
      amount,
      recipient,
      sender,
      timestamp: Date.now(),
      method,
    }

    console.log(`💰 PaymentEventManager: Payment received via ${method}`, data)
    this.emit("paymentReceived", data)
  }

  emitQRExpired(transactionId: string): void {
    this.emit("qrExpired", { transactionId, timestamp: Date.now() })
  }

  emitNFCTagWritten(transactionId: string, amount: number, recipient: string): void {
    const data = {
      transactionId,
      amount,
      recipient,
      timestamp: Date.now(),
      method: "nfc" as const,
    }

    console.log("📱 PaymentEventManager: NFC tag written", data)
    this.emit("nfcTagWritten", data)
  }

  emitNFCTagRead(transactionId: string, amount: number, sender: string): void {
    const data = {
      transactionId,
      amount,
      sender,
      timestamp: Date.now(),
      method: "nfc" as const,
    }

    console.log("📱 PaymentEventManager: NFC tag read", data)
    this.emit("nfcTagRead", data)
  }

  // Get all active listeners count for debugging
  getListenerCounts(): Record<PaymentEventType, number> {
    const counts: Record<string, number> = {}
    this.listeners.forEach((listeners, eventType) => {
      counts[eventType] = listeners.size
    })
    return counts as Record<PaymentEventType, number>
  }

  // Clear all listeners (useful for cleanup)
  clearAllListeners(): void {
    this.listeners.forEach((listeners) => listeners.clear())
  }
}

export const paymentEventManager = new PaymentEventManager()

// Export types for use in components
export type { PaymentEventType, PaymentEventData }
