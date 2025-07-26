"use client"

import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/hooks/useSocket"
import { useUser } from "@clerk/clerk-react"
import { Download, Share2, Copy, QrCode, Zap } from "lucide-react"
import { toast } from "sonner"

export function QRGenerator() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [qrData, setQrData] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const { socket, isConnected } = useSocket()
  const { user } = useUser()

  const generateQR = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsGenerating(true)

    try {
      const paymentData = {
        type: "payment_request",
        amount: Number.parseFloat(amount),
        recipient: user?.username || user?.firstName || "Anonymous",
        recipientId: user?.id,
        description: description.trim() || "Payment Request",
        timestamp: Date.now(),
        id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      const qrString = JSON.stringify(paymentData)
      setQrData(qrString)

      toast.success("QR Code generated successfully!")
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `payment-qr-${amount}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const copyQRData = () => {
    if (!qrData) return

    navigator.clipboard.writeText(qrData)
    toast.success("QR data copied to clipboard!")
  }

  const shareQR = async () => {
    if (!navigator.share || !qrData) {
      copyQRData()
      return
    }

    try {
      await navigator.share({
        title: "Payment Request",
        text: `Payment request for $${amount}${description ? ` - ${description}` : ""}`,
        url: window.location.href,
      })
    } catch (error) {
      console.error("Error sharing:", error)
      copyQRData()
    }
  }

  const handleCompletePayment = (paymentData: any) => {
    if (socket && isConnected) {
      socket.emit("complete_qr_payment", paymentData)
      toast.success("Payment completed and broadcasted!")
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm text-gray-600">{isConnected ? "Connected to payment network" : "Disconnected"}</span>
        {isConnected && (
          <Badge variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Real-time
          </Badge>
        )}
      </div>

      {/* QR Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate Payment QR Code
          </CardTitle>
          <CardDescription>Create a QR code for others to scan and send you money instantly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="What's this payment for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <Button onClick={generateQR} disabled={isGenerating || !amount} className="w-full">
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated QR Code */}
      {qrData && (
        <Card>
          <CardHeader>
            <CardTitle>Your Payment QR Code</CardTitle>
            <CardDescription>
              Share this QR code for others to send you ${amount}
              {description && ` for ${description}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center" ref={qrRef}>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <QRCodeSVG value={qrData} size={200} level="M" includeMargin={true} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={downloadQR}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={shareQR}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={copyQRData}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Data
              </Button>
            </div>

            {/* QR Code Info */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p>
                <strong>Amount:</strong> ${amount}
              </p>
              <p>
                <strong>Recipient:</strong> {user?.username || user?.firstName || "Anonymous"}
              </p>
              {description && (
                <p>
                  <strong>Description:</strong> {description}
                </p>
              )}
              <p>
                <strong>Status:</strong>
                <Badge variant="outline" className="ml-2">
                  {isConnected ? "Live" : "Offline"}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
