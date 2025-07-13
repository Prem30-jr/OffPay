import { NDEFReader, NDEFWriter } from "ndef"

export interface NFCTransactionData {
  id: string
  amount: number
  sender: string
  recipient: string
  timestamp: number
  description: string
  signature: string
}

export class NFCManager {
  private static instance: NFCManager
  private reader: NDEFReader | null = null
  private isSupported = false

  constructor() {
    this.checkNFCSupport()
  }

  static getInstance(): NFCManager {
    if (!NFCManager.instance) {
      NFCManager.instance = new NFCManager()
    }
    return NFCManager.instance
  }

  private checkNFCSupport(): void {
    this.isSupported = "NDEFReader" in window
    console.log("NFC Support:", this.isSupported)
  }

  isNFCSupported(): boolean {
    return this.isSupported
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error("NFC is not supported on this device")
    }

    try {
      const permission = await navigator.permissions.query({ name: "nfc" as PermissionName })
      return permission.state === "granted"
    } catch (error) {
      console.warn("Permission API not available, assuming NFC permission granted")
      return true
    }
  }

  async writeTransactionToNFC(transactionData: NFCTransactionData): Promise<void> {
    if (!this.isSupported) {
      throw new Error("NFC is not supported on this device")
    }

    try {
      const writer = new NDEFWriter()
      const message = {
        records: [
          {
            recordType: "text",
            data: JSON.stringify({
              type: "offpay_transaction",
              version: "1.0",
              data: transactionData,
            }),
          },
        ],
      }

      await writer.write(message)
      console.log("Transaction written to NFC tag successfully")
    } catch (error) {
      console.error("Failed to write to NFC tag:", error)
      throw new Error(`Failed to write to NFC tag: ${error.message}`)
    }
  }

  async startNFCReading(onTransactionRead: (data: NFCTransactionData) => void): Promise<() => void> {
    if (!this.isSupported) {
      throw new Error("NFC is not supported on this device")
    }

    try {
      this.reader = new NDEFReader()

      const abortController = new AbortController()

      await this.reader.scan({ signal: abortController.signal })

      this.reader.addEventListener("reading", ({ message }) => {
        console.log("NFC tag detected")

        for (const record of message.records) {
          if (record.recordType === "text") {
            try {
              const decoder = new TextDecoder()
              const text = decoder.decode(record.data)
              const parsedData = JSON.parse(text)

              if (parsedData.type === "offpay_transaction" && parsedData.data) {
                console.log("Valid Off-Pay transaction found on NFC tag")
                onTransactionRead(parsedData.data)
                return
              }
            } catch (error) {
              console.warn("Failed to parse NFC data:", error)
            }
          }
        }
      })

      this.reader.addEventListener("readingerror", (error) => {
        console.error("NFC reading error:", error)
      })

      console.log("NFC reading started")

      return () => {
        abortController.abort()
        this.reader = null
        console.log("NFC reading stopped")
      }
    } catch (error) {
      console.error("Failed to start NFC reading:", error)
      throw new Error(`Failed to start NFC reading: ${error.message}`)
    }
  }

  async checkNFCAvailability(): Promise<{ available: boolean; reason?: string }> {
    if (!this.isSupported) {
      return { available: false, reason: "NFC not supported by browser" }
    }

    try {
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        return { available: false, reason: "NFC permission denied" }
      }

      return { available: true }
    } catch (error) {
      return { available: false, reason: error.message }
    }
  }
}

export const nfcManager = NFCManager.getInstance()
