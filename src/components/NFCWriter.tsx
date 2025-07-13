"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Nfc, Smartphone, CheckCircle, AlertCircle, Loader2, WifiOff, RefreshCw } from "lucide-react"
import { nfcManager, type NFCTransactionData } from "@/utils/nfc"
import { generateId, signTransaction } from "@/utils/crypto"
import { saveTransaction } from "@/utils/storage"
import type { Transaction } from "@/types"

interface NFCWriterProps {
  amount: number
  recipient: string
  description: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

const NFCWriter: React.FC<NFCWriterProps> = ({ amount, recipient, description, onSuccess, onError }) => {
  const [isWriting, setIsWriting] = useState(false)
  const [writeStatus, setWriteStatus] = useState<"idle" | "writing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [nfcSupported, setNfcSupported] = useState<boolean>(false)
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(false)
  const [transactionData, setTransactionData] = useState<NFCTransactionData | null>(null)

  useEffect(() => {
    checkNFCSupport()
  }, [])

  const checkNFCSupport = async () => {
    const supported = nfcManager.isNFCSupported()
    setNfcSupported(supported)

    if (supported) {
      try {
        const availability = await nfcManager.checkNFCAvailability()
        setNfcAvailable(availability.available)
        if (!availability.available && availability.reason) {
          setErrorMessage(availability.reason)
        }
      } catch (error) {
        setNfcAvailable(false)
        setErrorMessage(error.message)
      }
    }
  }

  const prepareTransaction = (): NFCTransactionData => {
    const sender = "wallet_" + Math.random().toString(36).substring(2, 8)

    const transaction: Transaction = {
      id: generateId(),
      amount,
      recipient,
      sender,
      timestamp: Date.now(),
      description: description || "NFC Transfer",
      status: "pending",
    }

    const fakePrivateKey = "sk_demo"
    const signature = signTransaction(transaction, fakePrivateKey)

    return {
      id: transaction.id,
      amount: transaction.amount,
      recipient: transaction.recipient,
      sender: transaction.sender,
      timestamp: transaction.timestamp,
      description: transaction.description,
      signature,
    }
  }

  const handleWriteToNFC = async () => {
    if (!nfcSupported || !nfcAvailable) {
      const error = "NFC is not available on this device"
      setErrorMessage(error)
      setWriteStatus("error")
      onError?.(error)
      return
    }

    setIsWriting(true)
    setWriteStatus("writing")
    setErrorMessage("")

    try {
      const txData = prepareTransaction()
      setTransactionData(txData)

      // Save transaction locally
      const transaction: Transaction = {
        id: txData.id,
        amount: txData.amount,
        recipient: txData.recipient,
        sender: txData.sender,
        timestamp: txData.timestamp,
        description: txData.description,
        status: "pending",
        signature: txData.signature,
      }

      saveTransaction(transaction)

      // Write to NFC tag
      await nfcManager.writeTransactionToNFC(txData)

      setWriteStatus("success")
      onSuccess?.()

      toast({
        title: "NFC Tag Written Successfully!",
        description: `₹${amount.toFixed(2)} transaction ready for tap-to-pay`,
      })
    } catch (error) {
      console.error("NFC write error:", error)
      const errorMsg = error.message || "Failed to write to NFC tag"
      setErrorMessage(errorMsg)
      setWriteStatus("error")
      onError?.(errorMsg)

      toast({
        title: "NFC Write Failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsWriting(false)
    }
  }

  const resetWriter = () => {
    setWriteStatus("idle")
    setErrorMessage("")
    setTransactionData(null)
  }

  if (!nfcSupported) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6 text-center">
          <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">NFC Not Supported</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your browser or device doesn't support NFC functionality.
          </p>
          <Badge variant="outline" className="text-xs">
            Use QR Code instead
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white shadow-lg border-border/50">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="flex items-center text-xl">
            <Nfc className="h-6 w-6 mr-3" />
            NFC Payment Tag
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {writeStatus === "idle" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Nfc className="h-12 w-12 text-blue-600" />
                  <motion.div
                    className="absolute inset-0 border-2 border-blue-300 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to Write NFC Tag</h3>
                <p className="text-sm text-muted-foreground">
                  Tap the button below and bring your NFC tag close to your device
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="text-sm font-medium mb-3">Transaction Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-primary">₹{amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-mono">{recipient.substring(0, 20)}...</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description:</span>
                      <span>{description}</span>
                    </div>
                  )}
                </div>
              </div>

              {!nfcAvailable && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errorMessage || "NFC is not available. Please check your device settings."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {writeStatus === "writing" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <motion.div
                    className="absolute inset-0 border-2 border-blue-300 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">Writing to NFC Tag...</h3>
                <p className="text-sm text-muted-foreground">Keep your NFC tag close to the device</p>
              </div>
            </div>
          )}

          {writeStatus === "success" && transactionData && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-green-600">NFC Tag Written Successfully!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your payment tag is ready. The recipient can now tap their device to receive the payment.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-medium mb-3 text-green-700">Transaction Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Amount:</span>
                    <span className="font-bold text-green-700">₹{transactionData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Transaction ID:</span>
                    <span className="font-mono text-green-700">{transactionData.id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Status:</span>
                    <Badge className="bg-green-500 text-white">Ready for Tap</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Next Steps:</p>
                    <p>
                      Give this NFC tag to the recipient. They can tap their phone on the tag to receive the payment
                      instantly, even without internet connection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {writeStatus === "error" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-red-600">Write Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {errorMessage || "Failed to write transaction to NFC tag"}
                </p>
              </div>

              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || "An error occurred while writing to the NFC tag. Please try again."}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/30">
          {writeStatus === "idle" && (
            <Button
              onClick={handleWriteToNFC}
              disabled={!nfcAvailable || isWriting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              {isWriting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Writing to NFC Tag...
                </>
              ) : (
                <>
                  <Nfc className="mr-2 h-4 w-4" />
                  Write to NFC Tag
                </>
              )}
            </Button>
          )}

          {(writeStatus === "success" || writeStatus === "error") && (
            <Button onClick={resetWriter} className="w-full bg-transparent" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Write Another Tag
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default NFCWriter
