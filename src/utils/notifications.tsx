class NotificationService {
  private audioContext: AudioContext | null = null
  private soundEnabled = true

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudio()
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn("Audio context not supported:", error)
    }
  }

  private async playTone(frequency: number, duration: number, volume = 0.1): Promise<void> {
    if (!this.audioContext || !this.soundEnabled) return

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume()
      }

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.warn("Failed to play notification sound:", error)
    }
  }

  async playNotificationSound(): Promise<void> {
    await this.playTone(800, 0.2)
  }

  async playSuccessSound(): Promise<void> {
    await this.playTone(600, 0.15)
    setTimeout(() => this.playTone(800, 0.15), 100)
    setTimeout(() => this.playTone(1000, 0.2), 200)
  }

  async playErrorSound(): Promise<void> {
    await this.playTone(300, 0.3)
    setTimeout(() => this.playTone(250, 0.3), 200)
  }

  async playNFCSound(): Promise<void> {
    // Play a distinctive NFC sound pattern
    await this.playTone(1200, 0.1)
    setTimeout(() => this.playTone(1000, 0.1), 80)
  }

  async notifyPaymentReceived(amount: number, sender: string): Promise<void> {
    await this.playSuccessSound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💰 Payment Received!", {
        body: `₹${amount.toFixed(2)} received from ${sender.substring(0, 8)}...`,
        icon: "/favicon.ico",
        tag: "payment-received",
      })
    }
  }

  async notifyPaymentSent(amount: number, recipient: string): Promise<void> {
    await this.playSuccessSound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💸 Payment Sent!", {
        body: `₹${amount.toFixed(2)} sent to ${recipient.substring(0, 8)}...`,
        icon: "/favicon.ico",
        tag: "payment-sent",
      })
    }
  }

  async notifyQRGenerated(amount: number): Promise<void> {
    await this.playNotificationSound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("📱 QR Code Generated", {
        body: `Payment QR for ₹${amount.toFixed(2)} is ready`,
        icon: "/favicon.ico",
        tag: "qr-generated",
      })
    }
  }

  async notifyNFCTagWritten(amount: number): Promise<void> {
    await this.playNFCSound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("📱 NFC Tag Written", {
        body: `Payment tag for ₹${amount.toFixed(2)} created successfully`,
        icon: "/favicon.ico",
        tag: "nfc-written",
      })
    }
  }

  async notifyNFCTagRead(amount: number): Promise<void> {
    await this.playNFCSound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("📱 NFC Payment Detected", {
        body: `Payment request for ₹${amount.toFixed(2)} found`,
        icon: "/favicon.ico",
        tag: "nfc-read",
      })
    }
  }

  async notifyError(message: string): Promise<void> {
    await this.playErrorSound()

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("❌ Error", {
        body: message,
        icon: "/favicon.ico",
        tag: "error",
      })
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled
  }
}

export const notificationService = new NotificationService()
