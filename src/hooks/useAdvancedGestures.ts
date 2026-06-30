/**
 * Hook pour les gestures avancés
 * Swipe navigation, pinch-to-zoom, shake to refresh, long press
 */

import { useEffect, useRef, useState, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface PinchHandlers {
  onPinchIn?: (scale: number) => void
  onPinchOut?: (scale: number) => void
}

interface LongPressHandlers {
  onLongPress?: () => void
  delay?: number
}

/**
 * Hook pour les gestures de swipe
 */
export function useSwipeGestures(handlers: SwipeHandlers, threshold: number = 50) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (Math.max(absDeltaX, absDeltaY) < threshold) return

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight()
      } else if (deltaX < 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft()
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && handlers.onSwipeDown) {
        handlers.onSwipeDown()
      } else if (deltaY < 0 && handlers.onSwipeUp) {
        handlers.onSwipeUp()
      }
    }

    touchStartRef.current = null
  }, [handlers, threshold])

  return { handleTouchStart, handleTouchEnd }
}

/**
 * Hook pour le pinch-to-zoom
 */
export function usePinchZoom(handlers: PinchHandlers) {
  const [scale, setScale] = useState(1)
  const initialDistanceRef = useRef<number | null>(null)
  const initialScaleRef = useRef(1)

  const getDistance = useCallback((touches: TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches)
      initialScaleRef.current = scale
    }
  }, [scale, getDistance])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      const currentDistance = getDistance(e.touches)
      const newScale = initialScaleRef.current * (currentDistance / initialDistanceRef.current)
      
      // Limiter le zoom entre 0.5x et 3x
      const clampedScale = Math.max(0.5, Math.min(3, newScale))
      setScale(clampedScale)

      if (clampedScale < initialScaleRef.current && handlers.onPinchIn) {
        handlers.onPinchIn(clampedScale)
      } else if (clampedScale > initialScaleRef.current && handlers.onPinchOut) {
        handlers.onPinchOut(clampedScale)
      }
    }
  }, [getDistance, handlers])

  const handleTouchEnd = useCallback(() => {
    initialDistanceRef.current = null
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
  }, [])

  return { scale, handleTouchStart, handleTouchMove, handleTouchEnd, resetZoom }
}

/**
 * Hook pour le shake to refresh
 */
export function useShakeToRefresh(onShake: () => void, threshold: number = 15) {
  const lastXRef = useRef(0)
  const lastYRef = useRef(0)
  const lastTimeRef = useRef(0)
  const shakeCountRef = useRef(0)

  useEffect(() => {
    let animationFrameId: number

    const handleMotion = (event: DeviceMotionEvent) => {
      const currentX = event.accelerationIncludingGravity?.x || 0
      const currentY = event.accelerationIncludingGravity?.y || 0
      const currentTime = new Date().getTime()

      if (lastTimeRef.current !== 0) {
        const deltaTime = currentTime - lastTimeRef.current
        const deltaX = Math.abs(currentX - lastXRef.current)
        const deltaY = Math.abs(currentY - lastYRef.current)

        if (deltaTime > 100 && (deltaX > threshold || deltaY > threshold)) {
          shakeCountRef.current++

          if (shakeCountRef.current >= 3) {
            onShake()
            shakeCountRef.current = 0
          }
        } else if (deltaTime > 500) {
          shakeCountRef.current = 0
        }
      }

      lastXRef.current = currentX
      lastYRef.current = currentY
      lastTimeRef.current = currentTime
    }

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion)
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [onShake, threshold])
}

/**
 * Hook pour le long press
 */
export function useLongPress(handlers: LongPressHandlers) {
  const { onLongPress, delay = 500 } = handlers
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress()
      }
    }, delay)
  }, [onLongPress, delay])

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  }
}

/**
 * Hook combiné pour tous les gestures avancés
 */
export function useAdvancedGestures(
  swipeHandlers?: SwipeHandlers,
  pinchHandlers?: PinchHandlers,
  shakeHandler?: () => void,
  longPressHandler?: () => void
) {
  const swipeGestures = useSwipeGestures(swipeHandlers || {})
  const pinchZoom = usePinchZoom(pinchHandlers || {})
  const longPress = useLongPress({ onLongPress: longPressHandler })

  useShakeToRefresh(shakeHandler || (() => {}))

  return {
    ...swipeGestures,
    ...pinchZoom,
    longPress,
  }
}
