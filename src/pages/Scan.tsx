"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import QRScanner from "@/components/QRScanner"
import NFCReader from "@/components/NFCReader"
import Header from "@/components/layout/Header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QrCode, Nfc, Camera, AlertCircle, Smartphone, Shield } from "lucide-react"

const Scan = () => {
  const [showPermissionHelp, setShowPermissionHelp] = useState(false)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        stream.getTracks().forEach((track) => track.stop())
        setShowPermissionHelp(false)
      }
    } catch (err) {
      console.error("Camera permission check failed:", err)
      setShowPermissionHelp(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Receive Payment</h1>
          <p className="text-muted-foreground">Scan a QR code or tap an NFC tag to receive secure payments</p>
        </motion.div>

        {showPermissionHelp && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-md mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Camera Permission Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to scan QR codes. Look for the camera icon in your
                address bar to manage permissions.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Scanner
              </TabsTrigger>
              <TabsTrigger value="nfc" className="flex items-center gap-2">
                <Nfc className="h-4 w-4" />
                NFC Reader
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="space-y-6">
              <QRScanner />

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Camera className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">QR Code Scanning</h4>
                      <p className="text-muted-foreground mb-2">
                        Point your camera at a payment QR code to instantly receive transaction details. The app will
                        automatically detect and process valid payment codes.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Automatic QR code detection</li>
                        <li>• Secure signature verification</li>
                        <li>• Instant balance updates</li>
                        <li>• Works in low light conditions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nfc" className="space-y-6">
              <NFCReader />

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Nfc className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">NFC Tag Reading</h4>
                      <p className="text-muted-foreground mb-2">
                        Tap your phone on an NFC payment tag to instantly receive payments. NFC provides the fastest and
                        most convenient payment experience.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Instant tap-to-receive payments</li>
                        <li>• No camera or scanning required</li>
                        <li>• Works completely offline</li>
                        <li>• Ultra-fast transaction processing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium">Secure Verification</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  All transactions are cryptographically signed and verified before processing. Your payments are
                  protected against tampering and fraud.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Device Compatibility</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  QR scanning works on all devices with cameras. NFC reading requires NFC-enabled devices and modern
                  browsers with Web NFC support.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium mb-2 text-orange-700">Browser Compatibility Note</h4>
                  <p className="text-muted-foreground">
                    NFC functionality requires a modern browser with Web NFC API support (Chrome 89+, Edge 89+). If NFC
                    is not available, the app will automatically fall back to QR code scanning.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Scan
