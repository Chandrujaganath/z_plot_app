"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Video, RefreshCw, AlertCircle, Maximize, Volume2, VolumeX } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getManagerProjects, getProjectCameras } from "@/lib/firebase-service"
import type { Project, Camera } from "@/lib/models"

export default function CCTVMonitorPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  // Fetch manager's projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const projectsData = await getManagerProjects(user.uid)
        setProjects(projectsData)

        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id)
        }
      } catch (err) {
        console.error("Error fetching projects:", err)
        setError("Failed to load projects. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  // Fetch cameras when selected project changes
  useEffect(() => {
    const fetchCameras = async () => {
      if (!selectedProjectId) return

      try {
        setLoading(true)
        setError(null)

        const camerasData = await getProjectCameras(selectedProjectId)
        setCameras(camerasData)
      } catch (err) {
        console.error("Error fetching cameras:", err)
        setError("Failed to load camera feeds. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCameras()
  }, [selectedProjectId])

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CCTV Monitoring</h1>
        <p className="text-muted-foreground">View live camera feeds from your assigned projects</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <Select
            value={selectedProjectId}
            onValueChange={handleProjectChange}
            disabled={loading || projects.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {cameras.length > 0 && (
            <span>
              {cameras.length} camera{cameras.length !== 1 ? "s" : ""} available
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-md border">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-md border">
          <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : cameras.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-md border">
          <Video className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No cameras available for this project</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {cameras.map((camera) => (
            <CameraFeed key={camera.id} camera={camera} />
          ))}
        </div>
      )}

      <Toaster />
    </div>
  )
}

interface CameraFeedProps {
  camera: Camera
}

function CameraFeed({ camera }: CameraFeedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [error, setError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePlay = () => {
    if (!videoRef.current) return

    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true)
        setError(false)
      })
      .catch((err) => {
        console.error("Error playing video:", err)
        setError(true)
        toast({
          title: "Playback Error",
          description: "Failed to play camera feed. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleError = () => {
    setError(true)
    setIsPlaying(false)
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => {
          console.error("Error attempting to enable fullscreen:", err)
        })
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => {
          console.error("Error attempting to exit fullscreen:", err)
        })
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{camera.name}</CardTitle>
        <CardDescription>{camera.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className={`relative overflow-hidden rounded-md bg-black ${
            isFullscreen ? "fixed inset-0 z-50" : "aspect-video"
          }`}
        >
          {!isPlaying && !error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Video className="mb-2 h-12 w-12 text-white/50" />
              <Button variant="outline" className="bg-black/50 text-white hover:bg-black/70" onClick={handlePlay}>
                Play Feed
              </Button>
            </div>
          ) : null}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AlertCircle className="mb-2 h-12 w-12 text-red-500/70" />
              <p className="text-white/70">Camera feed unavailable</p>
              <Button variant="outline" className="mt-2 bg-black/50 text-white hover:bg-black/70" onClick={handlePlay}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : null}

          <video
            ref={videoRef}
            className="h-full w-full"
            src={camera.streamUrl}
            muted={isMuted}
            playsInline
            onError={handleError}
            controls={isPlaying && !error}
          />

          {isPlaying && !error && (
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

