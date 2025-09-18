"use client"

import React from "react"
import { useState, useRef, useCallback } from "react"
import Image from "next/image"

export default function PhotographyReveal() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [showUploadUI, setShowUploadUI] = useState(false)
  const [windowSize, setWindowSize] = useState(210)
  const windowRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (file.type.startsWith("image/")) {
          setUploadedImage(result)
          setUploadedVideo(null)
        } else if (file.type.startsWith("video/")) {
          setUploadedVideo(result)
          setUploadedImage(null)
        }
        setShowUploadUI(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!windowRef.current || !containerRef.current) return

    setIsDragging(true)
    const rect = windowRef.current.getBoundingClientRect()

    setDragOffset({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    },
    [handleStart],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      if (touch) {
        handleStart(touch.clientX, touch.clientY)
      }
    },
    [handleStart],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()

      const newX = Math.max(
        windowSize / 2,
        Math.min(containerRect.width - windowSize / 2, clientX - containerRect.left - dragOffset.x),
      )

      const newY = Math.max(
        windowSize / 2,
        Math.min(containerRect.height - windowSize / 2, clientY - containerRect.top - dragOffset.y),
      )

      setPosition({ x: newX, y: newY })
    },
    [isDragging, dragOffset, windowSize],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    },
    [handleMove],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      if (touch) {
        handleMove(touch.clientX, touch.clientY)
      }
    },
    [handleMove],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleEnd)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleEnd, { passive: false })

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleEnd)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd])

  React.useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && typeof window !== "undefined") {
        const rect = containerRef.current.getBoundingClientRect()
        const isMobile =
          window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const newWindowSize = isMobile ? Math.min(window.innerWidth * 0.35, 140) : 210
        setWindowSize(newWindowSize)
        setPosition({
          x: rect.width / 2,
          y: rect.height / 2,
        })
      }
    }

    updatePosition()
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updatePosition)
      window.addEventListener("orientationchange", updatePosition)
      return () => {
        window.removeEventListener("resize", updatePosition)
        window.removeEventListener("orientationchange", updatePosition)
      }
    }
  }, [])

  const maskSize = windowSize / 2

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden cursor-crosshair select-none touch-none overscroll-none"
      style={{
        touchAction: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      <div className="absolute inset-0">
        {uploadedVideo ? (
          <video src={uploadedVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <Image
            src={uploadedImage || "/images/todaiback2.jpg"}
            alt="Background image"
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      <div className="absolute inset-0">
        {uploadedVideo ? (
          <video
            src={uploadedVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover blur-md"
            style={{
              clipPath: `polygon(0% 0%, 0% 100%, ${position.x - maskSize}px 100%, ${position.x - maskSize}px ${position.y - maskSize}px, ${position.x + maskSize}px ${position.y - maskSize}px, ${position.x + maskSize}px ${position.y + maskSize}px, ${position.x - maskSize}px ${position.y + maskSize}px, ${position.x - maskSize}px 100%, 100% 100%, 100% 0%)`,
            }}
          />
        ) : (
          <Image
            src={uploadedImage || "/images/todaiback2.jpg"}
            alt="Blurred background"
            fill
            className="object-cover blur-md"
            style={{
              clipPath: `polygon(0% 0%, 0% 100%, ${position.x - maskSize}px 100%, ${position.x - maskSize}px ${position.y - maskSize}px, ${position.x + maskSize}px ${position.y - maskSize}px, ${position.x + maskSize}px ${position.y + maskSize}px, ${position.x - maskSize}px ${position.y + maskSize}px, ${position.x - maskSize}px 100%, 100% 100%, 100% 0%)`,
            }}
          />
        )}
      </div>

      <div className="absolute inset-0 z-20">
        <img
          src="/images/asset-3.svg"
          alt="Background overlay"
          className="h-full w-full md:max-w-full object-contain brightness-0 invert opacity-100 mb-[-7px] ml-[-20px] mt-[-9px]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>

      <div
        ref={windowRef}
        className={`absolute cursor-grab active:cursor-grabbing pointer-events-auto touch-manipulation z-30`}
        style={{
          width: windowSize,
          height: windowSize,
          left: position.x - windowSize / 2,
          top: position.y - windowSize / 2,
          transform: "translate3d(0, 0, 0)",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute inset-0 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 77.86 77.86"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect
              x="3.89"
              y="3.89"
              width="70.07"
              height="70.07"
              fill="none"
              stroke="white"
              strokeWidth="7.79"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>

      <div className="absolute top-4 md:bottom-8 right-4 md:right-8 flex flex-col gap-2 md:gap-3 items-end z-40">
        <div className="text-white font-mono text-xs md:text-sm bg-black/60 backdrop-blur-sm px-2 md:px-4 py-2 md:py-2 rounded-lg max-w-[200px] md:max-w-none text-right border border-white/20">
          <div>四角をドラッグしてみてください！</div>
          <div className="text-xs opacity-80 mt-1">Try to drag the square shape!</div>
        </div>

        <button
          onClick={triggerFileInput}
          className="bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white font-mono text-xs md:text-sm px-2 md:px-4 py-2 md:py-2 rounded-lg border border-white/40 transition-colors min-h-[40px] md:min-h-[44px] touch-manipulation shadow-lg pointer-events-auto relative z-50"
        >
          <div>{uploadedImage || uploadedVideo ? "メディアを変更" : "画像・動画をアップロード"}</div>
          <div className="text-xs opacity-80 mt-1">
            {uploadedImage || uploadedVideo ? "Change Media" : "Upload Image/Video"}
          </div>
        </button>
      </div>

      <div className="absolute top-4 md:top-8 left-4 md:left-8 z-10">
        <img src="/images/logo.svg" alt="Logo" className="w-[202px] md:w-[202px] h-auto brightness-0 invert" />
      </div>

      <div
        className="absolute bottom-4 md:bottom-8 left-4 md:left-8 z-50"
        style={{
          bottom:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "16px" // Fixed bottom margin for mobile to ensure full display
              : undefined,
        }}
      >
        {typeof window !== "undefined" && window.innerWidth < 768 ? (
          <img
            src="/images/mobile-bottom.svg"
            alt="Mobile bottom content"
            className="w-full max-w-[280px] h-auto brightness-0 invert"
          />
        ) : (
          <a
            href="https://www.instagram.com/iiiexhibition/"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity pointer-events-auto relative z-50"
          >
            <img
              src="/images/asset-3-instagram.svg"
              alt="Instagram link"
              className="w-[101px] md:w-[202px] h-auto brightness-0 invert pointer-events-auto"
            />
          </a>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
