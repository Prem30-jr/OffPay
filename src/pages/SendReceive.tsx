"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sender } from "@/components/Sender"
import { Receiver } from "@/components/Receiver"
import { Send, Download, Zap } from "lucide-react"

export default function SendReceive() {
  const [activeTab, setActiveTab] = useState("send")

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Real-time Payments</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Send and receive money instantly using Socket.IO. Experience real-time payment notifications and live balance
          updates.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Money
          </TabsTrigger>
          <TabsTrigger value="receive" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Receive Money
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-800">Sender Mode</CardTitle>
              <CardDescription className="text-blue-600">
                Send money instantly to other users. Transactions are broadcasted in real-time via Socket.IO.
              </CardDescription>
            </CardHeader>
          </Card>
          <Sender />
        </TabsContent>

        <TabsContent value="receive" className="space-y-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-800">Receiver Mode</CardTitle>
              <CardDescription className="text-green-600">
                Watch for incoming payments in real-time. Your balance and transaction history update automatically.
              </CardDescription>
            </CardHeader>
          </Card>
          <Receiver />
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Connect to our Socket.IO server on port 3001</p>
            <p>• Send money instantly to any connected user</p>
            <p>• Receive real-time notifications for incoming payments</p>
            <p>• Watch your balance update automatically</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Real-time payment broadcasting</p>
            <p>• Live connection status indicators</p>
            <p>• Animated transaction notifications</p>
            <p>• Automatic balance synchronization</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
