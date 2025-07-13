"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import QRGenerator from "@/components/QRGenerator"
import NFCWriter from "@/components/NFCWriter"
import Header from "@/components/layout/Header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, Nfc, Smartphone, Wifi } from "lucide-react"

const Generate = () => {
  const [amount, setAmount] = useState<string>("")
  const [recipient, setRecipient] = useState<string>("")
  const [description, setDescription] = useState<string>("")

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
          <h1 className="text-3xl font-bold mb-2">Generate Payment</h1>
          <p className="text-muted-foreground">Create a secure transaction using QR code or NFC technology</p>
        </motion.div>

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
                QR Code
              </TabsTrigger>
              <TabsTrigger value="nfc" className="flex items-center gap-2">
                <Nfc className="h-4 w-4" />
                NFC Tag
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="space-y-6">
              <QRGenerator />

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <QrCode className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">About QR Code Payments</h4>
                      <p className="text-muted-foreground mb-2">
                        QR codes work on any device with a camera and don't require special hardware. Perfect for
                        universal compatibility and quick sharing.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Works on all smartphones</li>
                        <li>• No special hardware required</li>
                        <li>• Easy to share via messaging apps</li>
                        <li>• 30-second expiry for security</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nfc" className="space-y-6">
              <NFCWriter
                amount={Number.parseFloat(amount) || 0}
                recipient={recipient || "Unknown Recipient"}
                description={description || "NFC Payment"}
                onSuccess={() => {
                  console.log("NFC tag written successfully")
                }}
                onError={(error) => {
                  console.error("NFC write error:", error)
                }}
              />

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Nfc className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">About NFC Payments</h4>
                      <p className="text-muted-foreground mb-2">
                        NFC (Near Field Communication) enables instant tap-to-pay functionality. Write payment data to
                        an NFC tag for ultra-fast transactions.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Instant tap-to-pay experience</li>
                        <li>• Works completely offline</li>
                        <li>• Secure encrypted data transfer</li>
                        <li>• Reusable NFC tags</li>
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
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Offline-First Design</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Both QR codes and NFC tags work without internet connection. Transactions are stored locally and
                  synced when online.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wifi className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium">Auto-Sync Technology</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  When internet is restored, all offline transactions automatically sync with the blockchain for
                  permanent record keeping.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Generate
