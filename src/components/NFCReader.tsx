"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Nfc, CheckCircle, AlertCircle, Loader2, WifiOff, RefreshCw, Lock, Smartphone } from "lucide-react"
import { nfcManager, type NFCTransactionData } from "@/utils/nfc"
import { verifySignature } from "@/utils/crypto"
import { addReceivedTransaction } from "@/utils/storage"
import { paymentEventManager } from "@/utils/paymentEvents"
import { notificationService } from "@/utils/notifications"
import { useCredits } from "@/hooks/useCredits"
import type { Transaction } from "@/types"

const NFCReader: React.FC = () => {
  const [isReading, setIsReading] = useState(false)
  const [readStatus, setReadStatus] = useState<"idle" | "reading" | "found" | "processing" | "success" | "error">(
    "idle",
  )
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [nfcSupported, setNfcSupported] = useState<boolean>(false)
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(false)
  const [transactionData, setTransactionData] = useState<NFCTransactionData | null>(null)
  const [password, setPassword] = useState<string>("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<boolean>(false)
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const stopReadingRef = useRef<(() => void) | null>(null)
  const { updateCredits } = useCredits()

  useEffect(() => {
    checkNFCSupport()

    return () => {
      if (stopReadingRef.current) {
        stopReadingRef.current()
      }
    }
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

  const startNFCReading = async () => {
    if (!nfcSupported || !nfcAvailable) {
      const error = "NFC is not available on this device"
      setErrorMessage(error)
      setReadStatus("error")
      return
    }

    setIsReading(true)
    setReadStatus("reading")
    setErrorMessage("")

    try {
      const stopReading = await nfcManager.startNFCReading((data: NFCTransactionData) => {
        console.log("NFC transaction data received:", data)
        setTransactionData(data)
        setReadStatus("found")
        setShowPasswordPrompt(true)

        // Play notification sound
        notificationService.playNotificationSound()

        toast({
          title: "NFC Tag Detected!",
          description: `Payment request for ₹${data.amount.toFixed(2)} found`,
        })
      })

      stopReadingRef.current = stopReading

      toast({
        title: "NFC Reading Started",
        description: "Bring an NFC payment tag close to your device",
      })
    } catch (error) {
      console.error("NFC reading error:", error)
      const errorMsg = error.message || "Failed to start NFC reading"
      setErrorMessage(errorMsg)
      setReadStatus("error")
      setIsReading(false)

      toast({
        title: "NFC Reading Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const stopNFCReading = () => {
    if (stopReadingRef.current) {
      stopReadingRef.current()
      stopReadingRef.current = null
    }
    setIsReading(false)
    setReadStatus("idle")
  }

  const handlePasswordSubmit = () => {
    if (password === "2239") {
      setShowPasswordPrompt(false)
      setReadStatus("processing")
      processNFCTransaction()
    } else {
      setErrorMessage("Invalid password. Please try again.")
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect. Please try again.",
        variant: "destructive",
      })
    }
  }

  const processNFCTransaction = async () => {
    if (!transactionData) return

    try {
      setReadStatus("processing")

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify signature
      const isValid = verifySignature(transactionData, transactionData.signature, "pk_demo")

      if (!isValid) {
        throw new Error("Invalid transaction signature")
      }

      // Create transaction object
      const transaction: Transaction = {
        id: transactionData.id,
        amount: transactionData.amount,
        recipient: transactionData.recipient,
        sender: transactionData.sender,
        timestamp: transactionData.timestamp,
        description: transactionData.description,
        status: "verified",
        signature: transactionData.signature,
      }

      // Update credits
      updateCredits(transaction)

      // Add to transaction history
      addReceivedTransaction(transaction)

      // Emit payment events
      paymentEventManager.emitPaymentReceived(
        transaction.id,
        transaction.amount,
        transaction.recipient,
        transaction.sender,
      )

      setPaymentDetails({
        amount: transaction.amount,
        sender: transaction.sender,
        recipient: transaction.recipient,
        timestamp: Date.now(),
        transactionId: transaction.id,
      })

      setReadStatus("success")
      setPaymentComplete(true)

      // Stop NFC reading
      stopNFCReading()

      // Play success notification
      notificationService.notifyPaymentReceived(transaction.amount, transaction.sender)

      toast({
        title: "Payment Received Successfully!",
        description: `₹${transaction.amount.toFixed(2)} received via NFC`,
      })
    } catch (error) {
      console.error("Error processing NFC transaction:", error)
      setErrorMessage(error.message || "Failed to process NFC transaction")
      setReadStatus("error")

      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process the NFC transaction",
        variant: "destructive",
      })
    }
  }

  const resetReader = () => {
    stopNFCReading()
    setReadStatus("idle")
    setErrorMessage("")
    setTransactionData(null)
    setPassword("")
    setShowPasswordPrompt(false)
    setPaymentComplete(false)
    setPaymentDetails(null)
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
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center text-xl">
            <Nfc className="h-6 w-6 mr-3" />
            NFC Payment Reader
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {readStatus === "idle" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Nfc className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to Read NFC Tags</h3>
                <p className="text-sm text-muted-foreground">
                  Tap the button below to start scanning for NFC payment tags
                </p>
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

          {readStatus === "reading" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="relative mx-auto w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Nfc className="h-12 w-12 text-green-600" />
                  <motion.div
                    className="absolute inset-0 border-2 border-green-300 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">Scanning for NFC Tags...</h3>
                <p className="text-sm text-muted-foreground">Bring an NFC payment tag close to your device</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">How to use:</p>
                    <p>
                      Hold the NFC payment tag close to the back of your phone. The tag will be detected automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(readStatus === "found" || showPasswordPrompt) && transactionData && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">NFC Payment Found</h3>
                <p className="text-sm text-muted-foreground mb-4">Enter your password to process the payment</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="text-sm font-medium mb-3">Payment Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-primary">₹{transactionData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-mono">{transactionData.sender.substring(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span>{transactionData.description}</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-xs mx-auto mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password (2239)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit()
                    }
                  }}
                />
              </div>
            </div>
          )}

          {readStatus === "processing" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Processing Payment...</h3>
                <p className="text-sm text-muted-foreground">Verifying transaction and updating your wallet</p>
              </div>
            </div>
          )}

          {readStatus === "success" && paymentComplete && paymentDetails && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.5 }}>
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-medium mb-2 text-green-600">Payment Received Successfully!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The NFC payment has been processed and added to your wallet
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-medium mb-3 text-green-700">Payment Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Amount Received:</span>
                    <span className="font-bold text-green-700">₹{paymentDetails.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">From:</span>
                    <span className="font-mono text-green-700">{paymentDetails.sender.substring(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Transaction ID:</span>
                    <span className="font-mono text-green-700">{paymentDetails.transactionId.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Status:</span>
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {readStatus === "error" && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-red-600">Reading Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {errorMessage || "Failed to read NFC tag or process payment"}
                </p>
              </div>

              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || "An error occurred while reading the NFC tag. Please try again."}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/30">
          {readStatus === "idle" && (
            <Button
              onClick={startNFCReading}
              disabled={!nfcAvailable}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
            >
              <Nfc className="mr-2 h-4 w-4" />
              Start NFC Reading
            </Button>
          )}

          {readStatus === "reading" && (
            <Button onClick={stopNFCReading} className="w-full bg-transparent" variant="outline">
              Stop Reading
            </Button>
          )}

          {showPasswordPrompt && (
            <Button
              onClick={handlePasswordSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              <Lock className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          )}

          {(readStatus === "success" || readStatus === "error") && (
            <Button onClick={resetReader} className="w-full bg-transparent" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Read Another Tag
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default NFCReader
