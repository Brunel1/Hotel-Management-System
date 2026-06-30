declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google {
  namespace maps {
    interface MapOptions {
      center: { lat: number; lng: number }
      zoom: number
      styles?: any[]
    }

    class Map {
      constructor(element: HTMLElement, options: MapOptions)
    }

    namespace marker {
      class AdvancedMarkerElement {
        constructor(options: { map: Map; position: { lat: number; lng: number }; title: string })
      }
    }

    class Marker {
      constructor(options: { position: { lat: number; lng: number }; map: Map; title: string; animation?: any })
    }

    const Animation: {
      DROP: number
    }
  }
}

declare const google: typeof google

export {}
