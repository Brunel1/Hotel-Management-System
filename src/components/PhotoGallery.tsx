'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X, Play, Pause, RotateCw } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnail: string
  title: string
  description?: string
  type: 'photo' | '360' | 'video'
}

interface PhotoGalleryProps {
  photos: Photo[]
  roomId?: string
}

export default function PhotoGallery({ photos, roomId }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [is360View, setIs360View] = useState(false)
  const [rotation, setRotation] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  const currentPhoto = photos[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        setIs360View(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      galleryRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handle360Rotation = (delta: number) => {
    setRotation((prev) => prev + delta)
  }

  if (!photos.length) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Aucune photo disponible</p>
      </div>
    )
  }

  return (
    <div ref={galleryRef} className="relative">
      {/* Main Gallery */}
      <div className={`relative rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}>
        {/* Photo/360 View */}
        {is360View && currentPhoto.type === '360' ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-300"
            style={{
              backgroundImage: `url(${currentPhoto.url})`,
              transform: `rotateY(${rotation}deg)`
            }}
          >
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <button
                onClick={() => handle360Rotation(-15)}
                className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <RotateCw className="w-6 h-6" />
              </button>
              <button
                onClick={() => handle360Rotation(15)}
                className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <RotateCw className="w-6 h-6 rotate-180" />
              </button>
            </div>
          </div>
        ) : (
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white text-xl font-semibold mb-1">{currentPhoto.title}</h3>
            {currentPhoto.description && (
              <p className="text-white/80 text-sm">{currentPhoto.description}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {currentPhoto.type === '360' && (
            <button
              onClick={() => setIs360View(!is360View)}
              className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
              title={is360View ? 'Quitter vue 360°' : 'Vue 360°'}
            >
              <RotateCw className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            title="Plein écran"
          >
            {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Auto-play */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          title={isPlaying ? 'Pause' : 'Lecture automatique'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
              index === currentIndex
                ? 'ring-2 ring-indigo-600 ring-offset-2'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={photo.thumbnail}
              alt={photo.title}
              className="w-24 h-16 object-cover"
            />
            {photo.type === '360' && (
              <div className="absolute top-1 right-1">
                <RotateCw className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
            {photo.type === 'video' && (
              <div className="absolute top-1 right-1">
                <Play className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Auto-play effect */}
      {isPlaying && (
        <div className="sr-only">
          {useEffect(() => {
            const interval = setInterval(() => {
              goToNext()
            }, 3000)
            return () => clearInterval(interval)
          }, [currentIndex])}
        </div>
      )}
    </div>
  )
}
