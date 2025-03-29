"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Camera, QrCode, CheckCircle2, AlertCircle, RefreshCw, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { verifyQRCode } from "@/lib/firebase-service"

// Import jsQR for QR code scanning
import jsQR from "jsqr"

export default function QRCodeScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const router = useRouter()
  const { user } = useAuth()

  // Start camera when component mounts
  useEffect(() => {
    if (!user) return

    return () => {
      // Clean up camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [user])

  const startCamera = async () => {
    try {
      setCameraError(null)
      setScanning(true)

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraPermission(true)
        scanQRCode()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError("Could not access camera. Please check permissions or try a different device.")
      setScanning(false)
      setCameraPermission(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setScanning(false)
    setScanResult(null)
  }

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Check if video is ready
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for QR code scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      if (code) {
        // QR code found
        handleScannedCode(code.data)
        return
      }
    }

    // Continue scanning if no QR code found
    requestAnimationFrame(scanQRCode)
  }

  const handleScannedCode = async (codeData: string) => {
    try {
      setProcessing(true)

      // Play success sound (optional)
      const audio = new Audio("/sounds/beep.mp3")
      audio.play().catch((e) => console.log("Audio play failed:", e))

      // Vibrate if supported (mobile devices)
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      // Verify QR code with backend
      const result = await verifyQRCode(codeData)

      setScanResult(result)
      setScanning(false)

      // Log success
      toast({
        title: "QR Code Verified",
        description: `${result.type === "visitor" ? "Visitor" : "Client"} entry logged successfully.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error verifying QR code:", error)

      setScanResult({
        error: true,
        message: "Invalid or expired QR code. Please try again.",
      })

      toast({
        title: "Verification Failed",
        description: "Invalid or expired QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid QR code.",
        variant: "destructive",
      })
      return
    }

    await handleScannedCode(manualCode.trim())
  }

  const resetScanner = () => {
    setScanResult(null)
    setManualCode("")
    startCamera()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan visitor QR codes to log entry and exit</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
            <CardDescription>
              {scanning ? "Align QR code within the frame" : "Start camera to scan QR code"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!scanning && !scanResult && (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Camera is not active</p>
                    <Button onClick={startCamera} className="mt-2" disabled={processing}>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  </div>
                </div>
              )}

              {scanning && (
                <div className="relative">
                  <div className="relative aspect-video overflow-hidden rounded-md bg-black">
                    <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />

                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-48 w-48 border-2 border-white/50"></div>
                    </div>

                    {/* Status indicator */}
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                      Scanning...
                    </div>

                    {/* Stop button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-2 bg-black/50 text-white hover:bg-black/70"
                      onClick={stopCamera}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Hidden canvas for processing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {cameraError && (
                <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Camera Error</span>
                  </div>
                  <p className="mt-1 text-sm">{cameraError}</p>
                </div>
              )}

              {cameraPermission === false && (
                <div className="rounded-md bg-amber-50 p-4 text-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Camera Permission Denied</span>
                  </div>
                  <p className="mt-1 text-sm">
                    Please allow camera access in your browser settings to use the scanner.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <h3 className="mb-2 font-medium">Manual Entry</h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter QR code manually"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    disabled={processing}
                  />
                  <Button type="submit" disabled={processing || !manualCode.trim()}>
                    Verify
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
            <CardDescription>Verification status and visitor information</CardDescription>
          </CardHeader>
          <CardContent>
            {processing ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-2">Verifying...</span>
              </div>
            ) : scanResult ? (
              scanResult.error ? (
                <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-md border border-dashed border-destructive p-4 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <div>
                    <h3 className="font-medium text-destructive">Verification Failed</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{scanResult.message}</p>
                  </div>
                  <Button onClick={resetScanner}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scan Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md bg-green-50 p-4 text-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Verification Successful</span>
                    </div>
                    <p className="mt-1 text-sm">Entry logged at {new Date().toLocaleTimeString()}</p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">{scanResult.type === "visitor" ? "Visitor" : "Client"} Information</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      {scanResult.type === "visitor" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{scanResult.visitor.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="font-medium">{scanResult.visitor.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Purpose:</span>
                            <span className="font-medium">{scanResult.visitor.purpose}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{scanResult.user.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{scanResult.user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Plot:</span>
                            <span className="font-medium">#{scanResult.plot.number}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => router.push("/manager/dashboard")}>
                      Done
                    </Button>
                    <Button onClick={resetScanner}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan Another
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-4 text-center">
                <QrCode className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">No QR Code Scanned</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start the camera and scan a QR code to see results
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}

