import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ClerkProvider } from "@clerk/clerk-react"
import { Toaster } from "@/components/ui/sonner"
import { AuthWrapper } from "@/components/auth/AuthWrapper"
import { Header } from "@/components/layout/Header"
import Index from "@/pages/Index"
import Auth from "@/pages/Auth"
import Generate from "@/pages/Generate"
import Scan from "@/pages/Scan"
import Transactions from "@/pages/Transactions"
import Profile from "@/pages/Profile"
import Activity from "@/pages/Activity"
import SplitBill from "@/pages/SplitBill"
import SendReceive from "@/pages/SendReceive"
import NotFound from "@/pages/NotFound"
import "./App.css"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pb-20">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <AuthWrapper>
                    <Index />
                  </AuthWrapper>
                }
              />
              <Route
                path="/generate"
                element={
                  <AuthWrapper>
                    <Generate />
                  </AuthWrapper>
                }
              />
              <Route
                path="/scan"
                element={
                  <AuthWrapper>
                    <Scan />
                  </AuthWrapper>
                }
              />
              <Route
                path="/transactions"
                element={
                  <AuthWrapper>
                    <Transactions />
                  </AuthWrapper>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthWrapper>
                    <Profile />
                  </AuthWrapper>
                }
              />
              <Route
                path="/activity"
                element={
                  <AuthWrapper>
                    <Activity />
                  </AuthWrapper>
                }
              />
              <Route
                path="/split-bill"
                element={
                  <AuthWrapper>
                    <SplitBill />
                  </AuthWrapper>
                }
              />
              <Route
                path="/send-receive"
                element={
                  <AuthWrapper>
                    <SendReceive />
                  </AuthWrapper>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </ClerkProvider>
  )
}

export default App
