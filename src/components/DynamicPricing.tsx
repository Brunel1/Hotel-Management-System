'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, TrendingDown } from 'lucide-react'

interface PriceSuggestion {
  roomId: string
  roomName: string
  basePrice: number
  suggestedPrice: number
  changePercent: number
}

export default function DynamicPricing() {
  const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pricing/suggestions')
      .then(res => res.json())
      .then(setSuggestions)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4">Chargement...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pricing Dynamique</h2>
      {suggestions.map(s => (
        <div key={s.roomId} className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{s.roomName}</p>
              <p className="text-sm text-gray-500">Base: {s.basePrice}€</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{s.suggestedPrice}€</p>
              <p className={`text-sm ${s.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
