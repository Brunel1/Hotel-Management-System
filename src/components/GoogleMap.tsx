'use client'

import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  address?: string
  lat?: number
  lng?: number
  zoom?: number
  height?: string
}

// Indicateur global pour éviter le chargement multiple
let googleMapsLoaded = false
let googleMapsLoading = false
let initGoogleMapCallback: (() => void) | null = null

export default function GoogleMap({
  address = '123 Rue de l\'Hôtel, Mahajanga, Madagascar',
  lat = -15.7167,
  lng = 46.3167,
  zoom = 15,
  height = '400px',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    // Charger Google Maps API
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined') {
        // Vérifier si l'API key est définie
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          console.error('Google Maps API key non définie')
          setLoadError(true)
          return
        }

        // Si déjà chargé, initialiser directement
        if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
          googleMapsLoaded = true
          initMap()
          return
        }

        // Si déjà en cours de chargement, attendre
        if (googleMapsLoading) {
          const checkInterval = setInterval(() => {
            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
              clearInterval(checkInterval)
              initMap()
            }
          }, 200)
          return
        }

        // Charger le script avec callback
        if (!googleMapsLoaded && !googleMapsLoading) {
          googleMapsLoading = true

          // Définir la fonction callback globalement
          ;(window as any).initGoogleMapCallback = () => {
            googleMapsLoaded = true
            googleMapsLoading = false
            console.log('Google Maps API chargée avec succès')
            // Attendre un peu pour s'assurer que l'API est prête
            setTimeout(() => {
              initMap()
            }, 100)
          }

          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initGoogleMapCallback&loading=async`
          script.async = true
          script.defer = true
          script.setAttribute('referrerpolicy', 'origin-when-cross-origin')
          script.onerror = () => {
            googleMapsLoading = false
            setLoadError(true)
            console.error('Erreur lors du chargement de Google Maps API')
          }
          document.head.appendChild(script)
        }
      }
    }

    const initMap = () => {
      if (!mapRef.current) return

      // Vérifier que l'API est complètement chargée
      if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Map) {
        console.error('Google Maps API pas encore prête')
        return
      }

      // Si la carte est déjà initialisée, ne pas la recréer
      if (mapInstanceRef.current) {
        return
      }

      try {
        const mapOptions: any = {
          center: { lat, lng },
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }

        console.log('Initialisation de la carte...')
        mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, mapOptions)

        // Utiliser l'ancien Marker (plus stable)
        new (window as any).google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: 'Notre Hôtel',
          animation: (window as any).google.maps.Animation.DROP,
        })
        console.log('Carte initialisée avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error)
        setLoadError(true)
      }
    }

    loadGoogleMaps()

    return () => {
      // Nettoyage
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, zoom])

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md">
      <div ref={mapRef} style={{ height, width: '100%' }} className="bg-gray-200" />
      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          Erreur lors du chargement de la carte. Veuillez vérifier votre connexion internet.
        </div>
      )}
      <div className="p-4 bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Adresse :</strong> {address}
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          Obtenir l'itinéraire →
        </a>
      </div>
    </div>
  )
}
