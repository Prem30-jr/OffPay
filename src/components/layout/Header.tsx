"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { UserButton, useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, QrCode, ScanLine, History, User, Activity, Split, Zap } from "lucide-react"
import { NetworkStatus } from "@/components/NetworkStatus"
import { CreditDisplay } from "@/components/CreditDisplay"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isSignedIn } = useUser()

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Generate QR", href: "/generate", icon: QrCode },
    { name: "Scan QR", href: "/scan", icon: ScanLine },
    { name: "Send/Receive", href: "/send-receive", icon: Zap, badge: "New" },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Split Bill", href: "/split-bill", icon: Split },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Profile", href: "/profile", icon: User },
  ]

  const isActive = (path: string) => location.pathname === path

  if (!isSignedIn) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">OP</span>
          </div>
          <span className="font-bold text-xl">OffPay</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} to={item.href}>
                <Button variant={isActive(item.href) ? "default" : "ghost"} size="sm" className="relative">
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <NetworkStatus />
          <CreditDisplay />
          <UserButton afterSignOutUrl="/auth" />

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="text-lg font-semibold">Navigation</div>
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className="w-full justify-start relative"
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.name}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
